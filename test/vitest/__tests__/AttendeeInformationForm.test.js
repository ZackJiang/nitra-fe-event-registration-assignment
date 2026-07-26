import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AttendeeInformationForm from '../../../src/components/registration/AttendeeInformationForm.vue'

function createProps(overrides = {}) {
  return {
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    shippingAddress: '',
    ...overrides,
  }
}

describe('AttendeeInformationForm', () => {
  it('binds every attendee field through named models', async () => {
    const wrapper = mount(AttendeeInformationForm, {
      props: createProps(),
    })

    const values = {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+1 (415) 555-0123',
      company: 'Analytical Engines',
      jobTitle: 'Engineer',
      shippingAddress: '123 Computing Way',
    }

    for (const [fieldId, value] of Object.entries(values)) {
      await wrapper.get(`#attendee-${fieldId}`).setValue(value)
      expect(wrapper.emitted(`update:${fieldId}`)?.at(-1)).toEqual([value])
    }
  })

  it('shows externally supplied inline validation without local rules', () => {
    const wrapper = mount(AttendeeInformationForm, {
      props: createProps({
        fieldIssues: {
          email: {
            code: 'attendee.email.invalid',
            message: 'Enter a valid email address.',
          },
          phone: {
            code: 'attendee.phone.invalid',
            message: 'Enter a valid phone number with 7 to 15 digits.',
          },
        },
      }),
    })

    expect(wrapper.get('#attendee-email').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#attendee-phone').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Enter a valid email address.')
    expect(wrapper.text()).toContain('Enter a valid phone number with 7 to 15 digits.')
  })

  it('renders all three shipping address states', async () => {
    const wrapper = mount(AttendeeInformationForm, {
      props: createProps(),
    })

    expect(wrapper.text()).toContain('Shipping Address (Optional)')
    expect(wrapper.find('#attendee-shippingAddress[aria-invalid="true"]').exists()).toBe(false)

    await wrapper.setProps({ shippingRequired: true })
    expect(wrapper.text()).not.toContain('Shipping Address (Optional)')

    await wrapper.setProps({
      fieldIssues: {
        shippingAddress: {
          code: 'attendee.shippingAddress.required',
          message: 'Shipping address is required when merchandise is selected.',
        },
      },
    })

    expect(wrapper.get('#attendee-shippingAddress').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Shipping address is required when merchandise is selected.')
  })
})
