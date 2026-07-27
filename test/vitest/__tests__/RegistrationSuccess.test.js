import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RegistrationSuccess from '../../../src/components/registration/success/RegistrationSuccess.vue'
import { event } from '../../../src/mocks/event.js'

function createProps() {
  return {
    eventName: event.name,
    confirmationId: 'WDS2028-ABCDE',
    attendee: {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    },
    selectedTicket: event.ticketTypes[1],
  }
}

describe('RegistrationSuccess', () => {
  it('renders the Figma-aligned confirmation details without a registration summary', () => {
    const wrapper = mount(RegistrationSuccess, {
      props: createProps(),
    })

    expect(wrapper.get('#registration-success-heading').text()).toBe('Registration Complete!')
    expect(wrapper.text()).toContain('Confirmation #WDS2028-ABCDE')
    expect(wrapper.text()).toContain('Ada Lovelace')
    expect(wrapper.text()).toContain('VIP registration for WebDev Summit 2028')
    expect(wrapper.text()).not.toContain('Registration Summary')
    expect(wrapper.find('.success-summary').exists()).toBe(false)
  })

  it('focuses its heading and emits Back to Home', async () => {
    const wrapper = mount(RegistrationSuccess, {
      attachTo: document.body,
      props: createProps(),
    })

    expect(wrapper.vm.focusHeading()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('#registration-success-heading').element)

    await wrapper.get('.registration-success__button').trigger('click')
    expect(wrapper.emitted('back-home')).toHaveLength(1)
    wrapper.unmount()
  })
})
