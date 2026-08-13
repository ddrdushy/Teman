# 10 · Seed Data & Demo Environment

A feature-complete app with no data in it demos as a broken app. Every screen designed across the three UI batches assumes content behind it — "38 people here have already joined", "12 Teman Moments", "Sentul 64% unmatched". Without seeded data, all of that renders as zero and the NGO sees an empty shell.

This is a build item with real effort, and it is the one most likely to be left until the night before.

---

## Principles

**Write it as content, not as test fixtures.** Every name, place, appointment and message in here will be read aloud in a meeting. `test_user_017` and "Lorem ipsum" undermine every craft decision around them. A coordinator should be able to point at a row and say "that's a plausible person from my community."

**Dates are relative to the run, never absolute.** Seed on a Tuesday and the demo happens Friday — the "hospital visit on Friday" must still be on Friday. Everything is computed from `now()`: `+2 days`, `-14 days`, `-3 months`.

**Deterministic.** Fixed random seed, so the same command produces the same world every time. You will rehearse the demo more than once and the screens must not change under you.

**One command to reset.** `pnpm seed:demo --reset` drops and rebuilds in under thirty seconds. A demo that goes sideways recovers in ten seconds, not by apologising.

**Grow it module by module.** Add to the seed script as each module finishes, not all at the end. A module without seed data is a module you cannot actually check.

**Never real data.** No real MyKad images (use a generated placeholder card), no photographs of real people (use generated avatars or initials), no real phone numbers — use the reserved `+60 1X-XXX XXXX` demo range and make sure SMS is stubbed in the demo environment.

---

## The world

**Brickfields, Kuala Lumpur — August 2026.** Six months after a soft launch with Pertubuhan Warga Emas KL. Enough history for trust displays and analytics to have real content; small enough to be believable for a pilot.

Deliberate texture: Sentul and Cheras are seeded as *under-served* — high unmatched rates, which is what makes the admin's unmet-demand screen tell a real story instead of showing a flat, healthy graph nobody would act on.

---

## Demo logins

Four accounts, all with the OTP bypassed to `000000` in the demo environment only.

| Login | Who | Shows |
|---|---|---|
| `+60 12-000 0001` | **Dushy Ramanathan**, 34 — caregiver | Manages Dad and Mum. Has an active request, a completed session, one expired unmatched request. The main demo account. |
| `+60 12-000 0002` | **Kumar Rajendran**, 52 — volunteer | Identity verified, 12 Teman Moments, availability set, one open offer, one recurring arrangement. |
| `+60 12-000 0003` | **Siti Nurhaliza binti Osman** — NGO coordinator | Admin, restricted role. Verification queue and volunteer directory only. |
| `+60 12-000 0004` | **Platform admin** | Everything, including incidents and the audit log. |

Also seed **Siva Ramanathan, 72** as a care recipient with elder view enabled on a separate device, so the elder-view screens can be shown live rather than described.

---

## Volunteers — 40

Distribution that makes the screens read correctly:

| Attribute | Spread |
|---|---|
| Verification | 26 identity · 9 basic · 3 pending · 2 rejected-then-retrying |
| Area | 24 Brickfields · 7 Bangsar · 5 Sentul · 4 Cheras |
| Languages | 18 Tamil · 31 English · 27 Malay · 11 Mandarin · 4 Cantonese |
| Availability | 22 have slots set · 9 recurring weekly · **9 with none** |
| Profile completeness | 19 at 100% · 13 at 70–90% · 8 under 60% |
| Transport | 14 have a car · 19 public transport · 7 meet at destination |

Those **9 with no availability** exist on purpose: they're the follow-up list on the admin volunteer directory, and they make the point that registration alone isn't enough. That row of the demo lands with an NGO coordinator harder than any success screen.

**Twenty named, the rest generated:**

