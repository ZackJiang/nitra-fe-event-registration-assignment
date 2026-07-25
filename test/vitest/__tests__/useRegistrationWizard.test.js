import { describe, expect, it, vi } from 'vitest'
import { addons } from '../../../src/mocks/addons.js'
import {
  createConfirmationId,
  createInitialRegistrationState,
  useRegistrationWizard,
} from '../../../src/composables/useRegistrationWizard.js'

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
    const firstState = createInitialRegistrationState(addons)
    const secondState = createInitialRegistrationState(addons)

    firstState.attendee.fullName = 'Changed'
    firstState.addonSelections.ws1.quantity = 1

    expect(secondState.attendee.fullName).toBe('')
    expect(secondState.addonSelections.ws1).toEqual({
      quantity: 0,
      size: null,
    })
    expect(Object.keys(secondState.addonSelections)).toHaveLength(addons.length)
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
  })

  it('enforces merchandise quantity and size rules', () => {
    const wizard = useRegistrationWizard()

    expect(wizard.setAddonQuantity('merch1', 4)).toBe(false)
    expect(wizard.setAddonQuantity('merch1', 2)).toBe(true)
    expect(wizard.hasSelectedMerchandise.value).toBe(true)
    expect(wizard.setAddonSize('merch1', 'M')).toBe(true)
    expect(wizard.setAddonSize('merch1', 'invalid')).toBe(false)
    expect(wizard.addonSelections.merch1.size).toBe('M')

    expect(wizard.setAddonQuantity('merch1', 0)).toBe(true)
    expect(wizard.addonSelections.merch1).toEqual({
      quantity: 0,
      size: null,
    })
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
    expect(wizard.ticketTypeId.value).toBeNull()
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
