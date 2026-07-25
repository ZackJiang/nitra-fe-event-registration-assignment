import { computed, reactive, ref } from 'vue'
import { isWizardStepId, WIZARD_STEPS } from '../constants/wizard.js'
import { addons } from '../mocks/addons.js'
import { event } from '../mocks/event.js'
import { sessions } from '../mocks/sessions.js'
import {
  findScheduleConflicts,
  groupItemsByUtcDate,
  hasScheduleConflict,
  isAtCapacity,
} from '../utils/registrationSchedule.js'
import { calculatePricingBreakdown } from '../utils/registrationPricing.js'
import {
  hasSelectedMerchandise,
  validateRegistration,
} from '../utils/registrationValidation.js'

const CONFIRMATION_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Create a fresh registration state object.
 *
 * @param {Array<{ id: string }> | null | undefined} addonData
 * @returns {import('../types/registration.js').RegistrationState}
 */
export function createInitialRegistrationState(addonData) {
  const addonSelections = Array.isArray(addonData)
    ? Object.fromEntries(addonData.map((addon) => [
      addon.id,
      { quantity: 0, size: null },
    ]))
    : {}

  return {
    currentStep: 1,
    attendee: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      shippingAddress: '',
    },
    ticketTypeId: null,
    selectedSessionIds: [],
    addonSelections,
    hasAttemptedSubmit: false,
    submission: {
      status: 'idle',
      confirmationId: null,
    },
  }
}

/**
 * Generate a display-only registration confirmation ID.
 *
 * @param {() => number} [random=Math.random]
 * @returns {string}
 */
export function createConfirmationId(random = Math.random) {
  const suffix = Array.from({ length: 5 }, () => {
    const randomIndex = Math.min(
      Math.floor(random() * CONFIRMATION_CHARACTERS.length),
      CONFIRMATION_CHARACTERS.length - 1,
    )

    return CONFIRMATION_CHARACTERS[Math.max(randomIndex, 0)]
  }).join('')

  return `WDS2028-${suffix}`
}

/**
 * Own all registration state and business actions for the four-step wizard.
 *
 * @param {Object} [options]
 * @param {typeof event} [options.eventData]
 * @param {typeof sessions} [options.sessionData]
 * @param {typeof addons} [options.addonData]
 * @param {() => string} [options.confirmationIdFactory]
 * @returns {Object}
 */
