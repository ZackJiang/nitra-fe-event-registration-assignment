import { describe, expect, it } from 'vitest'
import {
  doTimeRangesOverlap,
  findScheduleConflicts,
  formatUtcDate,
  formatUtcTimeRange,
  getRemainingCapacity,
  groupItemsByUtcDate,
  isAtCapacity,
} from '../../../src/utils/registrationSchedule.js'

describe('registration schedule utilities', () => {
  it('groups and sorts items by UTC date without mutating the source', () => {
    const source = [
      { id: 'late', date: '2028-11-15T15:00:00Z' },
      { id: 'next-day', date: '2028-11-16T09:00:00Z' },
      { id: 'early', date: '2028-11-15T09:00:00Z' },
      { id: 'invalid', date: undefined },
    ]
    const originalOrder = source.map((item) => item.id)

    const grouped = groupItemsByUtcDate(source)

    expect(Object.keys(grouped)).toEqual(['2028-11-15', '2028-11-16'])
    expect(grouped['2028-11-15'].map((item) => item.id)).toEqual(['early', 'late'])
    expect(source.map((item) => item.id)).toEqual(originalOrder)
    expect(groupItemsByUtcDate(undefined)).toEqual({})
  })

  it('formats dates and time ranges in UTC', () => {
    expect(formatUtcDate('2028-11-15T23:30:00-08:00')).toBe('Nov 16')
    expect(formatUtcTimeRange(
      '2028-11-15T09:00:00Z',
      '2028-11-15T10:30:00Z',
    )).toMatch(/^9:00 AM . 10:30 AM$/)
    expect(formatUtcTimeRange(undefined, undefined)).toBe('')
  })

  it('uses half-open intervals and rejects invalid ranges', () => {
    expect(doTimeRangesOverlap(
      '2028-11-15T09:00:00Z',
      '2028-11-15T10:00:00Z',
      '2028-11-15T10:00:00Z',
      '2028-11-15T11:00:00Z',
    )).toBe(false)
    expect(doTimeRangesOverlap(
      '2028-11-15T09:00:00Z',
      '2028-11-15T11:00:00Z',
      '2028-11-15T10:00:00Z',
      '2028-11-15T10:30:00Z',
    )).toBe(true)
    expect(doTimeRangesOverlap('invalid', 'invalid', 'invalid', 'invalid')).toBe(false)
  })

  it('returns every unique conflict pair', () => {
    const conflicts = findScheduleConflicts([
      { id: 'a', date: '2028-11-15T09:00:00Z', endDate: '2028-11-15T11:00:00Z' },
      { id: 'b', date: '2028-11-15T10:00:00Z', endDate: '2028-11-15T12:00:00Z' },
      { id: 'c', date: '2028-11-15T10:30:00Z', endDate: '2028-11-15T13:00:00Z' },
      { id: 'a', date: '2028-11-15T09:00:00Z', endDate: '2028-11-15T11:00:00Z' },
    ])

    expect(conflicts).toEqual([
      { firstId: 'a', secondId: 'b' },
      { firstId: 'a', secondId: 'c' },
      { firstId: 'b', secondId: 'c' },
    ])
  })

  it('handles capacity boundaries safely', () => {
    expect(getRemainingCapacity(10, 3)).toBe(7)
    expect(getRemainingCapacity(10, 12)).toBe(0)
    expect(getRemainingCapacity(undefined, undefined)).toBe(0)
    expect(isAtCapacity(10, 10)).toBe(true)
    expect(isAtCapacity(10, 11)).toBe(true)
    expect(isAtCapacity(undefined, undefined)).toBe(false)
  })
})
