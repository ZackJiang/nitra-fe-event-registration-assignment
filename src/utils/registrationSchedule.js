/**
 * Convert an ISO timestamp into its UTC date key.
 *
 * @param {unknown} timestamp
 * @returns {string | null}
 */
export function getUtcDateKey(timestamp) {
  const milliseconds = toTimestamp(timestamp)

  if (milliseconds === null) {
    return null
  }

  return new Date(milliseconds).toISOString().slice(0, 10)
}

/**
 * Group records by UTC date without mutating the source array.
 * Invalid or missing timestamps are ignored.
 *
 * @template T
 * @param {T[] | null | undefined} items
 * @param {keyof T} [startKey='date']
 * @returns {Record<string, T[]>}
 */
export function groupItemsByUtcDate(items, startKey = /** @type {keyof T} */ ('date')) {
  if (!Array.isArray(items)) {
    return {}
  }

  const groups = items.reduce((dateGroups, item) => {
    const dateKey = getUtcDateKey(item?.[startKey])

    if (!dateKey) {
      return dateGroups
    }

    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = []
    }

    dateGroups[dateKey].push(item)
    return dateGroups
  }, /** @type {Record<string, T[]>} */ ({}))

  Object.values(groups).forEach((group) => {
    group.sort((firstItem, secondItem) => (
      (toTimestamp(firstItem?.[startKey]) ?? 0) - (toTimestamp(secondItem?.[startKey]) ?? 0)
    ))
  })

  return groups
}

/**
 * Format a timestamp as a short UTC date label.
 *
 * @param {unknown} timestamp
 * @param {string} [locale='en-US']
 * @returns {string}
 */
export function formatUtcDate(timestamp, locale = 'en-US') {
  const milliseconds = toTimestamp(timestamp)
  return milliseconds === null ? '' : new Intl.DateTimeFormat(locale, {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(milliseconds)
}

/**
 * Format a UTC time range.
 *
 * @param {unknown} start
 * @param {unknown} end
 * @param {string} [locale='en-US']
 * @returns {string}
 */
export function formatUtcTimeRange(start, end, locale = 'en-US') {
  const startMilliseconds = toTimestamp(start)
  const endMilliseconds = toTimestamp(end)

  if (startMilliseconds === null || endMilliseconds === null) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric', minute: '2-digit', hour12: locale === 'en-US', timeZone: 'UTC',
  })
  return `${formatter.format(startMilliseconds)} – ${formatter.format(endMilliseconds)}`
}

/**
 * Calculate remaining capacity, clamped to zero.
 *
 * @param {unknown} capacity
 * @param {unknown} registered
 * @returns {number}
 */
export function getRemainingCapacity(capacity, registered) {
  if (!isNonNegativeNumber(capacity) || !isNonNegativeNumber(registered)) {
    return 0
  }

  return Math.max(capacity - registered, 0)
}

/**
 * Calculate capacity utilization as a value between zero and one.
 * A zero-capacity session is treated as fully utilized.
 *
 * @param {unknown} capacity
 * @param {unknown} registered
 * @returns {number}
 */
export function getCapacityUtilization(capacity, registered) {
  if (!isNonNegativeNumber(capacity) || !isNonNegativeNumber(registered)) {
    return 0
  }

  if (capacity === 0) {
    return 1
  }

  return Math.min(registered / capacity, 1)
}

/**
 * Determine whether registration has reached capacity.
 *
 * @param {unknown} capacity
 * @param {unknown} registered
 * @returns {boolean}
 */
export function isAtCapacity(capacity, registered) {
  return isNonNegativeNumber(capacity)
    && isNonNegativeNumber(registered)
    && registered >= capacity
}

/**
 * Check two half-open time ranges for overlap.
 *
 * @param {unknown} startA
 * @param {unknown} endA
 * @param {unknown} startB
 * @param {unknown} endB
 * @returns {boolean}
 */
export function doTimeRangesOverlap(startA, endA, startB, endB) {
  const firstStart = toTimestamp(startA)
  const firstEnd = toTimestamp(endA)
  const secondStart = toTimestamp(startB)
  const secondEnd = toTimestamp(endB)

  if (
    firstStart === null
    || firstEnd === null
    || secondStart === null
    || secondEnd === null
    || firstStart >= firstEnd
    || secondStart >= secondEnd
  ) {
    return false
  }

  return firstStart < secondEnd && secondStart < firstEnd
}

/**
 * Find all unique conflicting item pairs.
 *
 * @param {Array<{ id?: string, date?: unknown, endDate?: unknown }> | null | undefined} items
 * @returns {import('../types/registration.js').ScheduleConflict[]}
 */
export function findScheduleConflicts(items) {
  if (!Array.isArray(items)) {
    return []
  }

  const conflicts = []
  const conflictKeys = new Set()

  for (let firstIndex = 0; firstIndex < items.length; firstIndex += 1) {
    const firstItem = items[firstIndex]

    if (!firstItem?.id) {
      continue
    }

    for (let secondIndex = firstIndex + 1; secondIndex < items.length; secondIndex += 1) {
      const secondItem = items[secondIndex]

      if (
        !secondItem?.id
        || firstItem.id === secondItem.id
        || !doTimeRangesOverlap(firstItem.date, firstItem.endDate, secondItem.date, secondItem.endDate)
      ) {
        continue
      }

      const pair = [firstItem.id, secondItem.id].sort()
      const conflictKey = pair.join(':')

      if (conflictKeys.has(conflictKey)) {
        continue
      }

      conflictKeys.add(conflictKey)
      conflicts.push({ firstId: pair[0], secondId: pair[1] })
    }
  }

  return conflicts
}

/**
 * Check whether an item overlaps any item in a collection.
 *
 * @param {{ date?: unknown, endDate?: unknown } | null | undefined} item
 * @param {Array<{ date?: unknown, endDate?: unknown }> | null | undefined} candidates
 * @returns {boolean}
 */
export function hasScheduleConflict(item, candidates) {
  if (!item || !Array.isArray(candidates)) {
    return false
  }

  return candidates.some((candidate) => doTimeRangesOverlap(
    item.date,
    item.endDate,
    candidate?.date,
    candidate?.endDate,
  ))
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function toTimestamp(value) {
  if (typeof value !== 'string' && !(value instanceof Date) && typeof value !== 'number') {
    return null
  }

  const milliseconds = new Date(value).getTime()
  return Number.isFinite(milliseconds) ? milliseconds : null
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}
