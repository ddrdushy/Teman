# 12 · AI in Teman

Where AI belongs in this product, where it must never go, and how it's wired so that a provider change is a config change.

**ILMU** is the configured provider — a Malaysian model, which matters here for two reasons that generic providers can't match: Malay, Manglish and code-switched speech, and a data-residency answer that helps the PDPA conversation with the NGO's lawyer. But nothing in the codebase names it outside one file.

---

## The rule everything follows

> **AI never stands in for a person. AI only helps a person be found.**

Teman's thesis is human presence. Scope §49 already excludes voice and video companionship. An AI chatbot, an AI companion, an AI "someone to talk to" isn't a feature here — it's the opposite of the product. A 78-year-old living alone who asks for someone to talk to and gets a bot has not had their isolation solved; it has been papered over, and a real neighbour never came.

Everything below either **removes friction for an older user** or **helps a coordinator work faster**. Nothing generates companionship, and nothing decides anything about a person.

---

## Where it goes, in value order

### 1 · Speech input for request creation ★ the big one

This is the highest-value use in the product and it's not close.

Older users can't type well. They can say *"I need to go to the hospital on Friday morning, my son can't come."* Speech → structured fields → the seven-step form pre-filled, with **every field shown for confirmation before anything is published**.

This is where a Malaysian model should genuinely beat a generic one: `klinik kesihatan`, `HKL`, `pergi jumpa doktor`, Tamil-English mixing mid-sentence, Manglish particles. If ILMU handles those and a generic model mangles them, that alone justifies the integration.

**Rules:** never auto-submit. The user sees a filled form and confirms or edits. If transcription fails, the normal seven steps are right there — speech is an accelerant, never the only route.

### 2 · Read-aloud

Screen text spoken, in all four languages. For low vision, and for a caregiver reading a screen to a parent. Pairs with the existing text-size control rather than replacing it.

### 3 · Translation drafting

You have 78+ keys across four languages, growing to several hundred. AI drafts; **a human reviews every string** in the admin translations screen (N19).

**Hard exception:** safety strings — SOS wording, consent text, the not-an-emergency-service notice, the emotional-support disclaimer — are written by a human and signed off by the NGO. They never touch a model, not even for a first draft. A wrong word there is a real-world harm.

### 4 · Moderation triage

Flags money requests, dating solicitation, grooming language, OTP-asking and MLM patterns — **across all four languages**, which is exactly what your current keyword rules can't do well.

**It flags. It never acts.** No automatic suspension, no automatic rejection, no automatic removal. Output goes to the admin queue with a reason, and a person decides. This is the same discipline as `felt_safe = false`: the system opens a case, a human closes it.

### 5 · Category suggestion

Someone writes a paragraph; the model suggests which category it is. Suggested, pre-selected, always editable. Saves a step, decides nothing.

### 6 · Incident summarisation for admin

An incident timeline — messages, session events, prior reports — condensed into a paragraph so a coordinator has the shape of it before reading the detail. The full timeline stays on screen; the summary sits above it. The coordinator decides.

### 7 · Public-site FAQ answering

Answers a stranger's question on the marketing site. Touches no member data, no database. The lowest-risk surface in the product and a reasonable place to start.

---

## Where it must never go

| Never | Why |
|---|---|
| AI companionship or chat | The opposite of the product |
| Emotional-support responses | §38 says companions aren't counsellors. A model is further from one still. |
| Any automated safety decision | Suspension, verification rejection, matching restriction — all human |
| Generating profile bios | Fake authenticity. The whole trust model rests on the bio being that person's words. |
| Scoring or ranking people | Including a "compatibility score". §20 rejects this outright. |
| Auto-translating safety copy | Human-written, NGO signed off |
| Deciding a match | Matching is a deterministic PostGIS query and stays that way. It must be explainable to a coordinator. |

---

## Data that must never reach a model

