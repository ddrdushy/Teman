# Teman — Full Build Plan

Scope is the whole product: all 54 sections, the admin platform, and the public site. Nothing is cut. What follows is the order to build it in, because a fixed scope still has a dependency graph, and getting that order wrong is the thing that stalls a solo build.

**Two facts to plan around.**

First, the size. Roughly **124 screens** — about 90 in the member app, 22 in admin, 12 on the public site — plus a matching engine, four-language i18n, and a verification pipeline. That is a large but ordinary product. It is not a weekend and it is not a year of drifting; treat it as a sequence of eleven modules where each one ends in something you could show.

Second, and less obvious: **a feature-complete app with no data in it demos as a broken app.** Every screen you want to walk the NGO through needs plausible content behind it. Seeded demo data is a build item with real effort, listed as Module 11, and it is the single thing most likely to be left until the night before.

---

## Module map

Modules are ordered by dependency, not by importance. Each ends in something demonstrable.

### M0 · Foundation
*Nothing user-visible. Everything downstream breaks without it.*

Docker Compose (Postgres 16 + PostGIS, Next.js, Caddy) on the VPS · Drizzle schema and first migration with GIST indexes · Auth.js phone OTP with rate limiting · `[locale]` routing for `en · ms · ta · zh` with next-intl · design tokens as CSS variables with per-script font and line-height · the ~15 hand-built primitives (Button, GhostButton, BigAction, TextField, Select, RadioCards, Sheet, Card, Pill, Banner, EmptyState, Stepper, NavBar, LanguageSheet, TextSizeControl) · text-size preference persisted · R2 storage helper · pg-boss job runner · Sentry · nightly encrypted backup.

**Ends with:** sign in by phone, switch four languages and three text sizes, choice survives reload.

The 15 primitives are the highest-leverage hours in the whole build. Every one of the 124 screens is assembled from them. Build them properly against the elderly rules once and the remaining screens go fast; rush them and you will re-fix 124 screens.

---

### M1 · Identity, profiles, verification — 21 screens
Entry: language picker → welcome → phone → OTP → name → area → done.
Member profile: photo, bio, languages, assistance categories, transport, availability habits.
People I Care For: list, add, edit — per-recipient language, mobility, accessibility, conversation preferences, emergency contact.
Verification ladder: basic, identity (MyKad/passport + selfie), community, enhanced — with pending, approved and rejected states.
Account: language, text size, notification preferences, privacy, sign out.

**Ends with:** a volunteer registers, verifies and completes a profile in Tamil on a mid-range Android.

---

### M2 · Requests — 16 screens
Seven-step creation flow, one decision per screen, resumable, plus review and published.
All categories from scope sections 5–11: health and appointments, everyday assistance, elderly companionship, emotional companionship, social companionship, welfare check-in, digital assistance.
Preferences: gender, language, age range, accessibility, driving, same destination, verified only.
Urgency: planned / today / soon.
Visibility: public nearby / selected circles / trusted only.
My Requests with all five states, request detail, edit, cancel.
Approximate and exact location split, enforced in `lib/privacy.ts`.

**Ends with:** a caregiver creates a hospital request for a parent and it sits in Looking.

---

### M3 · Availability and journeys — 6 screens
Declare availability: date, window, area, radius, categories, transport, languages.
Availability list, edit, recurring weekly.
"I'm going there too": add a destination and time; the system surfaces overlaps both ways.

---

### M4 · Matching and offers — 10 screens
The PostGIS query (radius + time overlap + category + language + preferences + trust), ranked by same-destination, then existing trust, then distance.
Around You counters. Nearby request list with filters. Request detail in the Teman's view. Offer to help. My offers.
Requester sees the offer with trust information only — name, photo, languages, area, verification badge, Teman Moments, descriptors.

**Ends with:** availability declared in M3 surfaces a request created in M2 to the right person.

---

### M5 · Match, coordination, messaging — 9 screens
Mutual accept. Exact location and contact details unlock only at that point, through `revealLocation()`.
Matched detail, meeting point confirmation, message thread scoped to the request, thread list.
Reminders at 24 h and 2 h. Cancellation on either side with honest notification.

---

### M6 · Session and safety — 14 screens
Pre-session checklist. Start Teman with both parties confirming. Active session view. Foreground live location. Safety sheet: contact trusted person, call 999, share location, report. End Teman.
Trusted contacts: list, add, notification preferences.
Reporting: all categories from scope section 36. Block. Blocked list. Community guidelines. Safety centre.
Serious reports restrict matching immediately, pending review.

**Rule that overrides scheduling convenience:** M6 is live before any real-world meeting happens, including a supervised pilot one.

---

### M7 · Feedback and trust — 5 screens
Post-session descriptors — kind, patient, reliable, good listener, helpful, respectful.
Private questions: did you feel safe, would you meet again. These route to moderation and never appear as a number.
Trust display on profiles. Teman Moments count. Unmatched-request handling with honest notice and alternatives.

---

### M8 · Community and relationships — 14 screens
Trusted Temans, including per-recipient sets ("Mum's Temans"). Ask trusted first before opening a request wider.
Recurring companionship: propose, agree, schedule, list.
Community circles: browse, detail, join, create, members, coordinator role.
Organisations: verified profiles, their Temans, coordinator tools.
Calendar. Teman Activities — the list of requests you volunteered on.
Notification centre.

---

### M9 · Admin platform — 22 screens
Full build of scope section 43. Desktop-first; this is the one surface where density is correct and the elderly rules don't apply.

