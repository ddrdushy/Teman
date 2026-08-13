# Teman — Member App Screen Specs

95 screens. Each entry gives route, job, interaction pattern, primary action, and the states that must exist. Design tokens come from `TEMAN_BRAND_KIT.md`; the elderly and multilingual rules from `teman-elderly-multilingual.html` apply to every screen without being restated.

**Applies to all 95, assumed silently:**
one primary action per screen, in the lower half · 64 px primary targets, 56 px floor, 12 px apart · every control has a visible word · body text 7:1, borders 3:1 · nothing truncates at 26 px text · empty, loading and error states exist · back never destroys input · no timeouts.

The dozen screens that carry the most design weight are expanded in full at the end.

---

## A · Entry — 7 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| A1 | `/` | Pick a language | 4 stacked cards, own scripts, no flags, never translated | Tap a language | — |
| A2 | `/[l]/welcome` | Say what Teman is in 3 lines | Hero + single CTA, language switch top-right | Get started | — |
| A3 | `/[l]/join/phone` | Collect the number | Single field, +60 visible not hidden | Send me a code | Invalid · already registered → sign in |
| A4 | `/[l]/join/otp` | Verify | 6 boxes, autofocus, paste-friendly | Confirm | Wrong (input kept) · expired · resend cooldown · rate-limited |
| A5 | `/[l]/join/name` | The name others see | Single field | Continue | Empty |
| A6 | `/[l]/join/area` | Rough location | Searchable list, not a map pin | Continue | Not found → nearest |
| A7 | `/[l]/join/done` | ★ Welcome them | Sisi completes | Choose intent | — |

## B · Home & shell — 8 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| B1 | `/[l]/home` | Caregiver home | 3 big actions + Around You + next Teman | Need a Teman | First-run · nothing upcoming · pre-launch phase |
| B2 | `/[l]/home` (elder) | Elder home | 3 actions only, Large text default, no counters | Someone to come with me | Same |
| B3 | — | Bottom nav | 4 labelled tabs, always visible, no hamburger | — | Active · unread badge |
| B4 | `/[l]/around` | Who's nearby | Counts only, never exact locations | View requests | Zero nearby |
| B5 | `/[l]/notifications` | What happened | Reverse-chronological list, Sisi carries state | Open item | Empty |
| B6 | `/[l]/you` | Account hub | Grouped list | — | — |
| B7 | `/[l]/you/settings` | Language, text size, notifications, privacy | Grouped list with live preview | — | — |
| B8 | `/[l]/you/language` | Language sheet | Same as A1, reachable from anywhere | Tap a language | — |

## C · Profile & care recipients — 8 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| C1 | `/[l]/profile` | Your public profile | Card as others see it + edit | Edit profile | Incomplete → checklist |
| C2 | `/[l]/profile/edit` | Edit basics | Single-column form, autosave | Save | Saving · saved · error |
| C3 | `/[l]/profile/photo` | Photo | Camera or gallery, crop | Use this photo | No permission → gallery |
| C4 | `/[l]/profile/languages` | Languages spoken | Multi-select, own scripts | Save | None selected |
| C5 | `/[l]/profile/categories` | What you can help with | Grouped multi-select | Save | None selected |
| C6 | `/[l]/care` | People I care for | List + add | Add someone | Empty → why this helps |
| C7 | `/[l]/care/new` | Add a person | Stepped form | Save | Autosave |
| C8 | `/[l]/care/[id]` | Their profile | Sections, each editable | Edit | — |

## D · Verification — 6 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| D1 | `/[l]/verify` | Where you stand | 4-rung ladder, current rung clear, next rung's benefit stated | Verify my identity | Each tier: locked · pending · done |
| D2 | `/[l]/verify/why` | Explain before asking | Plain prose: what for, who sees it, when deleted | I understand | — |
| D3 | `/[l]/verify/id` | Capture document | Frame overlay, camera **and** gallery | Use this photo | No permission · retake |
| D4 | `/[l]/verify/selfie` | Confirm it's them | Explains first, then camera | Use this photo | Retake |
| D5 | `/[l]/verify/pending` | Set expectations | Status card: who reviews, how long | Back to home | — |
| D6 | `/[l]/verify/rejected` | Reason + retry | Banner + reason + retry + human contact | Try again | ✕ never a dead end |

