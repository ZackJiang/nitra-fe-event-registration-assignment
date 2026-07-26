import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SessionCard from '../../../src/components/registration/sessions/SessionCard.vue'
import { sessions } from '../../../src/mocks/sessions.js'

describe('SessionCard', () => {
  it('renders session details and semantic capacity state', () => {
    const wrapper = mount(SessionCard, {
      props: {
        session: sessions[0],
      },
    })

    expect(wrapper.get('.session-card__track').text()).toBe('MAIN')
    expect(wrapper.get('.session-card__title').text()).toBe(sessions[0].title)
    expect(wrapper.get('.session-card__speaker').text()).toContain(sessions[0].speakerTitle)
    expect(wrapper.get('.session-card__time').text()).toMatch(/9:00 AM . 10:00 AM/)
    expect(wrapper.get('.session-card__capacity').classes()).toContain('session-card__capacity--accent')
    expect(wrapper.get('.session-card__capacity-label').text()).toBe('13 spots left')
  })

  it('emits one toggle from either the card or checkbox', async () => {
    const cardWrapper = mount(SessionCard, {
      props: {
        session: sessions[2],
      },
    })

    await cardWrapper.get('.session-card').trigger('click')
    expect(cardWrapper.emitted('toggle')).toEqual([[sessions[2].id]])

    const checkboxWrapper = mount(SessionCard, {
      props: {
        session: sessions[2],
      },
    })

    await checkboxWrapper.get('.q-checkbox').trigger('click')
    expect(checkboxWrapper.emitted('toggle')).toEqual([[sessions[2].id]])
  })

  it('blocks an unselected sold-out session but permits removing a stale selection', async () => {
    const soldOutWrapper = mount(SessionCard, {
      props: {
        session: sessions[1],
        soldOut: true,
      },
    })

    expect(soldOutWrapper.get('.session-card').attributes('aria-disabled')).toBe('true')
    expect(soldOutWrapper.get('.session-card__capacity-label').text()).toBe('Sold Out')
    await soldOutWrapper.get('.session-card').trigger('click')
    expect(soldOutWrapper.emitted('toggle')).toBeUndefined()

    const selectedWrapper = mount(SessionCard, {
      props: {
        session: sessions[1],
        selected: true,
        soldOut: true,
      },
    })

    expect(selectedWrapper.get('.session-card').attributes('aria-disabled')).toBeUndefined()
    await selectedWrapper.get('.session-card').trigger('click')
    expect(selectedWrapper.emitted('toggle')).toEqual([[sessions[1].id]])
  })

  it('associates its checkbox with the deferred error message', () => {
    const wrapper = mount(SessionCard, {
      props: {
        session: sessions[3],
        selected: true,
        hasError: true,
        errorMessageId: 'session-error',
      },
    })

    expect(wrapper.get('.session-card').classes()).toContain('session-card--error')
    expect(wrapper.get('.q-checkbox').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('.q-checkbox').attributes('aria-describedby')).toBe('session-error')
  })
})