Enforced in one place — `lib/ai/guard.ts` — not left to each caller.

- MyKad or passport numbers, and the document or selfie images
- Exact addresses and `exactPoint`
- Phone numbers and emergency contacts
- Care-recipient mobility notes and accessibility details
- Private feedback answers (`feltSafe`, `wouldMeetAgain`, `privateNote`)
- Full names — use first names or initials where a name is needed at all

For speech input, the audio is processed and **not retained**, by us or by the provider. If the provider can't guarantee that contractually, speech input doesn't ship. Confirm this in the ILMU terms before building on it.

---

## Failure is the normal case

Every AI feature degrades to the non-AI path, silently:

| Feature | When it fails |
|---|---|
| Speech input | The seven-step form, unchanged |
| Read-aloud | Native screen reader |
| Translation drafting | The string stays untranslated and shows in the missing column |
| Moderation triage | Keyword rules and member reports, as today |
| Category suggestion | The user picks from the grid |
| Incident summary | The full timeline, which was always there |

**A request must be creatable with the AI provider completely down.** If any of these becomes load-bearing, that's a design error, not an outage.

---

## Wiring

```
src/lib/ai/
├─ index.ts       # the interface everything else imports
├─ guard.ts       # what may and may not be sent — enforced here, once
├─ providers/
│  ├─ ilmu.ts     # the configured provider
│  └─ null.ts     # returns unavailable; used in tests and when AI is off
└─ prompts/       # versioned, reviewable, not inline in components
```

Two reasons for the wrapper rather than calling ILMU directly: you can swap providers without touching product code, and — more importantly — there is exactly one file where the rule *"this data never leaves"* is enforceable and reviewable.

Environment:

```
AI_PROVIDER=ilmu          # or `none`
ILMU_API_KEY=
ILMU_BASE_URL=            # from the ILMU docs
ILMU_MODEL_SPEECH=        # from the ILMU docs
ILMU_MODEL_TEXT=
AI_TIMEOUT_MS=6000        # fail fast; the fallback path is always right there
```

---

## Cost and rate limits

Speech input is per-second audio; the rest is per-token. At pilot scale this is small, but two guards belong in from the start:

- **Rate limit per account** on speech transcription, the same way OTP is limited. An unprotected endpoint is a bill.
- **A monthly ceiling** that disables AI features rather than accruing cost, since the product has no revenue and the NGO can't absorb a surprise.

Fill in real numbers from the ILMU pricing page before enabling anything in production.

---

## What to build, and when

| Feature | Ships with | Why then |
|---|---|---|
| FAQ answering | M10, public site | Zero member data. Safe first integration. |
| Translation drafting | M9, admin | You'll have hundreds of strings by then |
| **Speech input** | **M2, request creation** | The one that changes the product for older users |
| Read-aloud | M2 | Pairs with speech |
| Category suggestion | M2 | Same surface, cheap addition |
| Moderation triage | M9, admin | Needs the incident queue to exist |
| Incident summary | M9, admin | Same |

Don't add AI to M1. Volunteer onboarding needs to work perfectly on its own, and the NGO recruitment phase is not where you want a new external dependency.

---

## Before you write the integration

Pull these from the ILMU docs and put the answers here — the code has a stub waiting for each:

1. Auth: API key header format, base URL
2. Speech-to-text: endpoint, audio formats, whether it handles code-switching in one utterance
3. Language coverage: does it cover Tamil and Chinese, or only Malay and English? If it's Malay-first, use it for `ms` and `en` and fall back elsewhere.
4. Structured output: does it support JSON mode or function calling? Speech-to-form needs it.
5. Retention: is audio and prompt data retained, and for how long? This is the blocking question.
6. Data residency: where does inference run? This is the answer the NGO's lawyer will want.
7. Rate limits and pricing

Questions 5 and 6 come before the rest. If retention can't be turned off, speech input doesn't ship, and the rest of the list is academic.
