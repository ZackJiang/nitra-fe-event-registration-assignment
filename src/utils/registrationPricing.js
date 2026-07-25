const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/**
 * Convert a dollar amount to integer cents.
 *
 * @param {unknown} amount
 * @returns {number}
 */
export function toCents(amount) {
  return typeof amount === 'number' && Number.isFinite(amount)
    ? Math.max(Math.round(amount * 100), 0)
    : 0
}

/**
 * Build the itemized registration price calculation.
 *
 * @param {Object} input
 * @param {{ ticketTypes?: Array<{ id: string, name: string, price: number }> } | null | undefined} input.eventData
 * @param {Array<{ id: string, category: string, name: string, price: number }> | null | undefined} input.addonData
 * @param {string | null | undefined} input.ticketTypeId
 * @param {Record<string, import('../types/registration.js').AddonSelection> | null | undefined} input.addonSelections
 * @returns {import('../types/registration.js').PricingBreakdown}
 */
export function calculatePricingBreakdown({
  eventData,
  addonData,
  ticketTypeId,
  addonSelections,
} = {}) {
  const ticket = Array.isArray(eventData?.ticketTypes)
    ? eventData.ticketTypes.find((ticketType) => ticketType.id === ticketTypeId)
    : undefined

  const ticketLine = ticket
    ? createPricingLine(ticket.id, ticket.name, 'ticket', 1, ticket.price)
    : null

  const addonLines = Array.isArray(addonData)
    ? addonData.flatMap((addon) => {
      const quantity = getValidQuantity(addonSelections?.[addon.id]?.quantity)

      if (quantity === 0 || !isPricingCategory(addon.category)) {
        return []
      }

      return [createPricingLine(
        addon.id,
        addon.name,
        addon.category,
        quantity,
        addon.price,
      )]
    })
    : []

  const ticketTotalCents = ticketLine?.lineTotalCents ?? 0
  const addonTotalCents = addonLines.reduce((total, line) => total + line.lineTotalCents, 0)
  const workshopSubtotalCents = addonLines
    .filter((line) => line.category === 'workshop')
    .reduce((total, line) => total + line.lineTotalCents, 0)
  const discountCents = ticket?.id === 'vip'
    ? Math.round(workshopSubtotalCents * 0.1)
    : 0
  const subtotalCents = ticketTotalCents + addonTotalCents

  return {
    ticketLine,
    addonLines,
    discountCents,
    subtotalCents,
    totalCents: Math.max(subtotalCents - discountCents, 0),
  }
}

/**
 * Format integer cents as US dollars.
 *
 * @param {unknown} cents
 * @returns {string}
 */
export function formatUsd(cents) {
  const normalizedCents = typeof cents === 'number' && Number.isFinite(cents)
    ? Math.max(Math.round(cents), 0)
    : 0

  return USD_FORMATTER.format(normalizedCents / 100)
}

/**
 * @param {string} sourceId
 * @param {string} label
 * @param {'ticket' | 'workshop' | 'meal' | 'merchandise'} category
 * @param {number} quantity
 * @param {unknown} price
 * @returns {import('../types/registration.js').PricingLine}
 */
function createPricingLine(sourceId, label, category, quantity, price) {
  const unitPriceCents = toCents(price)

  return {
    sourceId,
    label,
    category,
    quantity,
    unitPriceCents,
    lineTotalCents: unitPriceCents * quantity,
  }
}

/**
 * @param {unknown} quantity
 * @returns {number}
 */
function getValidQuantity(quantity) {
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 0
}

/**
 * @param {unknown} category
 * @returns {category is 'workshop' | 'meal' | 'merchandise'}
 */
function isPricingCategory(category) {
  return category === 'workshop' || category === 'meal' || category === 'merchandise'
}
