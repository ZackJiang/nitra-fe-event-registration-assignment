import {
  doTimeRangesOverlap,
  findScheduleConflicts,
  isAtCapacity,
} from './registrationSchedule.js'
import { WIZARD_STEP } from '../constants/wizard.js'

const REQUIRED_ATTENDEE_FIELDS = Object.freeze([
  'fullName', 'email', 'phone', 'company', 'jobTitle',
])

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_ALLOWED_PATTERN = /^[+\d\s()-]+$/

/**
 * Validate all registration steps without mutating state.
 *
 * @param {Object} input
 * @param {Partial<import('../types/registration.js').RegistrationState> | null | undefined} input.state
 * @param {{ ticketTypes?: Array<{ id: string }> } | null | undefined} input.eventData
 * @param {Array<{ id: string, date?: unknown, endDate?: unknown, capacity?: unknown, registered?: unknown }> | null | undefined} input.sessionData
 * @param {Array<{ id: string, category: string, date?: unknown, endDate?: unknown, capacity?: unknown, registered?: unknown, sizes?: string[], maxQuantity?: number }> | null | undefined} input.addonData
 * @returns {import('../types/registration.js').ValidationIssue[]}
 */
export function validateRegistration({
  state,
  eventData,
  sessionData,
  addonData,
} = {}) {
  const issues = []
  const attendee = state?.attendee ?? {}
  const sessions = Array.isArray(sessionData) ? sessionData : []
  const addons = Array.isArray(addonData) ? addonData : []
  const selections = state?.addonSelections ?? {}

  validateAttendee(attendee, issues)
  validateTicket(state?.ticketTypeId, eventData?.ticketTypes, issues)

  const selectedSessions = validateSessions(
    state?.selectedSessionIds,
    sessions,
    issues,
  )

  validateAddons(selections, addons, selectedSessions, issues)

  if (hasSelectedMerchandise(selections, addons) && !hasText(attendee.shippingAddress)) {
    issues.push(createIssue(
      'attendee.shippingAddress.required',
      WIZARD_STEP.ATTENDEE,
      'field',
      ['shippingAddress'],
    ))
  }

  return issues
}

/**
 * Determine whether registration includes merchandise.
 *
 * @param {Record<string, import('../types/registration.js').AddonSelection> | null | undefined} selections
 * @param {Array<{ id: string, category: string }> | null | undefined} addons
 * @returns {boolean}
 */
export function hasSelectedMerchandise(selections, addons) {
  if (!selections || !Array.isArray(addons)) {
    return false
  }

  return addons.some((addon) => (
    addon.category === 'merchandise'
    && Number.isInteger(selections[addon.id]?.quantity)
    && selections[addon.id].quantity > 0
  ))
}

/**
 * @param {Record<string, unknown>} attendee
 * @param {import('../types/registration.js').ValidationIssue[]} issues
 */
function validateAttendee(attendee, issues) {
  REQUIRED_ATTENDEE_FIELDS.forEach((fieldId) => {
    if (!hasText(attendee[fieldId])) {
      issues.push(createIssue(
        `attendee.${fieldId}.required`,
        WIZARD_STEP.ATTENDEE,
        'field',
        [fieldId],
      ))
    }
  })

  if (hasText(attendee.email) && !EMAIL_PATTERN.test(attendee.email.trim())) {
    issues.push(createIssue(
      'attendee.email.invalid',
      WIZARD_STEP.ATTENDEE,
      'field',
      ['email'],
    ))
  }

  if (hasText(attendee.phone)) {
    const phone = attendee.phone.trim()
    const digitCount = phone.replace(/\D/g, '').length

    if (!PHONE_ALLOWED_PATTERN.test(phone) || digitCount < 7 || digitCount > 15) {
      issues.push(createIssue(
        'attendee.phone.invalid',
        1,
        'field',
        ['phone'],
      ))
    }
  }
}

/**
 * @param {unknown} ticketTypeId
 * @param {Array<{ id: string }> | null | undefined} ticketTypes
 * @param {import('../types/registration.js').ValidationIssue[]} issues
 */
function validateTicket(ticketTypeId, ticketTypes, issues) {
  if (typeof ticketTypeId !== 'string' || ticketTypeId.length === 0) {
    issues.push(createIssue(
      'ticket.required',
      WIZARD_STEP.ATTENDEE,
      'ticket',
      [],
    ))
    return
  }

  if (!Array.isArray(ticketTypes) || !ticketTypes.some((ticket) => ticket.id === ticketTypeId)) {
    issues.push(createIssue(
      'ticket.invalid',
      WIZARD_STEP.ATTENDEE,
      'ticket',
      [ticketTypeId],
    ))
  }
}