## E · Request creation — 16 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| E1–E7 | `/[l]/request/new/[1-7]` | The seven steps | One decision per screen, stepper, autosave | Continue | Per-step validation, inline |
| E8 | `…/new/mood` | Emotional only: what would help today | Radio cards incl. **"please don't give advice"** | Continue | — |
| E9 | `…/new/review` | Check everything | Summary, every line editable in place | Publish request | — |
| E10 | `…/new/visibility` | Who can see this | Radio cards: public / circles / trusted only | Publish | — |
| E11 | `…/new/published` | ★ It's live | Sisi waiting state, what happens next | View request | — |
| E12 | `…/new/ask-trusted` | Ask trusted Temans first | List with toggles | Ask them first · Skip | No trusted yet → skip |
| E13 | `/[l]/requests` | My requests | 5 tabs: Looking · Matched · Upcoming · Completed · Cancelled | — | Each tab empty state |
| E14 | `/[l]/requests/[id]` | Request detail | Status-driven; changes shape per state | Varies by state | 7 states |
| E15 | `…/[id]/edit` | Edit | Same as creation, pre-filled | Save | Warn if offers exist |
| E16 | `…/[id]/cancel` | Cancel | Full-screen confirm, never a small dialog | Cancel request | Reason optional |

## F · Availability & journeys — 6 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| F1 | `/[l]/available/new` | Declare free time | Stepped: when → where → what → transport | Save | — |
| F2 | `…/new/review` | Reflect it back in words | "Requests within about 5 km of Brickfields" + repeat-weekly checkbox | Save | — |
| F3 | `/[l]/available` | Your slots | Upcoming list, edit, delete | Add availability | Empty |
| F4 | `…/[id]/edit` | Edit a slot | Same as F1 | Save | — |
| F5 | `/[l]/journey/new` | Going there too | Destination + when | Save | — |
| F6 | `/[l]/journey/[id]` | Overlaps found | List of possible companions | Offer to accompany | None yet |

## G · Discovery & offers — 10 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| G1 | `/[l]/nearby` | Requests near you | Ranked cards: category, when, distance, languages | Open | Empty → adjust availability |
| G2 | `…/filters` | Narrow it | Sheet: category, distance, day, language | Apply | — |
| G3 | `/[l]/nearby/[id]` | Request detail, Teman view | **Accessibility needs above the fold, before the offer button** | I can be there | Already offered · taken |
| G4 | `…/[id]/offer` | Make the offer | Optional short message | Send offer | Sending · sent |
| G5 | `/[l]/offers` | My offers | List by state | Open | Empty |
| G6 | `/[l]/offers/[id]` | Offer detail | Status + withdraw | Withdraw | Offered · accepted · declined |
| G7 | `/[l]/requests/[id]/offers` | Offers received | Cards, trust info only | Review | None yet |
| G8 | `…/offers/[oid]` | ★ Someone answered | Deep teal, trust panel, one amber CTA | Accept | — |
| G9 | `…/offers/[oid]/profile` | Their full profile | Read-only profile | Accept | — |
| G10 | `…/offers/[oid]/decline` | Not this time | Confirm, optional reason | Decline | — |

## H · Match, coordination, messaging — 9 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| H1 | `…/matched` | ★ It's confirmed | Sisi complete, both names, what happens next | Confirm meeting point | — |
| H2 | `…/meeting-point` | Agree where | Map + text + "how to recognise me" | Confirm | — |
| H3 | `…/details` | Everything unlocked | Exact address, contact, notes — logged on view | Message | Pre-accept: locked with explanation |
| H4 | `/[l]/messages` | Threads | List, scoped to requests only | Open | Empty → "messages appear after a match" |
| H5 | `/[l]/messages/[id]` | One conversation | Bubbles, large text, quick replies | Send | Sending · failed · retry |
| H6 | `…/quick-replies` | Common phrases | Preset chips in all 4 languages | Insert | — |
| H7 | `…/reminder` | 24 h / 2 h before | Full-screen card | View details | — |
| H8 | `…/cancel-match` | Cancel after matching | Full-screen confirm, states the impact | Cancel | — |
| H9 | `…/cancelled` | The other side cancelled | Honest, no blame, next steps | Find someone else | — |

