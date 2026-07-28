import { describe, expect, it, vi } from 'vitest'
import bootI18n, { i18n } from '../../../src/boot/i18n.js'

describe('i18n boot', () => {
  it('installs the i18n plugin before rendering application components', () => {
    const app = { use: vi.fn() }

    bootI18n({ app })

    expect(app.use).toHaveBeenCalledWith(i18n)
  })
})
