import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import SessionStep from '../../../src/components/registration/sessions/SessionStep.vue'
import { sessions } from '../../../src/mocks/sessions.js'
import { groupItemsByUtcDate } from '../../../src/utils/registrationSchedule.js'

const groupedSessions = groupItemsByUtcDate(sessions)

describe('SessionStep', () => {
  it('renders the first UTC date and counts selections across dates', () => {
    const wrapper = mount(SessionStep, {
      props: {
        groupedSessions,
        selectedSessionIds: ['s3', 's8'],
      },
    })

    expect(wrapper.findAll('.q-tab').map((tab) => tab.text())).toEqual(['Nov 15', 'Nov 16'])
    expect(wrapper.get('.session-step__count').text()).toBe('2 sessions selected')
    expect(wrapper.find('[data-session-id="s1"]').exists()).toBe(true)
    expect(wrapper.find('[data-session-id="s7"]').exists()).toBe(false)
  })

  it('switches dates without changing the global selected count', async () => {
    const wrapper = mount(SessionStep, {
      props: {
        groupedSessions,
        selectedSessionIds: ['s8'],
      },
    })

    await wrapper.findAll('.q-tab')[1].trigger('click')

    expect(wrapper.get('.session-step__count').text()).toBe('1 session selected')
    expect(wrapper.find('[data-session-id="s1"]').exists()).toBe(false)
    expect(wrapper.find('[data-session-id="s7"]').exists()).toBe(true)
    expect(wrapper.get('[data-session-id="s8"]').classes()).toContain('session-card--selected')
  })

  it('emits a session toggle without maintaining duplicate selection state', async () => {
    const wrapper = mount(SessionStep, {
      props: {
        groupedSessions,
      },
    })

    await wrapper.get('[data-session-id="s3"]').trigger('click')

    expect(wrapper.emitted('toggle-session')).toEqual([['s3']])
    expect(wrapper.get('.session-step__count').text()).toBe('0 sessions selected')
  })

  it('shows an accessible empty state', () => {
    const wrapper = mount(SessionStep)

    expect(wrapper.get('[role="status"]').text()).toBe('No sessions are available.')
    expect(wrapper.find('.session-step__tabs').exists()).toBe(false)
  })

  it('opens the first invalid date and focuses its first invalid session', async () => {
    const wrapper = mount(SessionStep, {
      attachTo: document.body,
      props: {
        groupedSessions,
        selectedSessionIds: ['s8', 's10'],
        visibleIssues: [{
          code: 'session.conflict',
          stepId: 2,
          targetType: 'session',
          targetIds: ['s8', 's10'],
          message: 'Selected sessions have overlapping times.',
        }],
      },
    })

    await nextTick()

    expect(wrapper.get('.q-tab--active').text()).toBe('Nov 16')
    expect(wrapper.get('[role="alert"]').text()).toBe('Selected sessions have overlapping times.')
    expect(wrapper.get('[data-session-id="s8"]').classes()).toContain('session-card--error')
    expect(document.activeElement).toBe(wrapper.get('[data-session-id="s8"] .q-checkbox').element)
    wrapper.unmount()
  })

  it('clears deferred presentation errors when validation issues disappear', async () => {
    const issue = {
      code: 'session.conflict',
      stepId: 2,
      targetType: 'session',
      targetIds: ['s4', 's5'],
      message: 'Selected sessions have overlapping times.',
    }
    const wrapper = mount(SessionStep, {
      props: {
        groupedSessions,
        selectedSessionIds: ['s4', 's5'],
        visibleIssues: [issue],
      },
    })

    expect(wrapper.findAll('.session-card--error')).toHaveLength(2)
    await wrapper.setProps({ visibleIssues: [] })

    expect(wrapper.find('.session-card--error').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