## I · Session & safety — 14 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| I1 | `…/checklist` | Pre-meeting | Checklist + share with trusted contact | I'm on my way | — |
| I2 | `…/arrived` | Announce arrival | One button | I've arrived | — |
| I3 | `…/start` | Start together | Both confirm | Start Teman | Waiting for the other side |
| I4 | `…/session` | Live session | Elapsed time, who's notified, actions, **Safety help** distinct in red | End Teman | Active · location on/off |
| I5 | `…/location` | Live location | Opt-in, **states foreground-only plainly** | Turn on | Denied → explain |
| I6 | `…/safety` | Safety sheet | 4 large options, red, no icons alone | Call 999 | — |
| I7 | `…/safety/trusted` | Alert trusted contact | One tap, confirms sent | Alert now | — |
| I8 | `…/end` | End session | Both confirm | End Teman | Waiting for the other side |
| I9 | `/[l]/trusted-contacts` | Your contacts | List + add | Add contact | Empty → why it matters |
| I10 | `…/new` | Add contact | Name, phone, relationship, what to notify | Save | — |
| I11 | `/[l]/report` | Report | Category list from §36, then detail | Submit report | — |
| I12 | `…/submitted` | What happens now | Timeline of the process, honest | Back | — |
| I13 | `/[l]/blocked` | Blocked people | List + unblock | — | Empty |
| I14 | `/[l]/safety` | Safety centre | Guidelines, what Teman is not, emergency numbers | — | — |

## J · Feedback & trust — 5 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| J1 | `…/feedback` | How was it | Descriptor chips, multi-select, **no stars** | Continue | — |
| J2 | `…/feedback/private` | Private questions | Felt safe · would meet again — marked private | Submit | — |
| J3 | `…/feedback/thanks` | ★ Teman Moment | Sisi completed state, the only badge given | Done | — |
| J4 | `/[l]/people/[id]` | Someone's profile | Verified, Moments, tenure, descriptors, languages, area | Add to trusted | Own profile differs |
| J5 | `…/moments` | Your Teman Moments | History, counted not scored | — | Empty |

## K · Relationships & community — 14 screens

| # | Route | Job | Pattern | Primary action | States |
|---|---|---|---|---|---|
| K1 | `/[l]/trusted` | Trusted Temans | Grouped: mine, Mum's, Dad's | Add | Empty |
| K2 | `…/add` | Add to trusted | Pick person + who it's for | Save | — |
| K3 | `…/recurring/new` | Make it recurring | Frequency cards, both must agree | Propose | — |
| K4 | `…/recurring/[id]` | A recurring arrangement | Schedule, next date, pause, end | — | Proposed · active · paused |
| K5 | `…/recurring/end` | End it | **No reason required.** Plain confirm. | End | — |
| K6 | `/[l]/circles` | Browse circles | Cards by area | Join | Empty |
| K7 | `…/[id]` | Circle detail | About, members, activity | Join | Member · pending |
| K8 | `…/[id]/members` | Members | List | — | — |
| K9 | `…/new` | Create a circle | Form | Create | Needs approval |
| K10 | `/[l]/orgs/[id]` | Organisation | Verified profile, their Temans | — | — |
| K11 | `/[l]/calendar` | Your commitments | Month + agenda | — | Empty |
| K12 | `/[l]/activities` | Requests you helped with | List by state | — | Empty |
| K13 | `…/[id]` | Activity detail | Read-only history | — | — |
| K14 | `/[l]/community-guidelines` | The rules | Readable long-form, 4 languages | — | — |

---

## The twelve screens that carry the design

Everything above works as a table. These twelve don't — they're where the product is won or lost.

