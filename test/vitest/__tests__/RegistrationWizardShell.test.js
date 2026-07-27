import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RegistrationWizardShell from '../../../src/components/registration/shell/RegistrationWizardShell.vue'

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

  it('can omit the stepper without changing the shared header or content slot', () => {
    const wrapper = mount(RegistrationWizardShell, {
      props: {
        currentStep: 4,
        eventName: 'WebDev Summit 2028',
        showStepper: false,
      },
      slots: {
        default: '<section data-test="success">Registration complete</section>',
      },
    })

    expect(wrapper.find('.registration-stepper-shell').exists()).toBe(false)
    expect(wrapper.get('header').text()).toContain('WebDev Summit 2028')
    expect(wrapper.get('[data-test="success"]').text()).toBe('Registration complete')
  })
})
