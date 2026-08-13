# V1 — Volunteer Onboarding

The first release with users. Its only job: an NGO-recruited volunteer at an orientation session can register, verify, build a profile and declare availability — in Tamil, on a mid-range Android, without help.

Requests do not exist yet. The app must be honest about that rather than showing empty screens that look broken.

---

## Screens

| # | Route | Screen | Notes |
|---|---|---|---|
| 1 | `/` | Language picker | Before everything. Four options, own scripts, no flags. |
| 2 | `/[locale]/welcome` | What Teman is | Three short lines. One CTA. Language switch stays top-right. |
| 3 | `/[locale]/join/phone` | Phone number | Country prefix fixed to +60, visible not hidden. |
| 4 | `/[locale]/join/otp` | Enter code | 6 digits, 10-minute validity, generous resend. |
| 5 | `/[locale]/join/name` | Your name | Single field. What people will see. |
| 6 | `/[locale]/join/area` | Where you're based | Area picker, not a map pin. |
| 7 | `/[locale]/join/done` | You're in | Peak moment — Sisi completes here. |
| 8 | `/[locale]/verify` | Verification status | Three tiers shown as a ladder, current position clear. |
| 9 | `/[locale]/verify/id` | ID upload | Camera or gallery. MyKad or passport. |
| 10 | `/[locale]/verify/selfie` | Selfie | Explains *why* before opening the camera. |
| 11 | `/[locale]/verify/pending` | Under review | States who reviews and roughly how long. |
| 12 | `/[locale]/profile` | Your profile | Photo, bio, languages, categories, transport. |
| 13 | `/[locale]/availability` | I'm available | Date, time window, area, radius, categories. |
| 14 | `/[locale]/availability/list` | Your availability | Upcoming slots, editable, deletable. |
| 15 | `/[locale]/home` | Home — pre-launch | Honest phase messaging. See below. |
| 16 | `/[locale]/you` | Account | Language, text size, profile, verification, sign out. |
| 17 | `/[locale]/admin/verifications` | Review queue | NGO coordinator. Desktop-first. |
| 18 | `/[locale]/admin/volunteers` | Volunteer directory | Filter by area, tier, language, availability. |

---

## The pre-launch home screen

This screen decides whether the volunteers the NGO recruits are still there when requests open. A "no data yet" empty state will lose them.

**Show:**
- Greeting and their verification status as a clear ladder
- A stated month: *"Requests open in [month]. We'll message you the day they do."*
- Their declared availability, and a prompt to add more
- How many volunteers have joined their area — real community, real progress
- NGO orientation sessions and events they can attend
- Profile completeness, as a checklist, not a percentage bar

**Never show:** an empty request list, a zeroed counter, or "check back soon" with no date.

The line "we'll message you the day they do" is a promise. Put the volunteer list behind a job that actually sends it.

---

## Flow rules

**Phone OTP**
- Rate limit: 3 sends per number per hour, 10 per IP per hour, exponential backoff. Do this before the first real send — an open OTP endpoint is a direct route to a bill.
- 10-minute validity, unlimited entry attempts within it. The audience will misread digits; strictness here locks out the exact people you need.
- Resend button appears after 30 seconds and says how long is left.
- On success, remember the device for 90 days.

**ID verification** — the highest-drop-off step in the app.
- Explain first, ask second: what it's for, who sees it, when it's deleted. Then the camera.
- Accept a gallery upload, not just live camera. Many will have photographed their MyKad already.
- Guide with a frame overlay and a plain-language "all four corners visible, no glare".
- Never block on a client-side quality check. Accept it, let a human review, and say why if it's rejected.
- Rejection is a screen with a reason and a retry, never a dead end.
- State the retention plainly: reviewed, then deleted after 90 days.

**Availability**
- Default to today, then this weekend — the two real cases.
- Radius as three choices (walking distance / same area / anywhere in the city), not a slider. Sliders and unsteady hands don't mix.
- Show what it means back to them: *"You'll hear about requests within about 5 km of Brickfields."*
- Repeat-weekly is a single checkbox, not a schedule builder.

**Everywhere**
- Every step resumable. Leaving mid-flow loses nothing.
- Progress always stated as "Step 3 of 5".
- Back is always available and never destroys input.
- No timeouts on any form.

---

## Admin — verification review

Small, but V1 does not ship without it. The NGO cannot recruit volunteers if nobody can approve them.

- Queue sorted oldest first, with waiting time visible
- Side by side: ID image, selfie, submitted name and area
- Approve / Reject with a reason chosen from a list, plus optional free text
- Duplicate detection on `doc_hash`, flagged prominently
- Every decision writes to `audit_log`
- Images served via short-lived signed URLs, never a public path
- Two roles: NGO coordinator (review only) and platform admin (everything)

---

## Acceptance criteria

Ship when all of these pass:

- [ ] Register through to availability in all four languages, no English leaking through
- [ ] Every screen usable at 26 px text with nothing truncated or overlapping
- [ ] Every tap target ≥ 56 px, primary actions ≥ 64 px, 12 px apart
- [ ] All body text ≥ 7:1 contrast; every border and input outline ≥ 3:1
- [ ] Every control has a visible word — no icon-only buttons anywhere
- [ ] Works on a 3-year-old Android at 3G speeds
- [ ] Works at the OS's largest font setting *on top of* the in-app size
- [ ] Screen reader passes in all four languages with correct `lang` attributes
- [ ] Signing out and back in restores language and text size
- [ ] Every flow resumable after a force-quit
- [ ] ID images unreachable without an admin session and a signed URL
- [ ] Verification decisions appear in `audit_log`
- [ ] OTP rate limits verified by actually trying to abuse the endpoint
- [ ] Nightly backup runs and a restore has been tested once

---

## Build order

1. `docker-compose.yml` + Caddy + a deployed "Selamat pagi" in four languages at three sizes
2. Schema for `person`, `area`, `verification`, `availability` — plus PostGIS and the GIST indexes now, not later
3. Auth: phone OTP with rate limiting
4. The ~15 components, built against the elderly rules
5. Screens 1–7 (join), then 15 (pre-launch home)
6. Screens 8–11 (verification) + R2 storage + retention job
7. Screen 17 (admin review) — before any real volunteer submits an ID
8. Screens 12–14 (profile, availability)
9. Screen 16 (account)
10. Translation pass — human, not machine
11. Test with five people over 65, watch silently, write down every hesitation

Step 11 is not optional and it is not a formality. That list of hesitations is your next sprint, and it will be more useful than anything in this document.

---

## Watch for these

**Translation debt.** Hardcode English "just for now" and you will spend a month extracting strings later. Every string is a key from day one, even while the other three files are English placeholders.

**Verification queue latency.** A volunteer who waits four days for approval has already lost interest. Aim for same-day during recruitment drives, and tell the NGO coordinator that turnaround is their job.

**iOS add-to-home-screen.** Push doesn't work on iOS until the app is installed to the home screen. That needs its own onboarding step with real screenshots in four languages — write it into V1, not V5 when you suddenly need notifications.

**The gap.** Volunteers registering months before requests open is a decay problem, not a technical one. The pre-launch home screen, the area counter, and the promised launch month are your only tools against it. Treat that screen as a real product surface, not filler.
