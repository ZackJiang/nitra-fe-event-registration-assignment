import { describe, expect, it } from 'vitest'
import { addons } from '../../../src/mocks/addons.js'
import { event } from '../../../src/mocks/event.js'
import {
  calculatePricingBreakdown,
  formatUsd,
  toCents,
} from '../../../src/utils/registrationPricing.js'

describe('registration pricing utilities', () => {
  it('calculates integer cents and applies VIP discount only to workshops', () => {
    const breakdown = calculatePricingBreakdown({
      eventData: event,
      addonData: addons,
      ticketTypeId: 'vip',
      addonSelections: {
        ws1: { quantity: 1, size: null },
        meal1: { quantity: 1, size: null },
        merch1: { quantity: 2, size: 'M' },
      },
    })

    expect(breakdown.ticketLine?.lineTotalCents).toBe(59900)
    expect(breakdown.addonLines.map((line) => line.lineTotalCents)).toEqual([
      14900,
      4500,
      7000,
    ])
    expect(breakdown.discountCents).toBe(1490)
    expect(breakdown.subtotalCents).toBe(86300)
    expect(breakdown.totalCents).toBe(84810)
  })

  it('does not discount workshops for non-VIP tickets', () => {
    const breakdown = calculatePricingBreakdown({
      eventData: event,
      addonData: addons,
      ticketTypeId: 'general',
      addonSelections: {
        ws1: { quantity: 1, size: null },
      },
    })

    expect(breakdown.discountCents).toBe(0)
    expect(breakdown.totalCents).toBe(44800)
  })

  it('normalizes invalid inputs without negative totals', () => {
    expect(toCents(10.235)).toBe(1024)
    expect(toCents(-10)).toBe(0)
    expect(calculatePricingBreakdown().totalCents).toBe(0)
    expect(calculatePricingBreakdown({
      eventData: event,
      addonData: addons,
      ticketTypeId: 'missing',
      addonSelections: {
        merch1: { quantity: -2, size: null },
      },
    }).totalCents).toBe(0)
  })

  it('formats cents as en-US currency', () => {
    expect(formatUsd(123456)).toBe('$1,234.56')
    expect(formatUsd(undefined)).toBe('$0.00')
  })
})
