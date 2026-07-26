import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderSummary from '../../../src/components/registration/summary/OrderSummary.vue'
import { addons } from '../../../src/mocks/addons.js'
import { event } from '../../../src/mocks/event.js'
import { calculatePricingBreakdown } from '../../../src/utils/registrationPricing.js'

function getBreakdown(ticketTypeId = null, addonSelections = {}) {
  return calculatePricingBreakdown({
    eventData: event,
    addonData: addons,
    ticketTypeId,
    addonSelections,
  })
}

describe('OrderSummary', () => {
  it('renders a clear empty state and zero total', () => {
    const wrapper = mount(OrderSummary, {
      props: {
        pricingBreakdown: getBreakdown(),
      },
    })

    expect(wrapper.text()).toContain('No items selected yet.')
    expect(wrapper.text()).toContain('$0.00')
  })

  it('renders itemized quantities, VIP workshop discount, and total', () => {
    const wrapper = mount(OrderSummary, {
      props: {
        pricingBreakdown: getBreakdown('vip', {
          ws1: { quantity: 1, size: null },
          meal1: { quantity: 1, size: null },
          merch2: { quantity: 3, size: null },
        }),
      },
    })

    expect(wrapper.text()).toContain('VIP Ticket')
    expect(wrapper.text()).toContain('Hands-on Vue.js Testing')
    expect(wrapper.text()).toContain('Standard Lunch (Both Days)')
    expect(wrapper.text()).toContain('Developer Sticker Pack × 3')
    expect(wrapper.text()).toContain('Workshop discount (VIP 10%)')
    expect(wrapper.text()).toContain('-$14.90')
    expect(wrapper.text()).toContain('$814.10')
  })

  it('does not render a discount for non-VIP tickets', () => {
    const wrapper = mount(OrderSummary, {
      props: {
        pricingBreakdown: getBreakdown('general', {
          ws1: { quantity: 1, size: null },
        }),
      },
    })

    expect(wrapper.text()).not.toContain('Workshop discount')
    expect(wrapper.text()).toContain('$448.00')
  })
})
