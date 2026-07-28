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
 * @type {ReadonlyArray<{ id: number, labelKey: string }>}
 */
export const WIZARD_STEPS = Object.freeze([
  Object.freeze({ id: WIZARD_STEP.ATTENDEE, labelKey: 'wizard.steps.attendee' }),
  Object.freeze({ id: WIZARD_STEP.SESSIONS, labelKey: 'wizard.steps.sessions' }),
  Object.freeze({ id: WIZARD_STEP.ADDONS, labelKey: 'wizard.steps.addons' }),
  Object.freeze({ id: WIZARD_STEP.REVIEW, labelKey: 'wizard.steps.review' }),
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
