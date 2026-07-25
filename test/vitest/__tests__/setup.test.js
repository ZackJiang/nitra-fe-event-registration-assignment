import { mount } from '@vue/test-utils'
import { QBtn } from 'quasar'
import { describe, expect, it } from 'vitest'

describe('unit test environment', () => {
  it('mounts Quasar components in happy-dom', () => {
    const wrapper = mount(QBtn, {
      props: {
        label: 'Continue',
      },
    })

    expect(wrapper.get('button').text()).toContain('Continue')
  })
})
