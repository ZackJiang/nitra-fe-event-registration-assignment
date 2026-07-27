/**
 * Stable identifiers for registration wizard steps.
 *
 * Values remain sequential because the Quasar stepper and wizard navigation use
 * their natural order.
 */
export const WIZARD_STEP = Object.freeze({
  ATTENDEE: 1,
  SESSIONS: 2,
  ADDONS: 3,
  REVIEW: 4,
})

/**
 * Ordered wizard step metadata shared by the shell and registration state.
 *
 * @type {ReadonlyArray<{ id: number, label: string }>}
 */
export const WIZARD_STEPS = Object.freeze([
  Object.freeze({ id: WIZARD_STEP.ATTENDEE, label: 'Attendee Info' }),
  Object.freeze({ id: WIZARD_STEP.SESSIONS, label: 'Sessions' }),
  Object.freeze({ id: WIZARD_STEP.ADDONS, label: 'Add-ons' }),
  Object.freeze({ id: WIZARD_STEP.REVIEW, label: 'Review' }),
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
