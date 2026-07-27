import { computed } from 'vue'
import { ADDON_CATEGORIES } from '../constants/addons.js'
import { formatUsd } from '../utils/registrationPricing.js'
import { formatUtcDate, formatUtcTimeRange } from '../utils/registrationSchedule.js'

const CATEGORY_LABELS = new Map(ADDON_CATEGORIES.map(({ id, label }) => [id, label]))

/**
 * Build display-ready review data without duplicating registration business rules.
 *
 * @param {Object} input
 * @param {import('vue').ComputedRef | Record<string, unknown>} input.attendee
 * @param {Record<string, unknown> | null} input.selectedTicket
 * @param {Array<Record<string, unknown>>} input.selectedSessions
 * @param {Array<{ addon: Record<string, unknown>, selection: Record<string, unknown> }>} input.selectedAddons
 * @param {import('../types/registration.js').PricingBreakdown} input.pricingBreakdown
 * @param {import('../types/registration.js').ValidationIssue[]} input.visibleIssues
 * @param {boolean} input.hasSelectedMerchandise
 * @returns {Object}
 */
export function useRegistrationReview(input) {
  const issuesByStep = computed(() => input.visibleIssues.reduce((issues, issue) => {
    if (!issues[issue.stepId]) {
      issues[issue.stepId] = []
    }

    issues[issue.stepId].push(issue)
    return issues
  }, {}))
  const attendeeIssues = computed(() => issuesByStep.value[1] ?? [])
  const sessionIssues = computed(() => issuesByStep.value[2] ?? [])
  const addonIssues = computed(() => issuesByStep.value[3] ?? [])
  const addonLinesById = computed(() => new Map(
    input.pricingBreakdown.addonLines.map((line) => [line.sourceId, line]),
  ))
  const attendeeRows = computed(() => {
    const rows = [
      createFieldRow('fullName', 'Name'),
      createFieldRow('email', 'Email'),
      createFieldRow('phone', 'Phone'),
      createFieldRow('company', 'Company'),
      createFieldRow('jobTitle', 'Job Title'),
      createTicketRow(),
    ]

    if (input.hasSelectedMerchandise || hasText(input.attendee.shippingAddress)) {
      rows.push(createFieldRow('shippingAddress', 'Shipping Address', true))
    }

    return rows
  })
  const sessionRows = computed(() => [...input.selectedSessions]
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
    .map((session) => ({
      id: session.id,
      label: getSessionDateTime(session),
      value: session.title,
      hasError: hasIssueForTarget(sessionIssues.value, session.id),
    })))
  const addonRows = computed(() => input.selectedAddons.map(({ addon, selection }) => ({
    id: addon.id,
    label: CATEGORY_LABELS.get(addon.category) ?? 'Add-on',
    value: getAddonLabel(addon, selection),
    hasError: hasIssueForTarget(addonIssues.value, addon.id),
  })))

  function createFieldRow(fieldId, label, requiredForMerchandise = false) {
    const issue = attendeeIssues.value.find((candidate) => (
      candidate.targetType === 'field' && candidate.targetIds.includes(fieldId)
    ))
    const value = input.attendee[fieldId]

    return {
      id: fieldId,
      label,
      value: getFieldDisplay(value, issue, requiredForMerchandise),
      hasError: Boolean(issue),
    }
  }

  function createTicketRow() {
    const issue = attendeeIssues.value.find((candidate) => candidate.targetType === 'ticket')
    const totalCents = input.pricingBreakdown.ticketLine?.lineTotalCents

    return {
      id: 'ticketType',
      label: 'Ticket Type',
      value: input.selectedTicket
        ? `${input.selectedTicket.name} (${formatUsd(totalCents)})`
        : issue ? '— (required)' : '—',
      hasError: Boolean(issue),
    }
  }

  function getAddonLabel(addon, selection) {
    const line = addonLinesById.value.get(addon.id)
    const quantityLabel = addon.category === 'merchandise' ? ` × ${selection.quantity}` : ''
    const sizeLabel = selection.size ? ` (${selection.size})` : ''
    const priceLabel = line ? ` (${formatUsd(line.lineTotalCents)})` : ''
    return `${addon.name}${quantityLabel}${sizeLabel}${priceLabel}`
  }

  return {
    attendeeIssues,
    sessionIssues,
    addonIssues,
    attendeeRows,
    sessionRows,
    addonRows,
  }
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasIssueForTarget(issues, targetId) {
  return issues.some((issue) => issue.targetIds.includes(targetId))
}

function getFieldDisplay(value, issue, requiredForMerchandise) {
  if (!issue) {
    return value || '—'
  }

  if (!hasText(value)) {
    return requiredForMerchandise
      ? '— (required for merchandise)'
      : '— (required)'
  }

  return value
}

function getSessionDateTime(session) {
  return [
    formatUtcDate(session.date),
    formatUtcTimeRange(session.date, session.endDate),
  ].filter(Boolean).join(', ')
}
