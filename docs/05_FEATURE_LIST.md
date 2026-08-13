# Teman — Complete Feature List

Every feature in the product, with an ID you can reference in commits, issues and specs. `§` refers to the section in *Teman — Full Product Scope*. Module maps to the build order in `02_FULL_BUILD_PLAN.md`.

Nothing here is cut. Where a feature has a non-obvious rule attached, it's stated — those rules are the ones that get lost between the scope document and the code.

---

## A · Identity & Access — M1

| ID | Feature | § | Rule |
|---|---|---|---|
| A-01 | Language picker as first screen | 33 | Before account. Four scripts shown simultaneously. Never translated. No flags. |
| A-02 | Phone OTP sign up / sign in | 19 | +60 prefix visible. 10-min validity, generous retries, rate-limited 3/hr/number. |
| A-03 | Email as recovery factor | 19 | Never a login method. |
| A-04 | Device remembered 90 days | — | Reduces OTP cost and re-entry friction. |
| A-05 | Session management, sign out | — | Sign out preserves language and text size on the device. |
| A-06 | Account deletion | 24 | Hard delete of profile; sessions and reports retained anonymised for safeguarding. |
| A-07 | Elder view / caregiver view toggle | 64 (principles) | Elder view defaults text size to Large. Switchable any time. |

## B · Profiles — M1

| ID | Feature | § | Rule |
|---|---|---|---|
| B-01 | Member profile: name, photo, area, bio | 16 | Approximate area only, never an address. |
| B-02 | Languages spoken | 16, 33 | Bahasa Melayu, English, Tamil, Mandarin, Cantonese, Hokkien, other. |
| B-03 | Assistance categories offered | 16 | Multi-select from the same taxonomy requests use. |
| B-04 | Transport options | 31 | Have a car / can drive / public transport / accompany in your transport / meet at destination. |
| B-05 | Availability habits (free text) | 16 | "Usually free weekday mornings." Not a schedule. |
| B-06 | Completed Teman Moments count | 20 | A count, never a rating. |
| B-07 | Member-since date | 20 | Tenure is a trust signal. |
| B-08 | Community feedback descriptors | 20, 35 | Words only. No stars, no averages, no percentages. |
| B-09 | People I Care For — list | 18 | The feature that makes elderly adoption possible. |
| B-10 | Care recipient profile | 17 | Preferred name, age band, languages, mobility, accessibility, conversation preferences, emergency contact. |
| B-11 | Per-recipient language | 33 | Separate from the account holder's. A caregiver may read English, the parent Tamil. |
| B-12 | Care recipient notes | 17 | Free text only. **No structured medical fields, ever.** |

## C · Verification & Trust — M1

| ID | Feature | § | Rule |
|---|---|---|---|
| C-01 | Tier 1 — Basic (phone + email) | 19 | Automatic on sign up. |
| C-02 | Tier 2 — Identity (MyKad / passport + selfie) | 19 | Human-reviewed. Gallery upload accepted, not camera-only. |
| C-03 | Tier 3 — Community verified | 19 | Via organisation, university, NGO, resident association. |
| C-04 | Tier 4 — Enhanced | 19 | Background checks where legally feasible. |
| C-05 | Verification ladder UI | 20 | Shows current position and what the next tier unlocks. |
| C-06 | Rejection with reason and retry | — | Never a dead end. |
| C-07 | ID document retention: 90 days post-review | 24 | Automated deletion job. Stated to the user before upload. |
| C-08 | ID number stored as salted hash only | 24 | Duplicate detection only. The raw number is never stored. |
| C-09 | Trust indicator display | 20 | Verified badge, Moments count, tenure, descriptors. |

## D · Requests — M2

