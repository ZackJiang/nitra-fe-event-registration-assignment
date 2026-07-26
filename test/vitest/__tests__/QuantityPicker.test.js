import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QuantityPicker from '../../../src/components/registration/addons/QuantityPicker.vue'

describe('QuantityPicker', () => {
  it('increments and decrements within the configured bounds', async () => {
    const wrapper = mount(QuantityPicker, {
      props: {
        modelValue: 0,
        max: 2,
        itemName: 'Water Bottle',
        'onUpdate:modelValue': (quantity) => wrapper.setProps({ modelValue: quantity }),
      },
    })

    const decrease = wrapper.get('[aria-label="Decrease Water Bottle quantity"]')
    const increase = wrapper.get('[aria-label="Increase Water Bottle quantity"]')

    expect(decrease.attributes('disabled')).toBeDefined()
    await increase.trigger('click')
    await increase.trigger('click')

    expect(wrapper.props('modelValue')).toBe(2)
    expect(increase.attributes('disabled')).toBeDefined()

    await decrease.trigger('click')
    expect(wrapper.props('modelValue')).toBe(1)
  })
})
