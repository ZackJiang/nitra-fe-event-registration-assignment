import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IndexPage from '../../../src/pages/IndexPage.vue'

describe('IndexPage registration state integration', () => {
  it('drives shell navigation from the registration composable', async () => {
    const wrapper = mount(IndexPage)
    const primaryButton = wrapper.get('.registration-action-bar__primary')

    expect(primaryButton.text()).toContain('Next: Sessions')

    await primaryButton.trigger('click')

    expect(wrapper.get('.q-stepper__tab--active').text()).toContain('Sessions')
    expect(wrapper.get('.registration-action-bar__primary').text()).toContain('Next: Add-ons')
    expect(wrapper.find('.registration-action-bar__back').exists()).toBe(true)

    await wrapper.get('.registration-action-bar__back').trigger('click')

    expect(wrapper.get('.q-stepper__tab--active').text()).toContain('Attendee Info')
  })
})
