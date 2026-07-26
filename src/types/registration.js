/**
 * @typedef {Object} AttendeeInformation
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {string} company
 * @property {string} jobTitle
 * @property {string} shippingAddress
 */

/**
 * @typedef {Object} AddonSelection
 * @property {number} quantity
 * @property {string | null} size
 */

/**
 * @typedef {'workshop' | 'meal' | 'merchandise'} AddonCategory
 */

/**
 * @typedef {Object} AddonAvailability
 * @property {boolean} isSoldOut
 * @property {string[]} conflictingSessionIds
 * @property {boolean} isUnavailableForNewSelection
 */

/**
 * @typedef {Object} RegistrationSubmission
 * @property {'idle' | 'succeeded'} status
 * @property {string | null} confirmationId
 */

/**
 * @typedef {Object} RegistrationState
 * @property {1 | 2 | 3 | 4} currentStep
 * @property {AttendeeInformation} attendee
 * @property {string | null} ticketTypeId
 * @property {string[]} selectedSessionIds
 * @property {Record<string, AddonSelection>} addonSelections
 * @property {boolean} hasAttemptedSubmit
 * @property {RegistrationSubmission} submission
 */

/**
 * @typedef {Object} ValidationIssue
 * @property {string} code
 * @property {1 | 2 | 3} stepId
 * @property {'field' | 'ticket' | 'session' | 'addon'} targetType
 * @property {string[]} targetIds
 * @property {string} message
 */

/**
 * @typedef {Object} PricingLine
 * @property {string} sourceId
 * @property {string} label
 * @property {'ticket' | AddonCategory} category
 * @property {number} quantity
 * @property {number} unitPriceCents
 * @property {number} lineTotalCents
 */

/**
 * @typedef {Object} PricingBreakdown
 * @property {PricingLine | null} ticketLine
 * @property {PricingLine[]} addonLines
 * @property {number} discountCents
 * @property {number} subtotalCents
 * @property {number} totalCents
 */

/**
 * @typedef {Object} ScheduleConflict
 * @property {string} firstId
 * @property {string} secondId
 */

export {}
