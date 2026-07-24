# Runtime Environment

## Framework

Use exactly the project versions unless explicitly instructed otherwise.

- Vue 3.5.17
- Quasar Framework v2.18.5
- Node.js 22.17.0

Do not upgrade dependencies.

Do not introduce additional UI libraries.

Use Quasar components whenever appropriate instead of recreating existing UI components.

# Quasar Guidelines

Prefer Quasar components over custom implementations.

Examples

✔ QBtn
✔ QInput
✔ QForm
✔ QDialog
✔ QSelect
✔ QCard
✔ QStepper

Avoid rebuilding functionality already provided by Quasar.

Keep styling consistent with Quasar conventions.

Use Quasar composables when appropriate.

Avoid unnecessary wrapper components around Quasar components.

# AI Collaboration Rules

You are acting as a Senior Frontend Engineer.

Do not immediately generate code.

For every task:

## Phase 1 — Analysis

First explain

- requirements
- assumptions
- possible edge cases
- affected components
- implementation strategy

If requirements are ambiguous,

state assumptions explicitly instead of guessing.

---

## Phase 2 — Planning

Before coding:

- identify reusable components
- identify composables
- identify shared types
- identify business logic
- identify validation rules
- identify possible edge cases

Briefly explain the architecture before implementation.

---

## Phase 3 — Implementation

Implement one logical feature at a time.

Never generate multiple unrelated features in one step.

Prefer incremental progress over massive code generation.

After each feature compiles successfully,

continue to the next feature.

---

## Phase 4 — Self Review

After implementation review the code.

Check for

- duplicated code
- unnecessary watch()
- incorrect Vue patterns
- readability
- naming
- accessibility
- edge cases
- performance
- Quasar best practices

Refactor before considering the task complete.

Before marking a task complete,

always review the implementation against

REVIEW.md

Do not finish until every checklist item passes.

---

## Phase 5 — Reflection

Before finishing every task,

briefly explain

- why this implementation was chosen
- possible future improvements
- trade-offs

Do not simply state that the task is complete.

# Vue Best Practices

Prefer

computed()

over

watch()

unless reacting to external side effects.

Avoid

watchEffect()

unless truly required.

Prefer

defineModel()

instead of manually wiring props + emits.

Extract reusable logic into composables.

Avoid mutating props.

Avoid deeply nested reactive objects.

Prefer shallow component trees.

Keep templates declarative.

Move complex expressions into computed().

# Architecture

Business logic should not live inside components.

Components should focus on

- rendering
- user interaction

Business logic belongs in

- composables
- utils

Configuration belongs in

- constants

Shared models belong in

- types

Never duplicate business logic.

Always extract reusable code.

# Git

After each completed logical feature,

suggest a commit message.

Commit messages should follow

feat:
fix:
refactor:
style:
docs:

Keep each commit focused on one logical change.

# Final Principle

Quality is preferred over speed.

Never sacrifice maintainability for shorter code.

Every implementation should be understandable by another engineer six months later.

When multiple implementations are possible,

prefer the one that is:

- easier to read
- easier to test
- easier to maintain
- more idiomatic for Vue 3 and Quasar

Assume this code will be reviewed by a Senior Frontend Engineer during an interview.
