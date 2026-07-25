import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RegistrationActionBar from '../../../src/components/registration/RegistrationActionBar.vue'

describe('RegistrationActionBar', () => {
  it('shows only the primary action by default and emits its event', async () => {
    const wrapper = mount(RegistrationActionBar, {
      props: {
        primaryLabel: 'Next: Session Selection',
      },
    })

    expect(wrapper.find('.registration-action-bar__back').exists()).toBe(false)
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    expect(wrapper.emitted('primary')).toHaveLength(1)
  })

  it('shows and emits the back action when requested', async () => {
    const wrapper = mount(RegistrationActionBar, {
      props: {
        showBack: true,
        primaryLabel: 'Continue',
      },
    })

    await wrapper.get('.registration-action-bar__back').trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it.each([
    { primaryDisabled: true },
    { primaryLoading: true },
  ])('prevents repeated primary actions for state %o', async (state) => {
    const wrapper = mount(RegistrationActionBar, {
      props: {
        primaryLabel: 'Continue',
        ...state,
      },
    })

    await wrapper.get('.registration-action-bar__primary').trigger('click')
    expect(wrapper.emitted('primary')).toBeUndefined()
  })
})