/**
 * @param {unknown} selectedSessionIds
 * @param {Array<{ id: string, date?: unknown, endDate?: unknown, capacity?: unknown, registered?: unknown }>} sessions
 * @param {import('../types/registration.js').ValidationIssue[]} issues
 * @returns {Array<{ id: string, date?: unknown, endDate?: unknown }>}
 */
function validateSessions(selectedSessionIds, sessions, issues) {
  if (!Array.isArray(selectedSessionIds)) {
    return []
  }

  const selectedSessions = []
  const uniqueSessionIds = [...new Set(selectedSessionIds)]

  uniqueSessionIds.forEach((sessionId) => {
    const session = sessions.find((candidate) => candidate.id === sessionId)

    if (!session) {
      issues.push(createIssue(
        'session.invalid',
        WIZARD_STEP.SESSIONS,
        'session',
        [String(sessionId)],
      ))
      return
    }

    selectedSessions.push(session)

    if (isAtCapacity(session.capacity, session.registered)) {
      issues.push(createIssue(
        'session.soldOut',
        WIZARD_STEP.SESSIONS,
        'session',
        [session.id],
      ))
    }
  })

  findScheduleConflicts(selectedSessions).forEach(({ firstId, secondId }) => {
    issues.push(createIssue(
      'session.conflict',
      WIZARD_STEP.SESSIONS,
      'session',
      [firstId, secondId],
    ))
  })

  return selectedSessions
}

/**
 * @param {Record<string, import('../types/registration.js').AddonSelection>} selections
 * @param {Array<{ id: string, category: string, date?: unknown, endDate?: unknown, capacity?: unknown, registered?: unknown, sizes?: string[], maxQuantity?: number }>} addons
 * @param {Array<{ id: string, date?: unknown, endDate?: unknown }>} selectedSessions
 * @param {import('../types/registration.js').ValidationIssue[]} issues
 */
function validateAddons(selections, addons, selectedSessions, issues) {
  Object.entries(selections).forEach(([addonId, selection]) => {
    if (!addons.some((addon) => addon.id === addonId) && selection?.quantity !== 0) {
      issues.push(createIssue(
        'addon.invalid',
        WIZARD_STEP.ADDONS,
        'addon',
        [addonId],
      ))
    }
  })

  addons.forEach((addon) => {
    const selection = selections[addon.id] ?? { quantity: 0, size: null }
    const maxQuantity = addon.category === 'merchandise' ? addon.maxQuantity : 1

    if (
      !Number.isInteger(selection.quantity)
      || selection.quantity < 0
      || !Number.isInteger(maxQuantity)
      || selection.quantity > maxQuantity
    ) {
      issues.push(createIssue(
        'addon.quantity.invalid',
        WIZARD_STEP.ADDONS,
        'addon',
        [addon.id],
      ))
      return
    }

    if (selection.quantity === 0) {
      return
    }

    if (
      addon.category === 'workshop'
      && isAtCapacity(addon.capacity, addon.registered)
    ) {
      issues.push(createIssue(
        'addon.soldOut',
        WIZARD_STEP.ADDONS,
        'addon',
        [addon.id],
      ))
    }

    if (addon.category === 'workshop') {
      selectedSessions.forEach((session) => {
        if (doTimeRangesOverlap(addon.date, addon.endDate, session.date, session.endDate)) {
          issues.push(createIssue(
            'addon.workshopConflict',
            WIZARD_STEP.ADDONS,
            'addon',
            [addon.id, session.id],
          ))
        }
      })
    }

    if (
      addon.category === 'merchandise'
      && Array.isArray(addon.sizes)
      && addon.sizes.length > 0
      && !addon.sizes.includes(selection.size)
    ) {
      issues.push(createIssue(
        'addon.size.required',
        WIZARD_STEP.ADDONS,
        'addon',
        [addon.id],
      ))
    }
  })
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * @param {string} code
 * @param {1 | 2 | 3} stepId
 * @param {'field' | 'ticket' | 'session' | 'addon'} targetType
 * @param {string[]} targetIds
 * @param {Record<string, string | number>} [params]
 * @returns {import('../types/registration.js').ValidationIssue}
 */
function createIssue(code, stepId, targetType, targetIds, params = {}) {
  return {
    code,
    stepId,
    targetType,
    targetIds,
    params,
  }
}
