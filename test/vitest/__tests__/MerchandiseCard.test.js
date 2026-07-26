import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MerchandiseCard from '../../../src/components/registration/addons/MerchandiseCard.vue'
import { addons } from '../../../src/mocks/addons.js'

const shirt = addons.find((addon) => addon.id === 'merch1')
const stickers = addons.find((addon) => addon.id === 'merch2')

describe('MerchandiseCard', () => {
  it('disables size selection at zero and requests quantity changes', async () => {
    const wrapper = mount(MerchandiseCard, {
      props: {
        addon: shirt,
        selection: { quantity: 0, size: null },
      },
    })

    expect(wrapper.get('.q-select').classes()).toContain('q-field--disabled')
    await wrapper.get('[aria-label="Increase Conference T-Shirt quantity"]').trigger('click')
    expect(wrapper.emitted('set-quantity')).toEqual([['merch1', 1]])
  })

  it('shows selected state and emits size changes', async () => {
    const wrapper = mount(MerchandiseCard, {
      props: {
        addon: shirt,
        selection: { quantity: 1, size: null },
      },
    })

    expect(wrapper.classes()).toContain('merchandise-card--selected')
    expect(wrapper.text()).toContain('Added to order')
    wrapper.getComponent({ name: 'QSelect' }).vm.$emit('update:modelValue', 'M')
    expect(wrapper.emitted('set-size')).toEqual([['merch1', 'M']])
  })

  it('omits the size selector for merchandise without sizes', () => {
    const wrapper = mount(MerchandiseCard, {
      props: {
        addon: stickers,
        selection: { quantity: 0, size: null },
      },
    })

    expect(wrapper.find('.q-select').exists()).toBe(false)
  })

  it('associates deferred size errors with the select', () => {
    const wrapper = mount(MerchandiseCard, {
      props: {
        addon: shirt,
        selection: { quantity: 1, size: null },
        hasError: true,
        errorMessage: 'Select an available size for this merchandise item.',
        errorMessageId: 'addon-merch1-error',
      },
    })

    expect(wrapper.classes()).toContain('merchandise-card--error')
    expect(wrapper.get('[role="alert"]').attributes('id')).toBe('addon-merch1-error')
    expect(wrapper.get('.merchandise-card__size').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('.merchandise-card__size').attributes('aria-describedby')).toBe(
      'addon-merch1-error',
    )
  })
})
