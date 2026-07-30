# Development Process

## Planning and Project Setup

- I first defined the project conventions in `AGENTS.md` and `REVIEW.md` for Codex to follow.
- I then asked Codex to plan the overall development workflow and document it in `/docs/PLAN.md`.
- The development workflow was divided into seven phases.
- Each phase was planned and implemented independently, with its development plan documented under the `/docs` directory.

## UI Testing and Improvements

After completing all seven phases and establishing a minimum viable product (MVP), I began UI testing and made the following improvements:

- Added internationalization (`i18n`) support. Since the Figma design did not include a language-switching state, the application currently determines the language based on the browser’s language settings.
- Fixed incorrect connector states between steps in the stepper.
- Assigned default sizes, such as `S`, to certain merchandise items. This prevents validation errors when users do not explicitly select a size.
- Replaced magic numbers such as `1`, `2`, `3`, and `4` used for identifying steps with an enum to improve code readability and maintainability.
- Removed the unnecessary summary card that AI had added to the success page.
