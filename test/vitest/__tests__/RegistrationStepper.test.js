import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RegistrationStepper from '../../../src/components/registration/shell/RegistrationStepper.vue'

function mountStepper(props = {}) {
  return mount(RegistrationStepper, {
    props: {
      currentStep: 2,
      ...props,
    },
  })
}

describe('RegistrationStepper', () => {
  it('renders error, active, and pending states with accessible labels', () => {
    const wrapper = mountStepper({
      errorStepIds: [1],
    })
    const tabs = wrapper.findAll('.q-stepper__tab')

    expect(tabs).toHaveLength(4)
    expect(tabs[0].classes()).toContain('q-stepper__tab--error')
    expect(tabs[0].classes()).toContain('q-stepper__tab--error-with-icon')
    expect(decodeURIComponent(tabs[0].get('.q-stepper__dot .q-icon img').attributes('src')))
      .toContain('exclamation-icon')
    expect(tabs[0].get('.q-stepper__title').text()).toBe('Attendee Info')
    expect(tabs[1].classes()).toContain('q-stepper__tab--active')
    expect(tabs[1].get('.q-stepper__dot').text()).toBe('2')
    expect(tabs[2].classes()).not.toContain('q-stepper__tab--active')
    expect(tabs.map((tab) => tab.text())).toEqual([
      expect.stringContaining('Attendee Info'),
      expect.stringContaining('Sessions'),
      expect.stringContaining('Add-ons'),
      expect.stringContaining('Review'),
    ])
  })

  it('keeps the error icon when the invalid step is active', () => {
    const wrapper = mountStepper({
      currentStep: 1,
      errorStepIds: [1],
    })
    const activeErrorStep = wrapper.findAll('.q-stepper__tab')[0]

    expect(activeErrorStep.classes()).toEqual(expect.arrayContaining([
      'q-stepper__tab--active',
      'q-stepper__tab--error',
      'q-stepper__tab--error-with-icon',
    ]))
    expect(decodeURIComponent(activeErrorStep.get('.q-stepper__dot .q-icon img').attributes('src')))
      .toContain('exclamation-icon')
  })

  it('marks earlier valid steps as completed', () => {
    const wrapper = mountStepper({
      currentStep: 3,
    })
    const tabs = wrapper.findAll('.q-stepper__tab')

    expect(tabs[0].classes()).toContain('q-stepper__tab--done')
    expect(tabs[1].classes()).toContain('q-stepper__tab--done')
    expect(tabs[2].classes()).toContain('q-stepper__tab--active')
  })

  it('keeps the connector entering the active Step 3 in the completed state', () => {
    const wrapper = mountStepper({
      currentStep: 3,
    })
    const activeDot = wrapper.findAll('.q-stepper__tab')[2].get('.q-stepper__dot')

    expect(activeDot.exists()).toBe(true)
    expect(wrapper.findAll('.q-stepper__tab--done')).toHaveLength(2)
  })

  it('keeps the full connector completed when the next step has an error', () => {
    const wrapper = mountStepper({
      currentStep: 3,
      errorStepIds: [2],
    })
    const tabs = wrapper.findAll('.q-stepper__tab')

    expect(tabs[0].classes()).toContain('q-stepper__tab--done')
    expect(tabs[1].classes()).toContain('q-stepper__tab--error')
    expect(tabs[1].get('.q-stepper__dot').exists()).toBe(true)
  })

  it('allows visited steps but blocks unvisited future steps', async () => {
    const wrapper = mountStepper()
    const tabs = wrapper.findAll('.q-stepper__tab')

    await tabs[2].trigger('click')
    expect(wrapper.emitted('step-request')).toBeUndefined()

    await tabs[0].trigger('click')
    expect(wrapper.emitted('step-request')).toEqual([[1]])
    expect(wrapper.emitted('update:currentStep')).toEqual([[1]])
  })

  it('allows navigation to a future step when that step has an error', async () => {
    const wrapper = mountStepper({
      errorStepIds: [4],
    })

    await wrapper.findAll('.q-stepper__tab')[3].trigger('click')

    expect(wrapper.emitted('step-request')).toEqual([[4]])
    expect(wrapper.emitted('update:currentStep')).toEqual([[4]])
  })
})
