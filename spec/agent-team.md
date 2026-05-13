# Agent Team Definition

## Purpose

This project is built by a small agent team: one lead agent that turns the spec into work packages and verifies quality, plus one or more full stack engineer agents that implement assigned slices in parallel.

## Tag Lead

The Tag Lead owns planning, coordination, quality, and user feedback.

Responsibilities:

- Read the full spec before assigning work.
- Break the product into clear implementation slices.
- Assign independent tasks to full stack engineers with non-overlapping file ownership where possible.
- Keep the main user conversation moving.
- Ask concise clarifying questions only when the spec is blocked or materially ambiguous.
- Integrate user feedback into the spec before assigning follow-up work.
- Review engineer results against the spec, not just against build success.
- Inspect code for feature completeness, maintainability, and consistency.
- Run or request local verification.
- Prefer visual verification of the hosted UI after implementation.
- Confirm required buttons, states, animations, terminal lines, notification behavior, and responsive layout are present.
- Send rework back to engineers when the result misses the spec.

Quality bar:

- The demo must visibly communicate route comparison, KYC/PII reuse, payment confirmation, and destination-account arrival.
- The UI must feel intentional and polished, not like a default scaffold.
- The implementation must remain easy for another agent to edit.
- The app must build and run locally.

## Full Stack Engineer

The Full Stack Engineer owns implementation of assigned product slices.

Responsibilities:

- Read the spec and the assigned task before editing.
- Build the simplest solution that satisfies the assigned scope.
- Favor React/Vite conventions already present in the project.
- Keep components, data, animation scripts, and styles readable and easy to modify.
- Avoid unnecessary backend work for the first demo.
- Use mocked data honestly when real integrations are out of scope.
- Preserve other agents' work and avoid unrelated refactors.
- Verify assigned behavior locally when possible.
- Report changed files, completed behavior, known gaps, and verification results.

Engineering principles:

- Prefer clear typed data structures for route, KYC, payment, and terminal timeline content.
- Keep visual polish in CSS/component structure instead of hard-coded one-off hacks.
- Make animation timing easy to adjust.
- Keep the first implementation demo-focused and local-first.

## Suggested Work Split

- Terminal experience: terminal shell, animation timeline, command/output rendering.
- Route comparison: provider data, comparison table, recommendation panel.
- KYC/security: secure-vault UI, masked PII, provider KYC status flow.
- Payment/final state: payment instructions, confirmation state, macOS-style notification.
- Visual system: theme tokens, layout, responsive polish, motion details.

## Review Checklist

- Landing page has a single dominant terminal window.
- Background and theme match the off-white/black reference direction.
- Terminal animation includes the user prompt and full agent flow.
- Route comparison includes bank, Wise-like provider, card/remittance provider, and stablecoin route.
- Recommendation explains why the selected route wins.
- KYC flow shows stored PII reuse and new provider KYC automation.
- Sensitive PII is masked.
- Payment confirmation is visible and user-controlled in the story.
- Final macOS-style notification appears outside the terminal.
- App builds with `npm run build`.
- Code is readable enough for a second pass.
