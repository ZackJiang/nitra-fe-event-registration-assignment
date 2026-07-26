import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import AttendeeStep from '../../../src/components/registration/attendee/AttendeeStep.vue'
import { event } from '../../../src/mocks/event.js'

function createProps(overrides = {}) {
  return {
    ticketTypes: event.ticketTypes,
    ticketTypeId: null,
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    shippingAddress: '',
    ...overrides,
  }
}

describe('AttendeeStep', () => {
  it('maps visible issues to ticket and attendee controls', () => {
    const wrapper = mount(AttendeeStep, {
      attachTo: document.body,
      props: createProps({
        visibleIssues: [
          {
            code: 'ticket.required',
            stepId: 1,
            targetType: 'ticket',
            targetIds: [],
            message: 'Select a ticket type.',
          },
          {
            code: 'attendee.email.required',
            stepId: 1,
            targetType: 'field',
            targetIds: ['email'],
            message: 'Email is required.',
          },
        ],
      }),
    })

    expect(wrapper.get('#ticket-selection-error').text()).toBe('Select a ticket type.')
    expect(wrapper.get('#attendee-email').attributes('aria-invalid')).toBe('true')
    wrapper.unmount()
  })

  it('focuses the ticket group before attendee fields in DOM order', async () => {
    const wrapper = mount(AttendeeStep, {
      attachTo: document.body,
      props: createProps({
        visibleIssues: [
          {
            code: 'ticket.required',
            stepId: 1,
            targetType: 'ticket',
            targetIds: [],
            message: 'Select a ticket type.',
          },
          {
            code: 'attendee.fullName.required',
            stepId: 1,
            targetType: 'field',
            targetIds: ['fullName'],
            message: 'Full name is required.',
          },
        ],
      }),
    })

    await nextTick()
    expect(document.activeElement).toBe(wrapper.get('.q-radio').element)
    wrapper.unmount()
  })

  it('focuses the first invalid attendee field when ticket is valid', async () => {
    const wrapper = mount(AttendeeStep, {
      attachTo: document.body,
      props: createProps({
        ticketTypeId: 'general',
        visibleIssues: [
          {
            code: 'attendee.email.invalid',
            stepId: 1,
            targetType: 'field',
            targetIds: ['email'],
            message: 'Enter a valid email address.',
          },
        ],
      }),
    })

    await nextTick()
    expect(document.activeElement).toBe(wrapper.get('#attendee-email').element)
    wrapper.unmount()
  })
})