| Name | Age | Area | Languages | Tier | Moments | Notes |
|---|---|---|---|---|---|---|
| Kumar Rajendran | 52 | Brickfields | Tamil, English, Malay | Identity | 12 | Has a car. Patient, kind, reliable. Demo account. |
| Farah binti Ahmad | 29 | Brickfields | Malay, English | **Pending** | 0 | Top of the verification queue, 19 h waiting |
| Mei Ling Tan | 41 | Brickfields | Mandarin, English | Identity | 8 | Weekends only |
| Ravi Chandran | 63 | Brickfields | Tamil, English | Identity | 15 | Retired teacher. Highest Moments count. |
| Nurul Izzah binti Hamid | 24 | Sentul | Malay | Basic | 1 | University volunteer, no availability set |
| Wong Kah Meng | 37 | Bangsar | Cantonese, English, Malay | Identity | 5 | Friday afternoons |
| Siti Aminah binti Yusof | 45 | Brickfields | Malay, English | Basic | 3 | Weekly Wednesdays |
| Ganesh Muthu | 48 | Sentul | Tamil, Malay | **Pending** | 4 | **Duplicate MyKad hash** — the interesting admin case |
| Aisha Rahman | 31 | Brickfields | Malay, English | Pending | 0 | Passport, not MyKad — foreign national path |
| Lee Chong Wei | 55 | Bangsar | Mandarin, English | Pending | 2 | |
| Sundram Pillai | 58 | Brickfields | Tamil, English | Pending | 7 | |
| Chong Mei Fang | 33 | Cheras | Mandarin, Cantonese | Pending | 0 | |
| Aziz Hassan | 44 | Sentul | Malay | Identity | 6 | **Two money-related reports. Currently restricted.** |
| Priya Sivakumar | 27 | Brickfields | Tamil, English | Identity | 9 | Women-only requests |
| Jaya Letchumi | 67 | Brickfields | Tamil, Malay | Identity | 11 | Recurring walks. Slow walker herself. |
| Hafiz bin Rosli | 22 | Brickfields | Malay, English | Basic | 2 | UM student, circle member |
| Tan Wei Jun | 35 | Bangsar | Mandarin, English | Identity | 4 | Filed a report — the reporter side of incident #I-0093 |
| Kamala Devi | 59 | Cheras | Tamil, English | Identity | 6 | |
| Rosnah binti Ismail | 51 | Brickfields | Malay | Identity | 8 | |
| Vijay Kumaran | 40 | Brickfields | Tamil, English, Malay | Identity | 3 | Has a car, drives |

The remaining twenty are generated from a name pool weighted to Brickfields' actual demographics — Malay, Tamil and Chinese Malaysian names in roughly even proportion, since the whole language-matching feature is meaningless if the seed is monolingual.

---

## Care recipients — 8

| Name | Age | Managed by | Language | Notes |
|---|---|---|---|---|
| **Siva Ramanathan** | 72 | Dushy | Tamil | Walks slowly, needs rests. 4 Moments. Trusted contact: Meena. Three trusted Temans. |
| **Kamala Ramanathan** | 68 | Dushy | Tamil | No mobility notes. 1 Moment. |
| Fatimah binti Salleh | 79 | Nurul | Malay | Wheelchair user. The accessibility-warning demo. |
| Lim Ah Kow | 81 | Mei Ling | Hokkien, Mandarin | Hearing difficulty. Hokkien-only — a hard match, on purpose. |
| Rajamma | 74 | Priya | Tamil | Lives alone in PJ. The welfare check-in demo. |
| Mohd Yusof bin Awang | 70 | Hafiz | Malay | Recovering from surgery, temporary. |
| Ng Siew Lan | 76 | Wong | Cantonese | Digital assistance — help using her phone. |
| Devi Ammal | 83 | Vijay | Tamil | Frequent appointments, recurring companion. |

Lim Ah Kow is seeded deliberately: Hokkien-only with only four Hokkien speakers in the pool. He generates a genuinely hard match, and it's what makes the language row on the unmet-demand screen honest.

---

## Requests — 25

| State | Count | Purpose in the demo |
|---|---|---|
| Looking | 4 | Around You counters, the volunteer's nearby list |
| Matched | 3 | Upcoming, one is Dushy's Friday hospital visit |
| Active | 1 | A live session running right now |
| Completed | 14 | History, feedback, trust displays, analytics |
| Cancelled | 1 | The honest cancellation path |
| **Expired unmatched** | 2 | **The screen every product hides** |

Across every category: 8 health · 5 everyday assistance · 4 elderly companionship · 3 emotional · 2 social · 2 welfare check-in · 1 digital assistance.

**The five that carry the demo:**

1. **Hospital visit — Dad (Siva), Friday 9:30 AM, HKL.** Matched with Kumar. Tamil preferred, walks slowly, needs rests. This is the Section 50 journey and the spine of the whole walkthrough.
2. **Groceries — Fatimah, Saturday.** Looking. Wheelchair user, which surfaces the accessibility warning above the offer button on G3.
3. **Someone to talk to — a member in PJ, this evening.** Looking. Preference set to *"please don't give advice"*, women only. Shows that the emotional category is handled carefully.
4. **Clinic visit — Lim Ah Kow, Thursday.** **Expired unmatched.** Hokkien only, no Hokkien speaker was free. This drives E14, the honest-failure screen, and it must be seeded with the *real* reason so the alternatives shown make sense.
5. **Morning walk — Devi Ammal, every Wednesday.** Recurring, in progress, three occurrences already completed.

---

## Sessions, feedback and Teman Moments — 15 completed

Each completed session carries: start and end times, duration, who was notified, descriptors, and private answers.

Descriptor distribution should look human, not uniform: patient ×11, kind ×9, reliable ×8, good listener ×6, helpful ×5, respectful ×4. **Not every session has feedback** — seed 12 of 15 with descriptors and leave 3 blank, because that's what real usage looks like and a 100% feedback rate reads as fake.

Private answers: 14 "felt safe: yes", **1 "no"** — the one that generated incident #I-0093 and sits in the admin queue. That single row is what demonstrates the product's most important design decision: a negative safety answer opens a case and never touches a public number.