export function useRegistrationWizard({
  eventData = event,
  sessionData = sessions,
  addonData = addons,
  confirmationIdFactory = createConfirmationId,
} = {}) {
  const normalizedSessions = Array.isArray(sessionData) ? sessionData : []
  const normalizedAddons = Array.isArray(addonData) ? addonData : []
  const initialState = createInitialRegistrationState(normalizedAddons)

  const currentStep = ref(initialState.currentStep)
  const attendee = reactive(initialState.attendee)
  const ticketTypeId = ref(initialState.ticketTypeId)
  const selectedSessionIds = ref(initialState.selectedSessionIds)
  const addonSelections = reactive(initialState.addonSelections)
  const hasAttemptedSubmit = ref(initialState.hasAttemptedSubmit)
  const submission = reactive(initialState.submission)

  const selectedTicket = computed(() => (
    Array.isArray(eventData?.ticketTypes)
      ? eventData.ticketTypes.find((ticket) => ticket.id === ticketTypeId.value) ?? null
      : null
  ))

  const selectedSessions = computed(() => {
    const selectedIds = new Set(selectedSessionIds.value)
    return normalizedSessions.filter((session) => selectedIds.has(session.id))
  })

  const selectedAddons = computed(() => normalizedAddons.flatMap((addon) => {
    const selection = addonSelections[addon.id]

    if (!selection || !Number.isInteger(selection.quantity) || selection.quantity <= 0) {
      return []
    }

    return [{
      addon,
      selection,
    }]
  }))

  const groupedSessions = computed(() => groupItemsByUtcDate(normalizedSessions))

  const hasSelectedMerchandiseValue = computed(() => (
    hasSelectedMerchandise(addonSelections, normalizedAddons)
  ))

  const scheduleConflicts = computed(() => {
    const sessionConflicts = findScheduleConflicts(selectedSessions.value)
    const workshopConflicts = selectedAddons.value
      .filter(({ addon }) => addon.category === 'workshop')
      .flatMap(({ addon }) => selectedSessions.value.flatMap((session) => (
        hasScheduleConflict(addon, [session])
          ? [{ workshopId: addon.id, sessionId: session.id }]
          : []
      )))

    return {
      sessions: sessionConflicts,
      workshops: workshopConflicts,
    }
  })

  const pricingBreakdown = computed(() => calculatePricingBreakdown({
    eventData,
    addonData: normalizedAddons,
    ticketTypeId: ticketTypeId.value,
    addonSelections,
  }))

  const validationIssues = computed(() => validateRegistration({
    state: {
      currentStep: currentStep.value,
      attendee,
      ticketTypeId: ticketTypeId.value,
      selectedSessionIds: selectedSessionIds.value,
      addonSelections,
      hasAttemptedSubmit: hasAttemptedSubmit.value,
      submission,
    },
    eventData,
    sessionData: normalizedSessions,
    addonData: normalizedAddons,
  }))

  const visibleValidationIssues = computed(() => (
    hasAttemptedSubmit.value ? validationIssues.value : []
  ))

  const errorStepIds = computed(() => (
    [...new Set(visibleValidationIssues.value.map((issue) => issue.stepId))]
      .sort((firstStep, secondStep) => firstStep - secondStep)
  ))

  const isRegistrationValid = computed(() => validationIssues.value.length === 0)
  const isSubmitDisabled = computed(() => (
    hasAttemptedSubmit.value && !isRegistrationValid.value
  ))

  /**
   * Navigate to a valid wizard step.
   *
   * @param {unknown} stepId
   * @returns {boolean}
   */
  function goToStep(stepId) {
    if (!isWizardStepId(stepId)) {
      return false
    }

    currentStep.value = stepId
    return true
  }

  /**
   * Move forward one step without triggering validation.
   *
   * @returns {number}
   */
  function nextStep() {
    currentStep.value = Math.min(currentStep.value + 1, WIZARD_STEPS.length)
    return currentStep.value
  }

  /**
   * Move back one step.
   *
   * @returns {number}
   */
  function previousStep() {
    currentStep.value = Math.max(currentStep.value - 1, 1)
    return currentStep.value
  }

  /**
   * Select an available ticket type.
   *
   * @param {unknown} nextTicketTypeId
   * @returns {boolean}
   */
  function selectTicket(nextTicketTypeId) {
    if (
      !Array.isArray(eventData?.ticketTypes)
      || !eventData.ticketTypes.some((ticket) => ticket.id === nextTicketTypeId)
    ) {
      return false
    }

    ticketTypeId.value = nextTicketTypeId
    return true
  }

  /**
   * Add or remove a session. Sold-out sessions may only be removed.
   *
   * @param {unknown} sessionId
   * @returns {boolean}
   */
  function toggleSession(sessionId) {
    const selectedIndex = selectedSessionIds.value.indexOf(sessionId)

    if (selectedIndex >= 0) {
      selectedSessionIds.value = selectedSessionIds.value.filter((id) => id !== sessionId)
      return true
    }

    const session = normalizedSessions.find((candidate) => candidate.id === sessionId)

    if (!session || isAtCapacity(session.capacity, session.registered)) {
      return false
    }

    selectedSessionIds.value = [...selectedSessionIds.value, session.id]
    return true
  }

  /**
   * Update an add-on quantity while enforcing availability and category bounds.
   *
   * @param {unknown} addonId
   * @param {unknown} quantity
   * @returns {boolean}
   */
  function setAddonQuantity(addonId, quantity) {
    const addon = normalizedAddons.find((candidate) => candidate.id === addonId)
    const selection = typeof addonId === 'string' ? addonSelections[addonId] : undefined
    const maxQuantity = addon?.category === 'merchandise' ? addon.maxQuantity : 1

    if (
      !addon
      || !selection
      || !Number.isInteger(quantity)
      || quantity < 0
      || !Number.isInteger(maxQuantity)
      || quantity > maxQuantity
    ) {
      return false
    }

    if (quantity === 0) {
      selection.quantity = 0
      selection.size = null
      return true
    }

    if (
      addon.category === 'workshop'
      && (
        isAtCapacity(addon.capacity, addon.registered)
        || hasScheduleConflict(addon, selectedSessions.value)
      )
    ) {
      return false
    }

    selection.quantity = quantity
    return true
  }

  /**
   * Set or clear a valid size for selected merchandise.
   *
   * @param {unknown} addonId
   * @param {unknown} size
   * @returns {boolean}
   */
  function setAddonSize(addonId, size) {
    const addon = normalizedAddons.find((candidate) => candidate.id === addonId)
    const selection = typeof addonId === 'string' ? addonSelections[addonId] : undefined

    if (
      !addon
      || addon.category !== 'merchandise'
      || !selection
      || selection.quantity <= 0
      || !Array.isArray(addon.sizes)
      || (size !== null && !addon.sizes.includes(size))
    ) {
      return false
    }

    selection.size = size
    return true
  }

  /**
   * Validate the complete registration and create a stable confirmation.
   *
   * @returns {{ ok: false, issues: import('../types/registration.js').ValidationIssue[] } | { ok: true, confirmationId: string }}
   */
  function submit() {
    hasAttemptedSubmit.value = true

    if (!isRegistrationValid.value) {
      return {
        ok: false,
        issues: validationIssues.value,
      }
    }

    if (!submission.confirmationId) {
      submission.confirmationId = confirmationIdFactory()
    }

    submission.status = 'succeeded'

    return {
      ok: true,
      confirmationId: submission.confirmationId,
    }
  }

  /**
   * Restore every field to a fresh initial registration state.
   *
   * @returns {void}
   */
  function reset() {
    const nextState = createInitialRegistrationState(normalizedAddons)

    currentStep.value = nextState.currentStep
    Object.assign(attendee, nextState.attendee)
    ticketTypeId.value = nextState.ticketTypeId
    selectedSessionIds.value = nextState.selectedSessionIds

    Object.keys(addonSelections).forEach((addonId) => {
      delete addonSelections[addonId]
    })
    Object.assign(addonSelections, nextState.addonSelections)

    hasAttemptedSubmit.value = nextState.hasAttemptedSubmit
    Object.assign(submission, nextState.submission)
  }

  return {
    currentStep,
    attendee,
    ticketTypeId,
    selectedSessionIds,
    addonSelections,
    hasAttemptedSubmit,
    submission,
    selectedTicket,
    selectedSessions,
    selectedAddons,
    groupedSessions,
    hasSelectedMerchandise: hasSelectedMerchandiseValue,
    scheduleConflicts,
    pricingBreakdown,
    validationIssues,
    visibleValidationIssues,
    errorStepIds,
    isRegistrationValid,
    isSubmitDisabled,
    goToStep,
    nextStep,
    previousStep,
    selectTicket,
    toggleSession,
    setAddonQuantity,
    setAddonSize,
    submit,
    reset,
  }
}
