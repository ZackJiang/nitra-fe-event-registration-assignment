/**
 * Ordered wizard step metadata shared by the shell and future registration state.
 *
 * @type {ReadonlyArray<{ id: number, label: string }>}
 */
export const WIZARD_STEPS = Object.freeze([
  Object.freeze({ id: 1, label: 'Attendee Info' }),
  Object.freeze({ id: 2, label: 'Sessions' }),
  Object.freeze({ id: 3, label: 'Add-ons' }),
  Object.freeze({ id: 4, label: 'Review' }),
])

/**
 * Check whether a value identifies one of the four registration steps.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isWizardStepId(value) {
  return Number.isInteger(value) && WIZARD_STEPS.some((step) => step.id === value)
}
