# Teman — Brand Kit v1.1 (final)

*No one should have to go alone.*

This is the design foundation and the single source of truth. v1.1 merges the corrections forced by the elderly audience — those rows are marked **v1.1** and they supersede anything earlier.

Three of them were defects, not preferences: v1's borders sat at 1.49:1 against a 3.0 requirement, and its buttons and captions sat at AA when this audience needs AAA.

---

## 1. Strategy

**Purpose** — Teman exists so that no one in a neighbourhood has to face an appointment, an errand or an afternoon alone when someone nearby has time to spare.

**Essence — "Quiet Presence"** — Not "care", not "help", not "service". *Presence* is what's offered; *quiet* is how it should feel. A platform that gets people together and then gets out of the way.

**Differentiator** — Every comparable product sells a task being completed. Teman's unit of value is a person being *beside* someone — unpaid, unrated, unranked.

**Narrative** — Loneliness in a city is rarely a logistics problem. People can usually get to the hospital; what they can't do is walk in without anyone waiting for them to come out. Meanwhile the same neighbourhood is full of people with two free hours and no obvious way to give them away. Teman is the shortest possible bridge between those two facts — and its success is measured by how quickly people leave the app to meet in real life.

---

## 2. Personality

| Trait | Sounds like | Never sounds like |
|---|---|---|
| **Warm** | neighbourly, unhurried, kind | sentimental, pitying, saccharine |
| **Dignified** | respectful, equal, plain | charitable, patronising, clinical |
| **Dependable** | clear, specific, steady | vague, over-promising, breezy |
| **Quiet** | calm, brief, unshowy | urgent, gamified, attention-seeking |

**Voice rules**
- Say "Find a Teman", never "request a volunteer" or "get assistance".
- Buttons name the outcome: "Publish request", "Accept Kumar", "End this Teman session" — never "Submit", "OK", "Continue".
- Errors explain what happened and what to do. They don't apologise in a person's voice.
- Everything is written to be read aloud — a caregiver will read these screens to a parent, and the copy has to survive translation into Malay, Tamil and Mandarin without losing warmth.

---

## 3. Sisi — the signature motif

*Di sisi* is Malay for "by your side."

Two presence forms standing together: you, solid — and the space beside you. That space is **dashed and empty** when no one has answered yet, and **fills with amber** the moment someone does. The brand mark literally completes itself at the moment the product works.

| State | Left form | Right form | Where it appears |
|---|---|---|---|
| Waiting | Teal 900 solid | Dashed outline, Neutral 300 | Request published, no match |
| Answered | Teal 900 solid | Amber 400 solid | Match screen, match notification |
| Together | Teal 900 solid | Amber 400 solid + joining bar | Live session |
| Teman Moment | Amber 300 | Amber 300 + joining bar | Completed — the only badge the product gives |

**Logo system**
- **Primary lockup** — mark + "Teman" in Vollkorn 700. Default position top-left. Clear space on all sides = one bar width.
- **App icon** — always the *answered* state (an invitation, not a vacancy). Minimum 24 px.
- **Waiting lockup** — restricted to splash and empty states. Never on partner or NGO co-branded material.
- Never recolour the mark, never outline it, never separate the two forms, never add a third.

---

## 4. Colour

Two directions were rejected on purpose. **Clinical blue** reads as a hospital system and makes the product feel medical, which the scope explicitly says it is not. **Charity orange** reads as "you are receiving aid" and breaks the dignity principle outright. Teal is calm and dependable without either association, and carries no religious coding — which matters on a platform serving Malay, Chinese and Indian communities in one feed.

### Primary — Teal (~20% of a screen)
Dependability. Primary actions, active nav, and the deep panels behind moments that matter.

`900 #0A4D4A` · `800 #126D6A` · `700 #1B8380` · `600 #269C98` · `500 #32B3AF` · `300 #6BD1CE` · `100 #C7F5F3` · `50 #E8FCFB`

- `900` — **v1.1** default primary button (9.66:1). Was `800` at 6.14:1 — AA, but this audience needs AAA.
- `900` — button hover, all full-bleed deep surfaces
- `900` — **v1.1** links, active nav, numerals (9.18:1). `800` is now large text and icons only.

