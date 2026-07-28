import { describe, expect, it, vi } from 'vitest'
import { addons } from '../../../src/mocks/addons.js'
import {
  createConfirmationId,
  createInitialRegistrationState,
  useRegistrationWizard,
} from '../../../src/composables/useRegistrationWizard.js'
import { event } from '../../../src/mocks/event.js'

function completeRequiredRegistration(wizard) {
  Object.assign(wizard.attendee, {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+1 (415) 555-0123',
    company: 'Analytical Engines',
    jobTitle: 'Engineer',
  })
  wizard.selectTicket('general')
}

describe('useRegistrationWizard', () => {
  it('creates independent initial state and normalized add-on selections', () => {
    const firstState = createInitialRegistrationState(addons, event.ticketTypes)
    const secondState = createInitialRegistrationState(addons, event.ticketTypes)

    firstState.attendee.fullName = 'Changed'
    firstState.addonSelections.ws1.quantity = 1

    expect(secondState.attendee.fullName).toBe('')
    expect(secondState.addonSelections.ws1).toEqual({
      quantity: 0,
      size: null,
    })
    expect(secondState.ticketTypeId).toBe('general')
    expect(Object.keys(secondState.addonSelections)).toHaveLength(addons.length)
  })

  it('uses no default ticket when ticket data is empty or invalid', () => {
    expect(createInitialRegistrationState(addons, [])).toMatchObject({ ticketTypeId: null })
    expect(createInitialRegistrationState(addons, [{ id: null }])).toMatchObject({
      ticketTypeId: null,
    })
  })

  it('navigates within the four wizard steps', () => {
    const wizard = useRegistrationWizard()

    expect(wizard.previousStep()).toBe(1)
    expect(wizard.goToStep(3)).toBe(true)
    expect(wizard.currentStep.value).toBe(3)
    expect(wizard.nextStep()).toBe(4)
    expect(wizard.nextStep()).toBe(4)
    expect(wizard.goToStep(5)).toBe(false)
  })

  it('selects known tickets and sessions while blocking sold-out sessions', () => {
    const wizard = useRegistrationWizard()

    expect(wizard.selectTicket('missing')).toBe(false)
    expect(wizard.selectTicket('vip')).toBe(true)
    expect(wizard.selectedTicket.value?.id).toBe('vip')

    expect(wizard.toggleSession('s2')).toBe(false)
    expect(wizard.toggleSession('s4')).toBe(true)
    expect(wizard.toggleSession('s5')).toBe(true)
    expect(wizard.scheduleConflicts.value.sessions).toEqual([
      { firstId: 's4', secondId: 's5' },
    ])
    expect(wizard.toggleSession('s4')).toBe(true)
    expect(wizard.selectedSessionIds.value).toEqual(['s5'])
  })

  it('blocks a newly conflicting workshop but preserves one selected first', () => {
    const blockedWizard = useRegistrationWizard()
    blockedWizard.toggleSession('s11')

    expect(blockedWizard.setAddonQuantity('ws1', 1)).toBe(false)
    expect(blockedWizard.addonAvailabilityById.value.ws1).toEqual({
      isSoldOut: false,
      conflictingSessionIds: ['s11'],
      isUnavailableForNewSelection: true,
    })
    expect(blockedWizard.addonAvailabilityById.value.ws2).toEqual({
      isSoldOut: true,
      conflictingSessionIds: [],
      isUnavailableForNewSelection: true,
    })

    const preservedWizard = useRegistrationWizard()
    expect(preservedWizard.setAddonQuantity('ws1', 1)).toBe(true)
    expect(preservedWizard.toggleSession('s11')).toBe(true)
    expect(preservedWizard.addonSelections.ws1.quantity).toBe(1)
    expect(preservedWizard.scheduleConflicts.value.workshops).toEqual([
      { workshopId: 'ws1', sessionId: 's11' },
    ])
    expect(preservedWizard.validationIssues.value).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'addon.workshopConflict' }),
    ]))
    expect(preservedWizard.setAddonQuantity('ws1', 0)).toBe(true)
    expect(preservedWizard.addonSelections.ws1.quantity).toBe(0)
  })

  it('groups add-ons by the configured display order', () => {
    const wizard = useRegistrationWizard()

    expect(Object.keys(wizard.groupedAddons.value)).toEqual([
      'workshop',
      'meal',
      'merchandise',
    ])
    expect(wizard.groupedAddons.value.workshop.map((addon) => addon.id)).toEqual(['ws1', 'ws2'])
    expect(wizard.groupedAddons.value.meal.map((addon) => addon.id)).toEqual(['meal1', 'meal2'])
    expect(wizard.groupedAddons.value.merchandise.map((addon) => addon.id)).toEqual([
      'merch1',
      'merch2',
      'merch3',
      'merch4',
    ])
  })

  it('enforces merchandise quantity and size rules', () => {
    const wizard = useRegistrationWizard()

    expect(wizard.setAddonQuantity('merch1', 4)).toBe(false)
    expect(wizard.setAddonQuantity('merch1', 2)).toBe(true)
    expect(wizard.hasSelectedMerchandise.value).toBe(true)
    expect(wizard.addonSelections.merch1.size).toBe('S')
    expect(wizard.setAddonSize('merch1', 'M')).toBe(true)
    expect(wizard.setAddonSize('merch1', 'invalid')).toBe(false)
    expect(wizard.addonSelections.merch1.size).toBe('M')

    expect(wizard.setAddonQuantity('merch1', 3)).toBe(true)
    expect(wizard.addonSelections.merch1.size).toBe('M')

    expect(wizard.setAddonQuantity('merch2', 1)).toBe(true)
    expect(wizard.addonSelections.merch2.size).toBeNull()

    expect(wizard.setAddonQuantity('merch1', 0)).toBe(true)
    expect(wizard.addonSelections.merch1).toEqual({
      quantity: 0,
      size: null,
    })

    expect(wizard.setAddonQuantity('merch1', 1)).toBe(true)
    expect(wizard.addonSelections.merch1.size).toBe('S')
  })

  it('hides validation before submit and automatically clears corrected errors', () => {
    const wizard = useRegistrationWizard()

    expect(wizard.validationIssues.value.length).toBeGreaterThan(0)
    expect(wizard.visibleValidationIssues.value).toEqual([])
    expect(wizard.errorStepIds.value).toEqual([])
    expect(wizard.isSubmitDisabled.value).toBe(false)

    const result = wizard.submit()

    expect(result.ok).toBe(false)
    expect(wizard.errorStepIds.value).toEqual([1])
    expect(wizard.isSubmitDisabled.value).toBe(true)

    completeRequiredRegistration(wizard)

    expect(wizard.validationIssues.value).toEqual([])
    expect(wizard.visibleValidationIssues.value).toEqual([])
    expect(wizard.errorStepIds.value).toEqual([])
    expect(wizard.isSubmitDisabled.value).toBe(false)
  })

  it('creates one stable confirmation and resets all state', () => {
    const confirmationIdFactory = vi.fn(() => 'WDS2028-ABCDE')
    const wizard = useRegistrationWizard({ confirmationIdFactory })
    completeRequiredRegistration(wizard)
    wizard.goToStep(4)
    wizard.setAddonQuantity('meal1', 1)

    expect(wizard.submit()).toEqual({
      ok: true,
      confirmationId: 'WDS2028-ABCDE',
    })
    expect(wizard.submit()).toEqual({
      ok: true,
      confirmationId: 'WDS2028-ABCDE',
    })
    expect(confirmationIdFactory).toHaveBeenCalledTimes(1)

    wizard.reset()

    expect(wizard.currentStep.value).toBe(1)
    expect(wizard.attendee.fullName).toBe('')
    expect(wizard.ticketTypeId.value).toBe('general')
    expect(wizard.selectedSessionIds.value).toEqual([])
    expect(wizard.addonSelections.meal1.quantity).toBe(0)
    expect(wizard.hasAttemptedSubmit.value).toBe(false)
    expect(wizard.submission).toEqual({
      status: 'idle',
      confirmationId: null,
    })
  })

  it('generates a correctly shaped default confirmation ID', () => {
    expect(createConfirmationId(() => 0)).toBe('WDS2028-AAAAA')
    expect(createConfirmationId(() => 0.9999)).toMatch(/^WDS2028-[A-Z0-9]{5}$/)
  })
})
