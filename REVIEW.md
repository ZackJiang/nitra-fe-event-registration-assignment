# REVIEW.md

# Frontend Interview Review Checklist

The implementation is not complete until every section below has been reviewed.

Do not simply answer "Looks good."

Identify weaknesses and propose improvements whenever possible.

---

# 1. Vue Patterns (25%)

## Composition API

- Is Composition API used consistently?
- Are composables extracted where appropriate?
- Is business logic separated from UI?
- Is component responsibility clear?

---

## State Management

- Is shared state implemented cleanly?
- Is provide/inject only used when appropriate?
- Is state duplicated anywhere?

---

## Computed vs Watch

Prefer

✔ computed()

instead of

✘ watch()

unless reacting to external side effects.

Review every watch().

Ask:

Can this become computed()?

---

## v-model

If child components expose editable state,

prefer

defineModel()

instead of

props + emits

---

## Component Size

Review every component.

Questions

- Does this component have one responsibility?
- Can part of this component become reusable?
- Is the component becoming too large?

Target

<200 lines whenever practical.

---

# 2. Design Fidelity (20%)

Compare implementation against the Figma design.

Review

□ spacing

□ typography

□ border radius

□ colors

□ shadows

□ alignment

□ responsive behavior

---

## Styling

Reject

Hardcoded colors

Hardcoded spacing

Prefer

CSS variables

UnoCSS shortcuts

Semantic tokens

---

## Interactive States

Verify

□ hover

□ active

□ focus

□ disabled

□ loading

□ validation error

No state should be missing.

---

# 3. Code Quality (20%)

Review naming.

Reject

data

temp

value

obj

foo

Prefer

selectedPlan

isCurrentStepValid

calculateTotalPrice

---

## Functions

Review every large function.

Questions

- Can this be split?
- Is there duplicated logic?
- Can early return improve readability?
- Are there unnecessary nested conditions?

---

## Folder Structure

Review

- components
- composables
- utils
- constants
- types

Business logic should never live inside UI components.

---

## JSDoc

Verify

Exported composables

Exported utility functions

Public helper functions

have meaningful documentation.

---

## TypeScript

Review

□ unnecessary any

□ missing return types

□ duplicated types

□ unsafe type assertions

---

# 4. JavaScript Logic (20%)

Review

Business rules

Validation

Calculations

Sorting

Grouping

Filtering

Mapping

Edge cases

---

Ask

Can this fail?

Can this overflow?

Can this become undefined?

Can this receive empty data?

---

Verify

Boundary conditions

Empty arrays

Null values

Invalid input

Async failures

Repeated clicks

---

# 5. UX Polish (15%)

Review

Stepper

Navigation

Animations

Validation

Loading

Error messages

Disabled states

---

Questions

Does the UI feel smooth?

Can the user become confused?

Can duplicate actions happen?

Are validation errors helpful?

---

# Accessibility

Review

Semantic HTML

Keyboard navigation

Focus states

Labels

ARIA attributes

Color contrast

---

# Performance

Review

Repeated rendering

Expensive computed values

Unnecessary watch()

Repeated calculations inside template

Duplicated API calls

---

# Quasar

Verify

Prefer Quasar components over custom implementations.

Avoid rebuilding

Buttons

Dialogs

Forms

Stepper

Inputs

Cards

Selections

unless customization truly requires it.

---

# Maintainability

Ask

Would another engineer understand this code six months later?

Can a new feature be added easily?

Is the architecture scalable?

---

# AI Review

Review the AI generated code critically.

Never assume generated code is correct.

For every feature identify

- What AI did well
- What AI did poorly
- What was manually improved
- What should be refactored later

---

# Final Score

Before marking the task complete, score the implementation.

## Vue Patterns

/25

Comments:

---

## Design Fidelity

/20

Comments:

---

## Code Quality

/20

Comments:

---

## JavaScript Logic

/20

Comments:

---

## UX

/15

Comments:

---

## Overall

Total

\_\_/100

---

If the score is below 95/100,

continue improving the implementation before considering the task complete.
