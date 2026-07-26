import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TicketSelection from '../../../src/components/registration/attendee/TicketSelection.vue'
import { event } from '../../../src/mocks/event.js'

describe('TicketSelection', () => {
  it('starts unselected and updates a single ticket selection', async () => {
    const wrapper = mount(TicketSelection, {
      props: {
        ticketTypes: event.ticketTypes,
        modelValue: null,
      },
    })

    expect(wrapper.find('.ticket-card--selected').exists()).toBe(false)

    const ticketCards = wrapper.findAll('.ticket-card')
    await ticketCards[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['vip'])
    await wrapper.setProps({ modelValue: 'vip' })
    expect(wrapper.get('.ticket-card--selected').text()).toContain('VIP')
    expect(wrapper.get('.ticket-card__selected-badge').text()).toContain('Selected')

    await ticketCards[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['student'])
  })

  it('connects a deferred ticket error to the radio group', () => {
    const wrapper = mount(TicketSelection, {
      props: {
        ticketTypes: event.ticketTypes,
        modelValue: null,
        issue: {
          code: 'ticket.required',
          message: 'Select a ticket type.',
        },
      },
    })

    const group = wrapper.get('[role="radiogroup"]')
    expect(group.attributes('aria-invalid')).toBe('true')
    expect(group.attributes('aria-describedby')).toBe('ticket-selection-error')
    expect(wrapper.get('[role="alert"]').text()).toBe('Select a ticket type.')
    expect(wrapper.findAll('.ticket-card--error')).toHaveLength(3)
  })

  it('provides native radio semantics for keyboard operation', () => {
    const wrapper = mount(TicketSelection, {
      props: {
        ticketTypes: event.ticketTypes,
        modelValue: null,
      },
    })

    const nativeRadios = wrapper.findAll('input[type="radio"]')
    const radioControls = wrapper.findAll('.q-radio')
    expect(nativeRadios).toHaveLength(3)
    expect(nativeRadios.every((radio) => radio.attributes('name') === 'registration-ticket-type')).toBe(true)
    expect(radioControls[0].attributes('aria-label')).toContain('General ticket')
    expect(radioControls[0].attributes('tabindex')).toBe('0')
    expect(radioControls[1].attributes('tabindex')).toBe('-1')
  })

  it('selects and focuses tickets with radio-group navigation keys', async () => {
    const wrapper = mount(TicketSelection, {
      attachTo: document.body,
      props: {
        ticketTypes: event.ticketTypes,
        modelValue: null,
      },
    })

    await wrapper.get('.q-radio').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['vip'])
    expect(document.activeElement?.getAttribute('data-ticket-id')).toBe('vip')
    wrapper.unmount()
  })
})