| ID | Feature | § | Rule |
|---|---|---|---|
| D-01 | Seven-step creation flow | 12 | One decision per screen. Resumable. No timeouts. |
| D-02 | Beneficiary selection | 12 | Me / parent / relative / someone I care for. |
| D-03 | Category: Health & appointments | 5 | Hospital, clinic, dental, physio, follow-up, screening, pharmacy, medication. |
| D-04 | Category: Everyday assistance | 6 | Groceries, bank, government office, post, bills, forms, unfamiliar places. |
| D-05 | Category: Elderly companionship | 7 | Accompany outside, walk, sit, groceries, phone help, forms, check in. |
| D-06 | Category: Emotional companionship | 8 | Talk, listen, coffee, sit together, walk and talk, quiet company. |
| D-07 | "What would help me today?" | 8 | Just listen / conversation / walk / coffee / quiet / advice okay / **please don't give advice**. |
| D-08 | Category: Social companionship | 9 | Park, walk, coffee, lunch, event, market, library. Explicitly non-dating. |
| D-09 | Category: Welfare visit / check-in | 10 | Family requests a visit to a loved one. Address disclosed only after consent. |
| D-10 | Category: Digital assistance | 11 | Phone, apps, online services, video calls, forms, settings. |
| D-11 | Location: approximate + exact split | 24 | Exact readable only through `revealLocation()` after mutual accept. |
| D-12 | Timing: now / date / time / flexible | 12 | |
| D-13 | Preferences | 12, 34 | Gender, language, age range, accessibility, driving, same destination, verified only. |
| D-14 | Urgency: planned / today / soon | 30 | Teman is **not** an emergency service. True emergencies redirect to 999. |
| D-15 | Visibility: public / circles / trusted only | 28 | |
| D-16 | Ask trusted Temans first | 27 | Offer to the trusted circle before opening wider. |
| D-17 | Request states | 41 | Looking, Matched, Upcoming, Active, Completed, Cancelled, Expired. |
| D-18 | Edit and cancel | — | Cancellation notifies the other party honestly. |
| D-19 | Expiry with honest notice | — | "No one could make Friday" plus alternatives, sent *before* the date. |

## E · Availability & Journeys — M3

| ID | Feature | § | Rule |
|---|---|---|---|
| E-01 | Declare availability | 13 | Date, window, area, radius, categories, transport, languages. |
| E-02 | Radius as three choices | 13 | Walking distance / same area / anywhere in city. Not a slider. |
| E-03 | Availability list, edit, delete | 13 | |
| E-04 | Repeat weekly | 13 | A checkbox, not a schedule builder. |
| E-05 | "I'm going there too" | 4 | Destination + time. Stored as availability with a destination. |
| E-06 | Overlap detection, both directions | 4 | "You're both heading to HKL around the same time." |

## F · Matching & Offers — M4

| ID | Feature | § | Rule |
|---|---|---|---|
| F-01 | Matching engine | 14 | PostGIS radius + time overlap + category + language + preferences + trust. |
| F-02 | Ranking | 14 | Same destination → existing trusted relationship → distance. Distance is the tiebreaker, not the driver. |
| F-03 | Around You counters | 29 | Counts only. Exact locations never visible before matching. |
| F-04 | Nearby request list | 29 | Filtered by the volunteer's availability and languages. |
| F-05 | Request detail — Teman view | 15 | Accessibility needs visible **before** accepting. |
| F-06 | Offer to help | 15 | Optional short message. |
| F-07 | Offer received — requester view | 15 | Trust information only: name, photo, languages, area, badge, Moments, descriptors. |
| F-08 | My offers list | 41 | |
| F-09 | Block-aware matching | 36 | Blocked pairs never surface to each other. |

## G · Match & Coordination — M5

| ID | Feature | § | Rule |
|---|---|---|---|
| G-01 | Mutual acceptance | 15 | Both sides. Neither party alone can force a match. |
| G-02 | Location and contact unlock | 24 | Only on mutual accept. Logged to `audit_log`. |
| G-03 | Meeting point confirmation | 21 | |
| G-04 | Scoped messaging | 25 | Tied to the request. **Not a general chat platform.** |
| G-05 | Reminders at 24 h and 2 h | 39 | |
| G-06 | Cancellation, either side | — | Honest notification, request returns to Looking if time allows. |

## H · Session & Safety — M6

| ID | Feature | § | Rule |
|---|---|---|---|
| H-01 | Pre-meeting safety checklist | 21 | Meeting details, share with trusted contact, guidelines. |
| H-02 | Start Teman | 21 | Both confirm. Records start time, context, expected duration. |
| H-03 | Active session view | 21 | Elapsed time, who has been notified, actions. |
| H-04 | Live location sharing | 21 | Opt-in. **Foreground only** on a PWA — say so plainly. |
| H-05 | End Teman | 21 | Both confirm. |
| H-06 | Trusted contact registration | 22 | At least one encouraged during onboarding. |
| H-07 | Trusted contact notifications | 22 | Session start, arrival, completion — where enabled. |
| H-08 | Safety button | 23 | Contact trusted person, call 999, share location, report. |
| H-09 | Emergency redirect | 23, 30 | "Teman is not an emergency service. Call 999 first." |
| H-10 | Report | 36 | Harassment, romantic/sexual behaviour, money requests, fraud, unsafe driving, impersonation, discrimination, abuse. |
| H-11 | Immediate matching restriction | 36 | Serious reports restrict matching pending review. |
| H-12 | Block | 36 | Mutual invisibility. |
| H-13 | Community guidelines | 37 | Four languages. Human-translated. |
| H-14 | Emotional-support safeguards | 38 | Disclaimer, listener guidance, escalation to professional support. |

