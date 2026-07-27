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

  it('moves forward without validating Step 1', async () => {
    const wrapper = mount(IndexPage)

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await wrapper.get('.registration-action-bar__primary').trigger('click')

    expect(wrapper.get('.q-stepper__tab--active').text()).toContain('Sessions')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('preserves Step 1 values across navigation', async () => {
    const wrapper = mount(IndexPage)

    await wrapper.findAll('.q-radio')[1].trigger('click')
    await wrapper.get('#attendee-fullName').setValue('Ada Lovelace')
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('.registration-action-bar__back').trigger('click')

    expect(wrapper.get('.ticket-card--selected').text()).toContain('VIP')
    expect(wrapper.get('#attendee-fullName').element.value).toBe('Ada Lovelace')
  })

  it('preserves session selections across dates and navigation', async () => {
    const wrapper = mount(IndexPage)

    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('[data-session-id="s3"]').trigger('click')
    await wrapper.findAll('.q-tab')[1].trigger('click')
    await wrapper.get('[data-session-id="s8"]').trigger('click')

    expect(wrapper.get('.session-step__count').text()).toBe('2 sessions selected')

    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('.registration-action-bar__back').trigger('click')

    expect(wrapper.get('[data-session-id="s3"]').classes()).toContain('session-card--selected')
    await wrapper.findAll('.q-tab')[1].trigger('click')
    expect(wrapper.get('[data-session-id="s8"]').classes()).toContain('session-card--selected')
  })

  it('keeps merchandise selections and the live order summary across navigation', async () => {
    const wrapper = mount(IndexPage)

    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.findAll('.q-tab')[2].trigger('click')
    await wrapper.get('[aria-label="Increase Conference T-Shirt quantity"]').trigger('click')

    expect(wrapper.text()).toContain('Shipping Information')
    expect(wrapper.get('.order-summary').text()).toContain('Conference T-Shirt × 1')
    expect(wrapper.get('.order-summary').text()).toContain('$35.00')

    await wrapper.get('.registration-action-bar__back').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.findAll('.q-tab')[2].trigger('click')

    expect(wrapper.get('[data-addon-id="merch1"]').classes()).toContain(
      'merchandise-card--selected',
    )
  })

  it('blocks a workshop that conflicts with a selected session', async () => {
    const wrapper = mount(IndexPage)

    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.findAll('.q-tab')[1].trigger('click')
    await wrapper.get('[data-session-id="s11"]').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')

    const workshopCard = wrapper.get('[data-addon-id="ws1"]')
    expect(workshopCard.classes()).toContain('addon-card--unavailable')
    expect(workshopCard.text()).toContain('Unavailable — conflicts with a selected session.')

    await workshopCard.trigger('click')
    expect(workshopCard.classes()).not.toContain('addon-card--selected')
  })

  it('preserves a workshop selected before a conflict and allows removing it', async () => {
    const wrapper = mount(IndexPage)

    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('[data-addon-id="ws1"]').trigger('click')
    await wrapper.get('.registration-action-bar__back').trigger('click')
    await wrapper.findAll('.q-tab')[1].trigger('click')
    await wrapper.get('[data-session-id="s11"]').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')

    const workshopCard = wrapper.get('[data-addon-id="ws1"]')
    expect(workshopCard.classes()).toContain('addon-card--selected-conflict')

    await workshopCard.trigger('click')
    expect(wrapper.get('[data-addon-id="ws1"]').classes()).not.toContain(
      'addon-card--selected',
    )
  })

  it('shows deferred session conflicts after submit and clears them after correction', async () => {
    const wrapper = mount(IndexPage, {
      attachTo: document.body,
    })

    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('[data-session-id="s4"]').trigger('click')
    await wrapper.get('[data-session-id="s5"]').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('.registration-action-bar__primary').trigger('click')
    await wrapper.get('.registration-action-bar__back').trigger('click')
    await wrapper.get('.registration-action-bar__back').trigger('click')

    expect(wrapper.findAll('.session-card--error')).toHaveLength(2)
    expect(wrapper.get('[role="alert"]').text()).toBe('Selected sessions have overlapping times.')
    expect(document.activeElement).toBe(wrapper.get('[data-session-id="s4"] .q-checkbox').element)

    await wrapper.get('[data-session-id="s4"]').trigger('click')

    expect(wrapper.find('.session-card--error').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows deferred errors and focuses ticket selection after returning to Step 1', async () => {
    const wrapper = mount(IndexPage, {
      attachTo: document.body,
    })

    for (let step = 1; step < 4; step += 1) {
      await wrapper.get('.registration-action-bar__primary').trigger('click')
    }
    await wrapper.get('.registration-action-bar__primary').trigger('click')

    expect(wrapper.find('.q-stepper__tab--error').exists()).toBe(true)

    for (let step = 4; step > 1; step -= 1) {
      await wrapper.get('.registration-action-bar__back').trigger('click')
    }

    expect(wrapper.get('#ticket-selection-error').text()).toBe('Select a ticket type.')
    expect(document.activeElement).toBe(wrapper.get('.q-radio').element)
    wrapper.unmount()
  })

  it('keeps submit failures on Review, focuses the error summary, and enables resubmission after correction', async () => {
    const wrapper = mount(IndexPage, {
      attachTo: document.body,
    })

    for (let step = 1; step < 4; step += 1) {
      await wrapper.get('.registration-action-bar__primary').trigger('click')
    }
    await wrapper.get('.registration-action-bar__primary').trigger('click')

    const errorBanner = wrapper.get('[role="alert"]')
    expect(wrapper.get('.q-stepper__tab--active').text()).toContain('Review')
    expect(errorBanner.text()).toContain('Step 1: Full name is required.')
    expect(document.activeElement).toBe(errorBanner.get('.review-error-banner__heading').element)
    expect(wrapper.get('.registration-action-bar__primary').attributes('disabled')).toBeDefined()

    await errorBanner.findAll('.review-error-banner__link')[0].trigger('click')
    expect(wrapper.get('.q-stepper__tab--active').text()).toContain('Attendee Info')

    await wrapper.findAll('.q-radio')[0].trigger('click')
    await wrapper.get('#attendee-fullName').setValue('Ada Lovelace')
    await wrapper.get('#attendee-email').setValue('ada@example.com')
    await wrapper.get('#attendee-phone').setValue('+1 (415) 555-0123')
    await wrapper.get('#attendee-company').setValue('Analytical Engines')
    await wrapper.get('#attendee-jobTitle').setValue('Engineer')

    for (let step = 1; step < 4; step += 1) {
      await wrapper.get('.registration-action-bar__primary').trigger('click')
    }

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('.registration-action-bar__primary').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
})
