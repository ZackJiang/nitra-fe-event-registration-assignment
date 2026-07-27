import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReviewStep from '../../../src/components/registration/review/ReviewStep.vue'
import { addons } from '../../../src/mocks/addons.js'
import { event } from '../../../src/mocks/event.js'
import { sessions } from '../../../src/mocks/sessions.js'
import { calculatePricingBreakdown } from '../../../src/utils/registrationPricing.js'

function getProps(overrides = {}) {
  const addonSelections = {
    ws1: { quantity: 1, size: null },
    merch1: { quantity: 2, size: 'M' },
  }

  return {
    attendee: {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+1 (415) 555-0123',
      company: 'Analytical Engines',
      jobTitle: 'Engineer',
      shippingAddress: '12 St James Square',
    },
    selectedTicket: event.ticketTypes.find((ticket) => ticket.id === 'vip'),
    selectedSessions: [sessions[5], sessions[0]],
    selectedAddons: addons
      .filter((addon) => addonSelections[addon.id]?.quantity > 0)
      .map((addon) => ({ addon, selection: addonSelections[addon.id] })),
    pricingBreakdown: calculatePricingBreakdown({
      eventData: event,
      addonData: addons,
      ticketTypeId: 'vip',
      addonSelections,
    }),
    visibleIssues: [],
    hasSelectedMerchandise: true,
    ...overrides,
  }
}

describe('ReviewStep', () => {
  it('renders readable sorted selections and itemized pricing', () => {
    const wrapper = mount(ReviewStep, {
      props: getProps(),
    })

    const text = wrapper.text()
    expect(text).toContain('Ada Lovelace')
    expect(text).toContain('VIP ($599.00)')
    expect(text).toContain('Nov 15, 9:00 AM')
    expect(text.indexOf('Opening Keynote')).toBeLessThan(text.indexOf('CI/CD Pipelines'))
    expect(text).toContain('Conference T-Shirt × 2 (M) ($70.00)')
    expect(text).toContain('Workshop discount (VIP 10%)')
    expect(text).toContain('Grand Total')
  })

  it('emits the corresponding step for each edit action', async () => {
    const wrapper = mount(ReviewStep, {
      props: getProps(),
    })

    await wrapper.findAll('.review-section__edit')[1].trigger('click')

    expect(wrapper.emitted('edit-step')).toEqual([[2]])
  })

  it('shows all validation issues in the banner and marks only affected sections and rows', () => {
    const wrapper = mount(ReviewStep, {
      props: getProps({
        attendee: {
          ...getProps().attendee,
          phone: '',
          shippingAddress: '',
        },
        visibleIssues: [
          {
            code: 'attendee.phone.required',
            stepId: 1,
            targetType: 'field',
            targetIds: ['phone'],
            message: 'Phone is required.',
          },
          {
            code: 'attendee.shippingAddress.required',
            stepId: 1,
            targetType: 'field',
            targetIds: ['shippingAddress'],
            message: 'Shipping address is required when merchandise is selected.',
          },
          {
            code: 'session.conflict',
            stepId: 2,
            targetType: 'session',
            targetIds: ['s1', 's6'],
            message: 'Selected sessions have overlapping times.',
          },
        ],
      }),
    })

    expect(wrapper.get('[role="alert"]').text()).toContain('Step 1: Phone is required.')
    expect(wrapper.findAll('.review-section--error')).toHaveLength(2)
    expect(wrapper.text()).toContain('— (required)')
    expect(wrapper.text()).toContain('— (required for merchandise)')
    expect(wrapper.findAll('.review-rows__value--error')).toHaveLength(4)
  })
})
