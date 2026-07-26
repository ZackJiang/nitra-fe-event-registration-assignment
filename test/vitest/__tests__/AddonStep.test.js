import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import AddonStep from '../../../src/components/registration/addons/AddonStep.vue'
import { addons } from '../../../src/mocks/addons.js'
import { event } from '../../../src/mocks/event.js'
import { calculatePricingBreakdown } from '../../../src/utils/registrationPricing.js'

const groupedAddons = {
  workshop: addons.filter((addon) => addon.category === 'workshop'),
  meal: addons.filter((addon) => addon.category === 'meal'),
  merchandise: addons.filter((addon) => addon.category === 'merchandise'),
}
const addonSelections = Object.fromEntries(
  addons.map((addon) => [addon.id, { quantity: 0, size: null }]),
)

function mountStep(props = {}) {
  return mount(AddonStep, {
    props: {
      groupedAddons,
      addonSelections,
      pricingBreakdown: calculatePricingBreakdown({
        eventData: event,
        addonData: addons,
        ticketTypeId: null,
        addonSelections,
      }),
      ...props,
    },
  })
}

describe('AddonStep', () => {
  it('defaults to workshops and switches to meal packages', async () => {
    const wrapper = mountStep()

    expect(wrapper.text()).toContain('Hands-on Vue.js Testing')
    expect(wrapper.text()).not.toContain('Standard Lunch (Both Days)')

    await wrapper.findAll('.q-tab')[1].trigger('click')

    expect(wrapper.text()).toContain('Standard Lunch (Both Days)')
    expect(wrapper.text()).not.toContain('Hands-on Vue.js Testing')
  })

  it('requests category-bounded 0/1 quantities', async () => {
    const wrapper = mountStep()

    await wrapper.get('[data-addon-id="ws1"]').trigger('click')
    expect(wrapper.emitted('set-addon-quantity')).toEqual([['ws1', 1]])

    await wrapper.setProps({
      addonSelections: {
        ...addonSelections,
        ws1: { quantity: 1, size: null },
      },
    })
    await wrapper.get('[data-addon-id="ws1"]').trigger('click')

    expect(wrapper.emitted('set-addon-quantity')).toEqual([
      ['ws1', 1],
      ['ws1', 0],
    ])
  })

  it('renders an empty state for a category with no items', async () => {
    const wrapper = mountStep({
      groupedAddons: {
        ...groupedAddons,
        merchandise: [],
      },
    })

    await wrapper.findAll('.q-tab')[2].trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe(
      'No add-ons are available in this category.',
    )
  })

  it('renders merchandise and the conditional shipping banner', async () => {
    const wrapper = mountStep({
      hasSelectedMerchandise: true,
    })

    expect(wrapper.text()).toContain('Shipping Information')
    await wrapper.findAll('.q-tab')[2].trigger('click')

    expect(wrapper.text()).toContain('Conference T-Shirt')
    await wrapper.get('[aria-label="Increase Conference T-Shirt quantity"]').trigger('click')
    expect(wrapper.emitted('set-addon-quantity')).toEqual([['merch1', 1]])
  })

  it('opens the category containing the first deferred add-on error', async () => {
    const wrapper = mountStep({
      addonSelections: {
        ...addonSelections,
        merch1: { quantity: 1, size: null },
      },
      visibleIssues: [{
        code: 'addon.size.required',
        stepId: 3,
        targetType: 'addon',
        targetIds: ['merch1'],
        message: 'Select an available size for this merchandise item.',
      }],
    })

    await nextTick()
    await nextTick()

    expect(wrapper.get('.addon-step__tab--active').text()).toContain('Merchandise')
    expect(wrapper.get('[data-addon-id="merch1"]')).toBeTruthy()
    expect(wrapper.get('[role="alert"]').text()).toContain('Select an available size')
  })
})