## I · Feedback & Trust Display — M7

| ID | Feature | § | Rule |
|---|---|---|---|
| I-01 | Descriptors | 35 | Kind, respectful, patient, reliable, helpful, good listener. |
| I-02 | Private: did you feel safe | 35 | Routes to moderation. **Never rendered anywhere.** |
| I-03 | Private: would you meet again | 35 | Influences ranking only. Never displayed. |
| I-04 | Negative safety feedback escalation | 35 | Creates a moderation event, does not lower a score. |
| I-05 | Teman Moment recorded | 44 | The product's primary metric. |

## J · Relationships & Community — M8

| ID | Feature | § | Rule |
|---|---|---|---|
| J-01 | Trusted Temans | 27 | Per-recipient sets: "Mum's Temans". |
| J-02 | Recurring companionship | 26 | Weekly, fortnightly, monthly, custom. Both parties must agree. |
| J-03 | Recurring schedule management | 26, 42 | |
| J-04 | Community circles | 28 | Browse, join, create, members, coordinator role. |
| J-05 | Circle-scoped requests | 28 | |
| J-06 | Organisation accounts | 46 | Verified profiles, their Temans, coordinator tools. |
| J-07 | Calendar | 42 | Upcoming requests, availability, recurring, confirmed sessions. |
| J-08 | My Teman Activities | 41 | Requests you volunteered on. |
| J-09 | Notification centre | 39 | Helpful, never engagement-driven. |

## K · Admin & Moderation — M9

| ID | Feature | § |
|---|---|---|
| K-01 | User list, filters, detail | 43 |
| K-02 | Verification review queue + duplicate detection | 43 |
| K-03 | Account restrictions and suspension | 43 |
| K-04 | Flagged request review and removal | 43 |
| K-05 | Match inspection for disputes | 43 |
| K-06 | Incident queue, severity triage | 43 |
| K-07 | Blocked accounts, repeat offenders | 43 |
| K-08 | Organisation verification | 43 |
| K-09 | Circle approval and management | 43 |
| K-10 | Category and content management, four languages | — |
| K-11 | Analytics dashboard | 44 |
| K-12 | Broadcast messaging | — |
| K-13 | Admin roles: NGO coordinator vs platform admin | 47 |
| K-14 | Audit log | 24 |

## L · Public Site — M10

| ID | Feature |
|---|---|
| L-01 | Home — the exchange, in four languages |
| L-02 | How it works |
| L-03 | For people who need a Teman |
| L-04 | For volunteers ★ *NGO recruitment surface — write early* |
| L-05 | For families and caregivers |
| L-06 | For organisations ★ *write early* |
| L-07 | Safety |
| L-08 | About |
| L-09 | FAQ |
| L-10 | Privacy policy (PDPA) |
| L-11 | Terms |
| L-12 | Contact |

## M · Cross-cutting — M0, present in every module

| ID | Feature | Rule |
|---|---|---|
| M-01 | Four-language i18n | Every string a key from day one. No exceptions. |
| M-02 | Per-script typography | Latin 18/1.55, Tamil 19/1.75, Chinese 18/1.80. No letter-spacing on Tamil or CJK. |
| M-03 | Text size 18 / 22 / 26 | Per account. Nothing truncates at 26. |
| M-04 | Elderly interaction rules | 64 px primary targets, 56 px floor, 12 px apart, no icon-only controls, no gestures as sole route. |
| M-05 | Contrast: 7:1 text, 3:1 non-text | Stricter than WCAG AA because of the audience. |
| M-06 | Empty / loading / error states | Every screen that fetches or submits. |
| M-07 | Offline tolerance | Forms survive a dropped connection. |
| M-08 | Web push + SMS fallback | iOS below 16.4 has no push; safety notifications fall back to SMS. |
| M-09 | Audit logging | Verification decisions, address reveals, admin record access, report handling. |
| M-10 | Encryption at rest | Emergency contacts, care recipient notes, exact addresses. |

---

## Explicitly excluded — §48, §49

Payments of any kind · tipping · subscriptions · commissions · premium tiers · advertising · marketplace bidding · star ratings · public follower counts · likes · an influencer or content feed · a general chat inbox · voice or video companionship · dating features · professional therapy · medical consultation · paid transport · background location tracking · emergency service positioning.

Each of these will be proposed at some point, usually described as a small addition. The scope document already answered them.