### Neutral — Warm Grey (~75% of a screen)
Warm undertone, never cold grey. The app should feel like paper, not a dashboard.

`900 #27241D` · `700 #504A40` · `600 #625D52` · `500 #857F72` · `300 #B8B2A7` · `200 #D3CEC4` · `100 #E8E6E1` · `50 #FAF9F7`

- `50` — every app background
- `900` — all body text
- `700` — **v1.1** captions and metadata (8.33:1). Neutral 600 is retired for text entirely.
- `500` — **v1.1** every interactive border: inputs, ghost buttons, selectable cards (3.78:1, clears the 3.0 non-text requirement). Was `200` at 1.49:1 — invisible to an older eye.
- `200` — decorative dividers inside a card only, never an interactive boundary
- `400` — disabled states only, never text

### Signature — Amber (under 5%)
**Connection only.** Amber marks that a human being has answered — a match, a live session, a completed Teman Moment. It appears nowhere else, so when it appears it means something.

`700 #895811` · `600 #AD6F17` · `500 #CF8318` · `400 #E8A13C` · `300 #EDCA97` · `200 #EFDEC5`

- `400` — Sisi fill, Accept button, verified badge
- `700` — the only amber approved for text on light backgrounds
- Never a warning. Never decoration. Never a background field. Never a gradient.

### Semantic — a separate system
Deliberately kept off the brand palette. If amber also meant "warning", a match notification and a failed verification would look alike.

| Meaning | Text | Fill | Used for |
|---|---|---|---|
| Success / Completed | `#0E5814` | `#E3F9E5` | Session ended safely, verification passed |
| Error / Safety | `#780A0A` (strong `#911111`) | `#FFEEEE` | SOS, reports, blocks — nothing else |
| Waiting / Attention | `#7C5E10` | `#FFFAEB` | Still looking, verification pending |
| Information | `#334E68` | `#F0F4F8` | Privacy notes, safety guidance, "what happens next" |

### Approved combinations — computed, not estimated

Elderly users are the primary audience, so body text targets AAA where reachable rather than settling at AA.

| Foreground | Background | Ratio | Verdict | Approved for |
|---|---|---|---|---|
| Neutral 900 | Neutral 50 | 14.71 | AAA | All body text, headings |
| Neutral 700 | Neutral 50 | 8.33 | AAA | Secondary text |
| Neutral 600 | Neutral 50 | 6.22 | AA | Captions, metadata |
| Neutral 500 | Neutral 50 | 3.78 | Large only | Disabled states — never body text |
| White | Teal 800 | 6.14 | AA | Primary button label |
| White | Teal 900 | 9.66 | AAA | All deep-panel text |
| White | Teal 900 + 7% white panel | 7.99 | AAA | Trust panel values |
| Teal 800 | Neutral 50 | 5.83 | AA | Links, active nav, numerals |
| Teal 900 | Neutral 100 | 7.75 | AAA | Labels on tinted surfaces |
| Neutral 900 | Amber 400 | 7.07 | AAA | Accept button, verified badge |
| Amber 300 | Teal 900 | 6.21 | AA | Amber text on deep panels |
| Amber 200 | Amber-tinted chip on Teal 900 | 5.37 | AA | Feedback word chips |
| Amber 400 | Teal 900 | 4.41 | Shapes only | Sisi fill, icons — **never text** |
| Amber 500 | Neutral 50 | 2.89 | **Fails** | Never. Use Amber 700 instead. |
| Amber 700 | Neutral 50 | 5.76 | AA | Amber text on light backgrounds |

---

## 5. Typography

**Vollkorn** for anything a person is being addressed by — names, requests, moments. A sturdy low-contrast humanist serif built for reading, not a fashion serif, so it stays legible at 72 and reads as a handwritten neighbourhood note rather than a software product.

**Source Sans 3** carries every functional surface: labels, buttons, forms, metadata.

Both open-source, which matters for a platform with no revenue. Both sit alongside **Noto Sans / Noto Serif** for Tamil and Chinese without a visual break — set Noto as the fallback in every stack.

```css
--serif: "Vollkorn", "Noto Serif", Georgia, serif;
--sans:  "Source Sans 3", "Noto Sans", system-ui, sans-serif;
```