---

## Relationships and community

- **Trusted Temans** — Dad's set: Kumar, Farah, Mei Ling. Dushy's own: Priya. Two more scattered.
- **Recurring** — 3 active: Devi Ammal + Jaya Letchumi (Wednesday walks, fortnightly, 3 done) · Siva + Kumar (monthly clinic) · Ng Siew Lan + Wong (weekly phone help). One paused, to show the pause state.
- **Circles** — *Brickfields Teman Community* (38 members, run by the NGO, verified) and *Sri Lankan Community KL* (64 members, Tamil-leaning). One pending-approval circle: *Vista Condo Residents*, 12 members.
- **Organisation** — Pertubuhan Warga Emas KL, verified, with a coordinator account and one orientation session listed for the coming Saturday.
- **Messages** — 6 threads with real coordination: meeting points, "he wears a blue cap", "running ten minutes late", "does he need a wheelchair inside". Not filler.

---

## Admin queue

The admin screens are only convincing if the queue has genuine texture.

**Verifications — 6 pending:** Farah (19 h, clean approve) · Ganesh (11 h, **duplicate hash across two accounts**) · Lee Chong Wei (7 h) · Aisha (4 h, passport) · Sundram (2 h) · Chong Mei Fang (1 h). Plus one already-rejected record with the reason "corner cut off", so the rejection-and-retry path can be shown.

**Incidents — 3 open:**
- **Urgent, 14 h** — Aziz Hassan asked Wei Jun for money during a session. Full timeline seeded: matched, session started, the message at 15:41, session ended by one side, report at 16:31, automatic matching restriction at 16:31. Prior report from June. This is the incident-detail demo.
- **High, 2 days** — an anonymous "did not feel safe", no report filed. Shows the auto-created case.
- **Low, 3 days** — a session that was never ended, both parties unreachable for three hours. Shows the system-generated case.

**Flagged requests — 2:** *"Urgent cash help needed"* (money keyword, automatic) and *"Looking for a nice lady to have dinner"* (dating, flagged by two members).

**Audit log — roughly 60 entries** over 90 days: verification decisions, document reveals, location reveals, one suspension, plus a handful of `view_user` entries so the "opening a record is itself an event" point is visible rather than asserted.

---

## Analytics — 90 days

A curve, not a flat line and not a fake hockey stick. Weekly Teman Moments rising from roughly 4 to 21 with two dips — one for Hari Raya week, one unexplained, because real data has dips nobody can account for and a perfectly smooth curve reads as invented.

Targets the seeded data should produce:

| Metric | Value |
|---|---|
| Teman Moments (90 d) | 147 |
| Match rate | 81% |
| Median time to match | 6 h — down from 11 h in June |
| Active Temans | 31 of 38 |
| Repeat companions | 18 |
| Family-managed requests | 44% |
| Unfulfilled requests | 19% |
| Safety incident rate | 0.7% of sessions |
| 90-day retention | 68% |

**Unmet demand by area:** Sentul 64% · Cheras 47% · Kepong 38% · Bangsar 22% · Brickfields 19%. Reasons: no Temans free 41% · none within distance 28% · language 17% · verified-only 9% · accessibility 5%.

Those numbers are the point of the whole screen — they say *recruit in Sentul next, and find Tamil speakers*. Seed them so they say that.

---

## Script structure

```
scripts/seed/
├─ index.ts            # orchestrator, fixed random seed, --reset flag
├─ data/
│  ├─ people.ts        # 40 volunteers + 8 recipients, named
│  ├─ requests.ts      # 25 requests, dates relative to now()
│  ├─ sessions.ts      # 15 completed + feedback
│  ├─ community.ts     # circles, org, recurring, trusted
│  ├─ moderation.ts    # verifications, incidents, flags, audit
│  └─ messages.ts      # 6 threads
└─ media/              # generated avatars + a placeholder ID card image
```

```bash
pnpm seed:demo            # build the world
pnpm seed:demo --reset    # drop and rebuild, under 30s
pnpm seed:demo --module=requests   # rebuild one slice while developing
```

---

## Rules

- Demo environment only. The seed script must refuse to run if `NODE_ENV=production` or if the database contains any account outside the demo phone range.
- OTP bypass and SMS stubbing are demo-only, gated by an environment flag, and must be impossible to enable in production.
- Generated ID card images, generated avatars, reserved phone numbers. Nothing traceable to a real person.
- Every seeded name should be one you'd be comfortable reading aloud in front of the community it comes from. If a name feels like a placeholder, replace it.

---

## Before the demo

Run the reset, then walk the ten-step demo path end to end **once**, silently, checking that every screen has content. The screens that most often turn up empty are the ones nobody thinks to seed: the notification list, the calendar, the messages tab, the activities list, and the audit log.

---

Next: **11 · M0 setup files** — docker-compose, Caddyfile, design tokens, and the Sisi component, as actual code rather than description.
