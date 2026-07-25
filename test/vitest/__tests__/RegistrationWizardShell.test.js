import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RegistrationWizardShell from '../../../src/components/registration/RegistrationWizardShell.vue'

describe('RegistrationWizardShell', () => {
  it('renders content and action slots inside the shared Quasar layout', () => {
    const wrapper = mount(RegistrationWizardShell, {
      props: {
        currentStep: 1,
        eventName: 'WebDev Summit 2028',
      },
      slots: {
        default: '<section data-test="content">Step content</section>',
        actions: '<footer data-test="actions">Actions</footer>',
      },
    })

    expect(wrapper.findComponent({ name: 'QLayout' }).exists()).toBe(true)
    expect(wrapper.get('[data-test="content"]').text()).toBe('Step content')
    expect(wrapper.get('[data-test="actions"]').text()).toBe('Actions')
    expect(wrapper.get('header').text()).toContain('WebDev Summit 2028')
  })
})
