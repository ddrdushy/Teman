# 13 · Build Goals — G0 to G23

> **RECONSTRUCTED.** This file was referenced by the build directive but did not
> exist in the repo or anywhere on disk. It has been reconstructed from the
> fixed anchors in that directive (G2, G5, G9→G10, G11, G16, G20, G21 and the
> six checkpoints), the module map in `docs/02_FULL_BUILD_PLAN.md`, and the V1
> build order in `docs/04_V1_VOLUNTEER_ONBOARDING.md`. Corrections belong here,
> not in memory — edit this file if the sequence is wrong.

★ = mandatory checkpoint: stop, report, wait.

Seed data grows at every goal from G6 onward. A goal that adds a surface adds
the rows that make that surface demonstrable. G21 is assembly and texture, not
a from-zero write.

---

## Foundation

### G0 · Survey
Read every doc in the directive's list. Verify repo state, report gaps,
guesses and contradictions **before changing anything**.
**Done when:** the report is delivered.

### G1 · Local foundation
Postgres up locally (PostGIS, pgcrypto, pgboss schema) · first migration
applied with the GIST indexes · phone-OTP sign-in end to end with rate limits,
SMS stubbed in dev · session persists · language and text size persist **per
account** · R2 storage helper · worker runs under pg-boss · Sentry wired.
**Done when:** sign in by phone on localhost, switch four languages and three
text sizes, choice survives a reload and a sign-out/sign-in.

### G2 · Deployed ★
Compose up on the VPS · Caddy TLS live on the real domain · nightly backup job
runs · **a backup restored into a scratch database and proven**.
**Done when:** the G1 done-when passes on the domain over HTTPS.
*Requires from the operator: VPS + SSH access, DOMAIN, R2 credentials,
SMS provider key. Blocked without them.*

## Design system

### G3 · Type & tokens proven
Fonts self-hosted (no Google Fonts request on a 3G Android) · per-script
metrics live off `html[lang]` · text-scale 18/22/26 mechanism global ·
a contrast-check script that computes the ratios in TEMAN_BRAND_KIT.md §4
from tokens.css and fails CI if any pair regresses.
**Done when:** the script prints the table and every approved pair passes.

### G4 · Core primitives 1–15
The fifteen from `docs/09_COMPONENT_LIBRARY.md`, in the build order it gives,
every state, i18n keys only.
**Done when:** all fifteen render in every state in four locales at three sizes.

### G5 · Primitives 16–28 + /dev/components ★
The thirteen from batch 2 (ListRow, Switch, Counter, Segmented, Accordion,
Avatar/AvatarGroup, Toast-with-undo, Skeleton, ProgressRing, DayPicker,
Calendar, Sisi-animated, Tick-drawn) · motion policy from batch 2 ·
`/dev/components` rendering all 28 × states × 4 locales × 3 sizes, in the
repo forever.
**Done when:** the page exists and every hard rule holds on it.

## M1 — the NGO release

### G6 · Entry & join
A1–A7. Resumable, back never destroys input, "Step n of n" always.
### G7 · Home & shell
B1–B8 including elder view (B2) and the pre-launch home content from docs/04.
### G8 · Member verification
D1–D6 · R2 upload via signed URLs · `doc_hash` dedupe · 90-day purge job.
### G9 · Admin verification review
Admin shell, two roles server-side · N6–N8 queue/detail/duplicates ·
keyboard A/R/→ · every decision and every document view in `audit_log`.
**Non-negotiable: before G10.**
### G10 · Profile & availability
C1–C8 · F1–F4 · availability radius as three named choices.
### G11 · M1 complete ★
Every acceptance criterion in docs/04 passes, measured not asserted.
**Done when:** a volunteer registers → verifies → completes a profile →
declares availability, in Tamil, at 26 px, on a real phone.

## M2–M6 — the product

### G12 · Requests
E1–E16 · seven steps, one decision each, autosave · emotional-mood step ·
visibility · expiry job wired to the honest-notice promise.
### G13 · Journeys & overlap
F5–F6 · overlap detection both directions.
### G14 · Matching & discovery
The docs/03 query in `lib/matching.ts` (the only discovery query) · Around
You counters · G1–G10 screens · block-aware · accessibility above the offer
button.
### G15 · Match, coordination, messaging
H1–H9 · mutual accept creates the match row · exact location only through
`revealLocation()`, logged · request-scoped threads · 24 h and 2 h reminders.
### G16 · Session & safety ★
I1–I14 · both-confirm start/end · foreground-only live location, stated
plainly · safety sheet with 999 first · reports, blocks, immediate matching
restriction · trusted contacts notified.
**Non-negotiable: live before anything lets two people meet.**

## M7–M10 — the rest

### G17 · Feedback & trust
J1–J5 · descriptors public, `felt_safe`/`would_meet_again` private ·
`felt_safe=false` opens a case, touches no number · Teman Moment recorded.
### G18 · Community & relationships
K1–K14 · trusted Temans per recipient · recurring (ending needs no reason) ·
circles · organisations · calendar · notification centre.
### G19 · Admin platform complete
The rest of N1–N22 · analytics with Teman Moments as the headline · unmet
demand by area · translations screen · append-only audit log view.
### G20 · Public site ★
P1–P12 · four languages · Sisi completes on scroll in the hero · P4 and P6
written first.

## Demo

### G21 · Demo world ★
Full docs/10: 40 volunteers, 8 recipients, 25 requests across all states,
15 sessions with human-shaped feedback, incidents incl. #I-0093, flagged
requests, ~60 audit entries, 90-day analytics curve, unmet-demand numbers,
4 demo logins with OTP 000000, one-command reset under 30 s, refuses to run
against production.
### G22 · AI, degrading to none
The docs/12 features behind `lib/ai` — speech-to-form UI, read-aloud,
category suggestion, moderation triage, incident summary, FAQ answering,
translation drafting — every one verified working with `AI_PROVIDER=none`.
`providers/ilmu.ts` stays untouched.
### G23 · Demo rehearsal — DONE
The ten-step demo path from docs/02 runs end to end on the deployed VPS, in
Tamil at Large text, no empty screens, admin showing the seeded verification
queue, incident queue and analytics.