| Role | Face / weight | Size | Leading | Used for |
|---|---|---|---|---|
| Display | Vollkorn 700 | 34 px | 1.20 | One hero moment per flow only |
| Headline | Vollkorn 600 | 25 px | 1.25 | Screen titles, a Teman's name |
| Card title | Vollkorn 600 | 19 px | 1.30 | Request cards, profile cards |
| Subhead | Source Sans 600 | 20 px | 1.35 | Section headers within a screen |
| **Body** | Source Sans 400 | **18 px** | 1.55 | **v1.1** All reading text. User-scalable to 22 and 26. |
| Button | Source Sans 600 | 18 px | 1.20 | Every tappable label |
| Label | Source Sans 600, +0.07em, uppercase | 14 px | 1.30 | Field labels, section eyebrows |
| Caption | Source Sans 400 | 15 px | 1.45 | Metadata, timestamps |

**Rules**
- Measure 30–40 characters. Minimum 18 px side padding on every screen; text never touches an edge.
- Two levels only — headline and body. A caption is the practical third.
- Never below 15 px. **One exception**: the bottom navigation label at 12 px, always paired with an icon, never carrying information on its own.
- **v1.1 — per script.** Latin (English, Malay): Source Sans 3, 18 px, 1.55. Tamil: Noto Sans Tamil / Noto Serif Tamil, 19 px, 1.75. Chinese: Noto Sans SC / Noto Serif SC, 18 px, 1.80. Vollkorn covers neither Tamil nor Chinese — do not leave the fallback to the OS.
- **v1.1** — no letter-spacing and no uppercase on Tamil or CJK. Both are Latin-only devices.
- **v1.1** — text always wraps, never truncates. An ellipsis hides the words the person needed.
- Left-align everything meant to be read. Centre only short headlines and single CTAs.

---

## 6. Layout & components

- **Spacing scale** — 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56. Nothing off-scale.
- **Radius** — 14 px cards, 12 px buttons, 999 px pills. Soft reads as safe and welcoming.
- **v1.1 — Tap targets: 64 px for primary actions, 56 px absolute floor, 12 px clear between any two.** Spacing matters as much as size; adjacent targets cause mis-taps, and one of these is the SOS button.
- **v1.1 — no icon-only controls anywhere**, including back and close. Icon literacy is learned, not innate.
- **v1.1 — no gesture is ever the only route**, and no session timeouts on any form.
- **Focus rings** — 3 px, offset 3 px, visible, never removed. Amber ring on teal buttons; teal ring on amber buttons.
- **One primary action per screen.** Everything else recedes to ghost or text style.
- Every interactive element ships with default, hover, focus, active and disabled states.
- Every screen that fetches or submits ships with empty, loading and error states.

---

## 7. The rules that keep it Teman

1. **Amber never means anything but connection.** Not a warning, not a highlight, not a decorative gradient. The instant amber appears without a person attached, it stops meaning anything.
2. **No star ratings, ever.** Trust is shown as verification status, count of completed Teman Moments, tenure, and descriptive words. A 4.6★ turns a neighbour into a gig worker.
3. **Safety colour is never reused.** Deep red belongs to SOS, reports and blocks alone — never a delete button, a form error, or an overdue item.
4. **No countdown timers, streaks, badges or scarcity.** "3 Temans left!" is conversion psychology aimed at people who are already anxious.
5. **Two people on screen means Sisi is present.** Any surface showing a match, session or completion carries the motif.
6. **Contrast targets are AAA for text (7:1) and 3:1 for every border, icon and input outline.** AA is the general floor; it is not the floor for this audience.
7. **The unmatched state is never hidden.** If no one answers, the app says so plainly and offers a route out. Silent failure is what destroys trust in a product like this.

---

## 8. Files

- `teman-brand-board.html` — the visual system, Sisi in all states, colour and type spec, four screens from the hospital journey.
- `teman-elderly-multilingual.html` — the elderly and four-language rules, with a working language and text-size demo. **Read alongside this document; its rules are part of the brand kit.**
- `teman-ui-flows-batch1.html` — the screens, in flow order.
- `TEMAN_BRAND_KIT.md` — this document, for developer handoff.
