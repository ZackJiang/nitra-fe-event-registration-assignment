import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AddonCard from '../../../src/components/registration/addons/AddonCard.vue'
import { addons } from '../../../src/mocks/addons.js'

const workshop = addons.find((addon) => addon.id === 'ws1')
const meal = addons.find((addon) => addon.id === 'meal1')

function mountCard(props = {}) {
  return mount(AddonCard, {
    props: {
      addon: workshop,
      ...props,
    },
  })
}

describe('AddonCard', () => {
  it('renders workshop schedule, capacity, and formatted price', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Hands-on Vue.js Testing')
    expect(wrapper.text()).toContain('$149.00')
    expect(wrapper.text()).toContain('Nov 16, 2:00 PM – 5:00 PM')
    expect(wrapper.text()).toContain('8 spots remaining')
  })

  it('renders meals without workshop-only metadata', () => {
    const wrapper = mountCard({ addon: meal })

    expect(wrapper.text()).toContain('Standard Lunch (Both Days)')
    expect(wrapper.text()).toContain('$45.00')
    expect(wrapper.text()).not.toContain('spots remaining')
  })

  it('blocks unavailable workshops from being selected', async () => {
    const wrapper = mountCard({
      availability: {
        isSoldOut: false,
        conflictingSessionIds: ['s11'],
        isUnavailableForNewSelection: true,
      },
    })

    expect(wrapper.classes()).toContain('addon-card--unavailable')
    expect(wrapper.text()).toContain('Unavailable — conflicts with a selected session.')

    await wrapper.trigger('click')
    expect(wrapper.emitted('update-selected')).toBeUndefined()
  })

  it('allows a selected conflicting workshop to be removed', async () => {
    const wrapper = mountCard({
      selected: true,
      availability: {
        isSoldOut: false,
        conflictingSessionIds: ['s11'],
        isUnavailableForNewSelection: true,
      },
    })

    expect(wrapper.classes()).toContain('addon-card--selected-conflict')
    await wrapper.trigger('click')

    expect(wrapper.emitted('update-selected')).toEqual([['ws1', false]])
  })

  it('renders sold-out and deferred error states accessibly', () => {
    const wrapper = mountCard({
      availability: {
        isSoldOut: true,
        conflictingSessionIds: [],
        isUnavailableForNewSelection: true,
      },
      hasError: true,
      errorMessage: 'A selected workshop is sold out.',
      errorMessageId: 'addon-ws1-error',
    })

    expect(wrapper.text()).toContain('Sold Out')
    expect(wrapper.classes()).toContain('addon-card--error')
    expect(wrapper.get('[role="alert"]').attributes('id')).toBe('addon-ws1-error')
    expect(wrapper.get('.q-checkbox').attributes('aria-invalid')).toBe('true')
  })
})
