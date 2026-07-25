import { describe, expect, it } from 'vitest'
import { addons } from '../../../src/mocks/addons.js'
import { event } from '../../../src/mocks/event.js'
import { sessions } from '../../../src/mocks/sessions.js'
import { validateRegistration } from '../../../src/utils/registrationValidation.js'

function createValidState() {
  return {
    attendee: {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+1 (415) 555-0123',
      company: 'Analytical Engines',
      jobTitle: 'Engineer',
      shippingAddress: '',
    },
    ticketTypeId: 'general',
    selectedSessionIds: [],
    addonSelections: Object.fromEntries(
      addons.map((addon) => [addon.id, { quantity: 0, size: null }]),
    ),
  }
}

function validate(state) {
  return validateRegistration({
    state,
    eventData: event,
    sessionData: sessions,
    addonData: addons,
  })
}

describe('registration validation', () => {
  it('accepts a complete registration with no optional selections', () => {
    expect(validate(createValidState())).toEqual([])
  })

  it('validates attendee, ticket, email, and phone fields', () => {
    const state = createValidState()
    state.attendee.fullName = ' '
    state.attendee.email = 'invalid'
    state.attendee.phone = '123 ABC'
    state.ticketTypeId = 'unknown'

    expect(validate(state).map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'attendee.fullName.required',
      'attendee.email.invalid',
      'attendee.phone.invalid',
      'ticket.invalid',
    ]))
  })

  it('requires shipping address and size for selected merchandise', () => {
    const state = createValidState()
    state.addonSelections.merch1.quantity = 1

    expect(validate(state).map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'addon.size.required',
      'attendee.shippingAddress.required',
    ]))
  })

  it('reports all session conflicts and unavailable selections', () => {
    const state = createValidState()
    state.selectedSessionIds = ['s2', 's3', 'missing']

    const issues = validate(state)

    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'session.soldOut',
        targetIds: ['s2'],
      }),
      expect.objectContaining({
        code: 'session.conflict',
        targetIds: ['s2', 's3'],
      }),
      expect.objectContaining({
        code: 'session.invalid',
        targetIds: ['missing'],
      }),
    ]))
  })

  it('validates workshop availability, schedule, quantity, and unknown add-ons', () => {
    const state = createValidState()
    state.selectedSessionIds = ['s11']
    state.addonSelections.ws1.quantity = 1
    state.addonSelections.ws2.quantity = 1
    state.addonSelections.merch2.quantity = 6
    state.addonSelections.unknown = { quantity: 1, size: null }

    expect(validate(state).map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'addon.workshopConflict',
      'addon.soldOut',
      'addon.quantity.invalid',
      'addon.invalid',
    ]))
  })

  it('is safe with empty or missing input', () => {
    expect(() => validateRegistration()).not.toThrow()
    expect(validateRegistration().length).toBeGreaterThan(0)
  })
})