**Users** — list with filters, user detail, verification status, community history, restrictions, reports against them.
**Verification** — review queue oldest-first, detail view with ID and selfie side by side, approve/reject with reasons, duplicate detection on `doc_hash`, organisation verification.
**Requests** — all requests, flagged queue, remove inappropriate.
**Matches** — inspect a disputed interaction end to end.
**Safety** — incident queue, urgent reports, incident detail with full timeline, blocked accounts, repeat offenders.
**Communities** — approve and manage circles, organisation accounts.
**Content** — categories with four translations, community guidelines, translation management.
**Analytics** — Teman Moments, requests created, matched, completion rate, median time to match, repeat companions, active Temans, people helped, family-managed requests, unfulfilled requests, areas with unmet demand, safety incident rate, retention.
**Platform** — broadcast messages, admin users and roles, audit log.

Two roles minimum: NGO coordinator (review and directory only) and platform admin (everything). Every consequential action writes to `audit_log`.

Build admin as plain, dense tables with filters. Resist designing it. It is the one place where "looks like an internal tool" is the correct outcome.

---

### M10 · Public site — 12 screens
Home · How it works · For people who need a Teman · For volunteers · For families and caregivers · For organisations · Safety · About · FAQ · Privacy policy · Terms · Contact.

All four languages. Same brand system, more room to breathe than the app. The hero is the exchange itself — *I need someone* / *I can be there* — with the Sisi motif completing on scroll. Real photographs of Malaysian neighbourhoods, not stock imagery of smiling seniors, which reads as a charity brochure and breaks the dignity principle.

This is also the NGO's recruitment surface. The "For volunteers" and "For organisations" pages are the ones they will actually send people to, so write those two first.

---

### M11 · Demo environment ★
*Not optional. This is what makes the other eleven modules demonstrable.*

A seed script producing a believable Brickfields:

- ~40 volunteers across verification tiers, with real-looking Malaysian names spanning Malay, Chinese and Indian communities, four languages, varied areas and photos
- ~8 care recipients attached to caregiver accounts
- ~25 requests across every category, spread over all five states — some looking, some matched, some completed months ago
- ~15 completed sessions with feedback and descriptors, so trust displays have real content
- 3 recurring companionships, 2 community circles, 1 verified organisation
- Admin queue with 6 pending verifications (one a deliberate duplicate), 3 open incidents at different severities, 2 flagged requests
- 90 days of analytics data with a plausible upward curve — not flat, not fake-perfect
- Message threads with real coordination conversation
- One request deliberately left unmatched and expired, so you can demo the honest failure state

Plus: four demo logins (volunteer, caregiver, NGO coordinator, platform admin), and a one-command reset so a demo that goes sideways recovers in ten seconds.

Every name, place and appointment in this data will be read aloud in a meeting. Write it as content, not as `test_user_017`.

---

## Screen count

| Surface | Screens |
|---|---|
| Entry, profiles, verification | 21 |
| Requests | 16 |
| Availability and journeys | 6 |
| Matching and offers | 10 |
| Match, coordination, messaging | 9 |
| Session and safety | 14 |
| Feedback and trust | 5 |
| Community and relationships | 14 |
| **Member app subtotal** | **95** |
| Admin platform | 22 |
| Public site | 12 |
| **Total** | **129** |

Each of these needs four languages, three text sizes, and empty / loading / error states. That multiplication is the real work, and it is why M0's primitives matter more than any individual screen.

---

## Demo path

Rehearse this order. It follows the product's own story rather than your module structure, and it front-loads the two moments that land hardest.

1. **Public site, "For volunteers"** — 60 seconds, sets the frame
2. **Language picker → register → verify** in Tamil, at Large text — this is the moment the NGO understands who the product is for
3. **Caregiver creates a hospital request for Dad** — walk all seven steps, don't skip
4. **Switch to the volunteer account** — Around You, the request appears, offer to help
5. **Back to caregiver** — the offer arrives, trust panel, accept. *This is the peak: Sisi completes, amber appears for the first time.* Pause here.
6. **Session** — start, trusted contact notified, safety button, end
7. **Feedback** — descriptors, then show that "did you feel safe" goes to moderation, not to a rating
8. **The unmatched request** — show the honest failure state. This builds more trust with an NGO than any success path.
9. **Admin** — verification queue with the duplicate flagged, then the incident queue, then analytics
10. **Elder view** — the simplified home, Large text by default. Close on this.

Step 10 last on purpose. It is the answer to the question the NGO is actually holding: *can my 74-year-old members use this?*

---

## How to keep this feasible

You've chosen full scope, so the leverage is in execution, not in cutting.

**Build the primitives once, properly.** Fifteen components carry 129 screens. Every hour spent here returns ten.

**Build one full vertical end to end before going wide.** M1 complete — all 21 screens, four languages, three text sizes, all states — teaches you the real per-screen cost. Estimating 129 screens from zero completed screens is guessing.

**Keep admin ugly.** 22 screens of plain tables. No design pass. Nobody is judging it, and every hour spent styling it is an hour not spent on the member app.

**Public site last, except two pages.** Write "For volunteers" and "For organisations" early because the NGO needs them for recruitment. The other ten can wait until after M9.

**Seed data grows with each module.** Add to the seed script as you finish each module rather than writing all of M11 at the end. A module without seed data is a module you cannot actually check.

**Translations in one pass, late, by a human.** Keys from day one; real Malay, Tamil and Chinese in a single pass once copy has stopped changing. Translating a moving target three times is the most wasted effort available to you.

**Write the demo script before you finish building.** It tells you which screens must be genuinely polished and which merely need to work. Not every one of the 129 gets equal attention, and the demo path is how you decide which is which.
