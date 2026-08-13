# Teman

Free community companionship platform. Malaysia. Elderly + caregivers +
volunteers. PWA, self-hosted on one VPS. Solo dev.

## Hard rules — never break these
- No literal user-visible string in a component. Only i18n keys.
- No hex codes outside src/app/tokens.css.
- Nothing reads request.exactPoint except revealLocation() in lib/privacy.ts.
- person/careRecipient rows never reach the client raw — always a serialiser.
- Amber (--a-400) means a person has answered. Nothing else. Never a warning.
- No star ratings, no scores, no streaks, no engagement metrics.
- Text wraps, never truncates.
- Body text 7:1 contrast, borders 3:1. Targets 64px primary / 56px floor.
- No icon-only controls. No gesture as the only route. No form timeouts.
- Every consequential action writes to audit_log.
- Every AI feature must work with AI_PROVIDER=none.

## Where things are
docs/03_DATA_MODEL.md      — schema + the matching query
docs/07_SCREEN_SPECS_*.md  — what each screen does
docs/09_COMPONENT_LIBRARY.md — the 28 primitives
TEMAN_BRAND_KIT.md         — tokens, with contrast numbers