### A1 · Language picker
The first thing anyone sees, and the screen most likely to be reached by someone who can't read the current language. Four cards, each 64 px minimum, each showing the language in its own script at 21 px with the English name beneath at 14 px. Order fixed forever: English, Bahasa Melayu, தமிழ், 中文 — people scan for a shape, and a reordering list destroys that. No flags. Nothing else on the screen: no logo lockup competing, no "welcome to Teman" in a language they may not read. The Teman mark sits small at the top in its waiting state.

### A7 · You're in
Peak–End moment for onboarding. Sisi completes — the dashed form fills amber for the first time in the user's experience of the product. One line: *"You're part of Brickfields now."* Then the intent fork: two large cards, "I want to help someone" and "I need someone with me". Not a generic checkmark. This is the screen that decides whether they continue into verification or close the app.

### B1 · Home, caregiver
Greeting in Vollkorn at 1.5em. Date beneath. Then three big actions with 12 px between them — Need a Teman filled teal, the other two ghost, so exactly one is loud. Around You is a bordered card with real numbers, not icons: the numeral is the content. Next Teman below. Language and text size sit in a sticky bar at the bottom, in the same place forever.

No amber anywhere on this screen. Nothing is connected yet, and amber that appears without a person attached stops meaning anything.

### B2 · Home, elder view
Not a shrunken B1 — a different screen. Three actions in the person's own words: *Someone to come with me* · *Someone to talk to* · *Call my family*. No counters, no discovery, no browsing, no Around You. Text size defaults to Large. Every other feature is hidden, not made smaller. Call my family is always in the same position, always visible, and never scrolls away.

### D1 · Verification ladder
Four rungs drawn as an actual vertical ladder, not four cards in a row — the metaphor does real work here because the point is progression. The current rung is filled teal; completed rungs carry a check; locked rungs are outlined at Neutral 500. Each locked rung states what it unlocks in one line, because "get verified" is not a reason and "verified Temans can accept hospital requests" is.

### D3 · ID capture
The highest-drop-off screen in the app. Frame overlay showing exactly where the card goes. Two equally weighted routes — Take a photo and Choose from gallery — because many people have already photographed their MyKad. Below, in plain language: *reviewed by a person, deleted after 90 days, never shown to other members.* No client-side quality gate. Accept whatever they give you.

### E1–E7 · Request creation
Seven screens, one decision each, stepper at top stating "Step 3 of 7" in words. Step 1 is a category grid, not a dropdown — Hick's Law argues for fewer choices, but here the categories *are* the product, and a dropdown hides them. Every step autosaves. The Continue button always sits in the same position so a returning user builds muscle memory across steps.

### E11 · Published
Sisi in its waiting state — solid form, dashed space beside it. Below, in the app's voice, what happens next and when: *"We're asking Temans near Brickfields. If no one can make Friday, we'll tell you by Thursday evening."* That sentence is a promise; a background job has to keep it.

### G3 · Request detail, Teman view
Accessibility needs and conversation preferences appear **above** the offer button, always. A volunteer who accepts and then discovers a wheelchair they can't accommodate is a failed meeting and a lost volunteer. The offer button is the only filled control on the screen.

### G8 · Offer received ★
The peak of the entire product. Deep teal full-bleed. Sisi completes — amber's first appearance in this flow. *"Kumar can be there."* Then the trust panel: verified badge, Teman Moments, member since, languages, area, transport, descriptor chips. One amber CTA — Accept Kumar. Two ghost buttons beneath. A line stating that exact address and phone stay hidden until both accept.

No star rating. No percentage match. No "94% compatible". Facts and words, because that is what turns a stranger into someone you'd let sit beside your father.

### I4 · Active session
Sisi joined state at the top, elapsed time in Vollkorn at 40 px — large because it's the one thing being glanced at. "Who has been told" as an explicit list with ticks: you, the trusted contact, live location on or off. Then Message, End session, and **Safety help** in its own red, visually separated by 20 px so it is never mis-tapped and never blends into the other two. At the bottom: *Teman is not an emergency service. In a real emergency call 999 first.*

### J3 · Feedback thanks
Sisi in its completed state, both forms amber, joined. *"That was a Teman Moment."* The count increments. This is the only badge the product ever gives, and it deliberately measures the same thing §44 measures — a completed companionship, not a streak, not a level, not a rank.
