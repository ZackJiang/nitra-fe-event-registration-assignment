import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RegistrationHeader from '../../../src/components/registration/RegistrationHeader.vue'

describe('RegistrationHeader', () => {
  it('renders the event name and decorative exported emblem assets', () => {
    const wrapper = mount(RegistrationHeader, {
      props: {
        eventName: 'WebDev Summit 2028',
      },
    })

    expect(wrapper.get('header').text()).toContain('WebDev Summit 2028')
    expect(wrapper.get('.registration-header__logo').attributes('aria-hidden')).toBe('true')

    const emblemParts = wrapper.findAll('.registration-header__emblem img')
    expect(emblemParts).toHaveLength(3)
    expect(emblemParts.every((part) => part.attributes('alt') === '')).toBe(true)
  })
})
