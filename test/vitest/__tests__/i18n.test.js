import { describe, expect, it } from 'vitest'
import { i18n, resolveLocale } from '../../../src/i18n/index.js'
import { formatUsd } from '../../../src/utils/registrationPricing.js'
import { formatUtcDate, formatUtcTimeRange } from '../../../src/utils/registrationSchedule.js'

describe('i18n locale support', () => {
  it('maps supported browser languages and falls back to English', () => {
    expect(resolveLocale(['zh-Hant-TW', 'en-US'])).toBe('zh-TW')
    expect(resolveLocale(['en-GB'])).toBe('en-US')
    expect(resolveLocale(['ja-JP'])).toBe('en-US')
  })

  it('formats registration values using the requested locale while preserving UTC', () => {
    expect(formatUsd(123456, 'zh-TW')).toBe('$1,234.56')
    expect(formatUtcDate('2028-11-15T23:30:00-08:00', 'zh-TW')).toContain('11月16日')
    expect(formatUtcTimeRange('2028-11-16T09:00:00Z', '2028-11-16T10:30:00Z', 'zh-TW')).toMatch(/09:00.*10:30/)
  })

  it('provides translated interface and validation messages', () => {
    const originalLocale = i18n.global.locale.value
    i18n.global.locale.value = 'zh-TW'

    try {
      expect(i18n.global.t('actions.back')).toBe('返回')
      expect(i18n.global.t("validation['ticket.required']")).toBe('請選擇票種。')
    }
    finally {
      i18n.global.locale.value = originalLocale
    }
  })
})
