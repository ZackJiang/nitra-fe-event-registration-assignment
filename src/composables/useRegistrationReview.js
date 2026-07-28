import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { WIZARD_STEP } from '../constants/wizard.js'
import { formatUsd } from '../utils/registrationPricing.js'
import { formatUtcDate, formatUtcTimeRange } from '../utils/registrationSchedule.js'

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
  const { locale, t } = useI18n()
  const issuesByStep = computed(() => input.visibleIssues.reduce((issues, issue) => {
    if (!issues[issue.stepId]) {
      issues[issue.stepId] = []
    }

    issues[issue.stepId].push(issue)
    return issues
  }, {}))
  const attendeeIssues = computed(() => issuesByStep.value[WIZARD_STEP.ATTENDEE] ?? [])
  const sessionIssues = computed(() => issuesByStep.value[WIZARD_STEP.SESSIONS] ?? [])
  const addonIssues = computed(() => issuesByStep.value[WIZARD_STEP.ADDONS] ?? [])
  const addonLinesById = computed(() => new Map(
    input.pricingBreakdown.addonLines.map((line) => [line.sourceId, line]),
  ))
  const attendeeRows = computed(() => {
    const rows = [
      createFieldRow('fullName'),
      createFieldRow('email'),
      createFieldRow('phone'),
      createFieldRow('company'),
      createFieldRow('jobTitle'),
      createTicketRow(),
    ]

    if (input.hasSelectedMerchandise || hasText(input.attendee.shippingAddress)) {
      rows.push(createFieldRow('shippingAddress', true))
    }

    return rows
  })
  const sessionRows = computed(() => [...input.selectedSessions]
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
    .map((session) => ({
      id: session.id,
      label: getSessionDateTime(session, locale.value),
      value: session.title,
      hasError: hasIssueForTarget(sessionIssues.value, session.id),
    })))
  const addonRows = computed(() => input.selectedAddons.map(({ addon, selection }) => ({
    id: addon.id,
    label: t(`addons.categories.${addon.category}`),
    value: getAddonLabel(addon, selection),
    hasError: hasIssueForTarget(addonIssues.value, addon.id),
  })))

  function createFieldRow(fieldId, requiredForMerchandise = false) {
    const issue = attendeeIssues.value.find((candidate) => (
      candidate.targetType === 'field' && candidate.targetIds.includes(fieldId)
    ))
    const value = input.attendee[fieldId]

    return {
      id: fieldId,
      label: t(`review.fields.${fieldId}`),
      value: getFieldDisplay(value, issue, requiredForMerchandise),
      hasError: Boolean(issue),
    }
  }

  function createTicketRow() {
    const issue = attendeeIssues.value.find((candidate) => candidate.targetType === 'ticket')
    const totalCents = input.pricingBreakdown.ticketLine?.lineTotalCents

    return {
      id: 'ticketType',
      label: t('review.fields.ticketType'),
      value: input.selectedTicket
        ? `${input.selectedTicket.name} (${formatUsd(totalCents, locale.value)})`
        : issue ? t('review.required') : t('review.empty'),
      hasError: Boolean(issue),
    }
  }

  function getAddonLabel(addon, selection) {
    const line = addonLinesById.value.get(addon.id)
    const quantityLabel = addon.category === 'merchandise' ? ` × ${selection.quantity}` : ''
    const sizeLabel = selection.size ? ` (${selection.size})` : ''
    const priceLabel = line ? ` (${formatUsd(line.lineTotalCents, locale.value)})` : ''
    return `${addon.name}${quantityLabel}${sizeLabel}${priceLabel}`
  }

  function getFieldDisplay(value, issue, requiredForMerchandise) {
    if (!issue) return value || t('review.empty')
    if (hasText(value)) return value
    return requiredForMerchandise ? t('review.requiredForMerchandise') : t('review.required')
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

function getSessionDateTime(session, locale) {
  return [
    formatUtcDate(session.date, locale),
    formatUtcTimeRange(session.date, session.endDate, locale),
  ].filter(Boolean).join(', ')
}
