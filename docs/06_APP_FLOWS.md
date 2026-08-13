# Teman — App Flows

Every flow end to end. Read alongside `07_SCREEN_SPECS_MEMBER.md`, which specifies each screen these flows pass through.

Notation: `→` next screen · `⇄` requires both parties · `⟳` background job · `⚑` decision point · `✕` exit or failure path.

---

## 1 · Entry & account creation

```
Language picker  ⚑ en / ms / ta / zh
      → Welcome (what Teman is, 3 lines, 1 CTA)
      → Phone number  (+60 visible)
      → OTP           ⚑ correct → continue
                      ⚑ wrong   → inline error, input preserved, retry
                      ⚑ expired → resend, cooldown shown
      → Your name
      → Your area     (picker, not a map pin)
      → You're in     ★ Peak moment — Sisi completes
      ⚑ intent?
         ├─ I want to help    → Verification ladder → Profile → Availability
         └─ I need help       → Verification ladder → Home
```

**Rules.** Language before account, always. Every step resumable — a force-quit loses nothing. Back never destroys input. Progress stated as "Step 3 of 5", never a bare spinner.

**Failure paths.** Number already registered → route to sign in, don't error. OTP rate limit hit → state the wait in minutes, offer email recovery. No SMS received → resend after 30 s, then an alternative-contact route after three attempts.

---

## 2 · Verification

```
Verification ladder  (Basic ✓ · Identity · Community · Enhanced)
      → Why we ask     (what it's for, who sees it, when it's deleted)
      → Choose document ⚑ MyKad / passport
      → Capture         ⚑ camera / gallery — both accepted
      → Review image    ⚑ retake / use this
      → Selfie          (explains why, then opens camera)
      → Submitted       → Pending review
                        ⟳ admin queue
      ⚑ approved → Verified badge + notification
      ⚑ rejected → Reason + retry ✕ never a dead end
      ⟳ 90 days after review → documents deleted automatically
```

Never block on a client-side quality check. Accept the upload, let a human review it, explain any rejection. A blurry photo rejected by an algorithm with no explanation is where volunteers are lost.

---

## 3 · Creating a request

```
Home → Need a Teman
  Step 1  What do you need?      (category grid)
  Step 2  Who is this for?       ⚑ me / parent / relative / someone I care for
                                 ⚑ no recipient yet → Add care recipient → return
  Step 3  Where?                 (approximate area; exact address later, explained)
  Step 4  When?                  ⚑ now / today / a date / flexible
  Step 5  What kind of help?     (short description; category-specific prompts)
  Step 6  Preferences            (optional — gender, language, age, accessibility,
                                  driving, same destination, verified only)
  Step 7  Review                 (everything on one screen, each line editable)
      → Publish  ⚑ who can see this? public nearby / my circles / trusted only
      → Published ★ Peak moment
      ⚑ has trusted Temans? → "Ask them first?" → yes: offer to circle for 6 h
      → Request detail: Looking
```

**Emotional companionship** inserts one extra step after Step 5: *What would help me today?* — just listen / conversation / walk / coffee / quiet company / advice okay / **please don't give advice**. That last option is the one that makes the category safe to offer at all.

**Welfare check-in** replaces Step 2 with the person being visited, their relationship, and mobility considerations, and holds the address until consent is confirmed.

**Autosave every step.** A caregiver builds this on a commute and gets interrupted.

---

## 4 · Declaring availability

```
Home → I'm available
  → When    ⚑ today / this weekend / pick a date
  → Time window (start, end)
  → Where   (area + radius: walking distance / same area / anywhere in city)
  → What kind of help (categories)
  → Transport
  → Review: "You'll hear about requests within about 5 km of Brickfields"
  → Saved
  ⚑ repeat weekly? (single checkbox)
  → Matching requests shown immediately if any exist
```

Reflect the setting back in plain words. "Radius: 5000 m" means nothing; "within about 5 km of Brickfields" does.

---

## 5 · "I'm going there too"

```
Home → Going somewhere?
  → Destination (search or pick)
  → When
  → Saved
  ⟳ overlap detection runs both directions
  ⚑ overlap found
      → Volunteer sees: "Someone near you needs a Teman to UMMC around the same time"
      → Requester sees: "Mei is already heading to UMMC on Wednesday morning"
  → Offer to accompany → standard offer flow (§6)
```

Both sides are notified. Neither is auto-matched — this surfaces a possibility, it doesn't make a decision.

---

## 6 · Discovery → offer → match

```
VOLUNTEER SIDE                          REQUESTER SIDE
Home → Around you
  → Nearby requests (ranked)
  → Request detail
     accessibility needs visible
     BEFORE the offer button
  → Offer to help (+ message)
        │
        └────── notification ──────────→ Offer received
                                          → Teman profile (trust info only:
                                             name, photo, languages, area,
                                             badge, Moments, descriptors)
                                          ⚑ accept / decline / see full profile
                                             ✕ decline → optional reason,
                                               request stays Looking
        ⇄ mutual accept
        → MATCHED ★ Peak — Sisi completes, amber appears for the first time
        → exact location + contact unlock (logged)
        → meeting point confirmation
        → message thread opens
  ⟳ reminder at 24 h
  ⟳ reminder at 2 h
```

Multiple offers on one request are fine. The requester picks one; the others are declined automatically with an honest message.

---

## 7 · Session & safety

```
2 h before → reminder + pre-meeting checklist
              (meeting point, time, who to look for, share with trusted contact)

At the meeting:
  Volunteer: "I've arrived"  → requester notified
  ⇄ Start Teman — both confirm
     → session active
     → trusted contacts notified (where enabled)
     ⚑ live location? (opt-in, foreground only, stated plainly)

  During:  ┌─ Message
           ├─ Safety help  → ⚑ contact trusted person
           │                 ⚑ call 999
           │                 ⚑ share location now
           │                 ⚑ report what's happening
           └─ End Teman

  ⇄ End Teman — both confirm
     → trusted contacts notified: ended safely
     → Feedback (§8)

  ✕ one side never starts     → nudge at +15 min, then "did you meet?"
  ✕ session never ended       → auto-prompt at expected duration + 1 h,
                                then mark abandoned, then a safety check
```

Session and safety ship before any real-world meeting, including a supervised one.

---

## 8 · Feedback

```
Session ended
  → How was it?        (descriptors — kind, patient, reliable, good listener…)
  → Private questions  ⚑ Did you feel safe?        yes / no
                       ⚑ Would you meet again?     yes / no
                       (stated as private, never shown on a profile)
  → Thank you  → Teman Moment recorded
  ⚑ both said "would meet again" → "Make this recurring?" (§9)
  ⚑ felt_safe = false → ⟳ moderation event, high severity
                        → matching restricted pending review
                        → the person who reported is told what happens next
```

A "no" on safety never lowers a number. It opens a case. That single decision is what keeps Teman from becoming a rating platform.

---

## 9 · Recurring & trusted

```
After a good session:
  ⚑ Make this recurring? → frequency (weekly / fortnightly / monthly / custom)
                         → proposed to the other party
                         ⇄ both agree → recurring created, appears in calendar
                         ⟳ each occurrence auto-creates a request, pre-matched
                         ⚑ either side can pause or end, any time, no reason needed

  ⚑ Add to trusted Temans? → ⚑ for me / for Mum / for Dad
                            → future requests can be offered to this circle first
```

Ending a recurring arrangement must be as easy as starting one, and must never require an explanation. Someone who feels trapped in an obligation stops using the product entirely.

---

## 10 · Circles & organisations

```
Circles: Browse nearby → Circle detail → Join ⚑ open / request approval
         Create circle → name, area, visibility → coordinator role
         Circle members list
         Request visibility can target selected circles

Organisations: verified profile → their Temans → coordinator tools
               ⚑ Individual users always choose whether to connect.
                 Membership never auto-matches anyone.
```

---

## 11 · Admin

```
Verification queue (oldest first, waiting time visible)
  → detail: ID + selfie side by side, name, area, duplicate flag
  ⚑ approve → user notified, badge granted
  ⚑ reject  → reason from list + optional note → user notified with retry route
  ⟳ every decision → audit_log

Incident queue (severity: urgent / high / low)
  → incident detail: full timeline, both parties, session, messages, prior reports
  ⚑ no action / warn / restrict matching / suspend / escalate
  ⟳ every action → audit_log

Flagged requests → review → keep / edit / remove + notify
Disputed matches → full interaction timeline, read-only
Organisation & circle approval
Analytics → Teman Moments, match rate, median time to match, unmet demand by area,
            active Temans, safety incident rate, retention
```

---

## 12 · Notifications

| Trigger | Channel | Copy |
|---|---|---|
| Nearby request matches your availability | Push | "Someone near Bangsar needs a hospital companion Friday morning." |
| Offer received | Push + SMS | "A Teman has offered to accompany your father." |
| Match confirmed | Push + SMS | "Kumar will be there on Friday." |
| Reminder 24 h / 2 h | Push | "Your Teman meeting starts tomorrow at 10 AM." |
| Teman arrived | Push + SMS | "Kumar has arrived at the meeting point." |
| Session started | Push to trusted contacts | "Dad's Teman session has started." |
| Session ended | Push to trusted contacts | "The Teman session has ended safely." |
| Verification approved / rejected | Push + email | |
| Request expiring unmatched | Push | "No one could make Friday. Here's what else you can try." |
| Requests now open (pre-launch phase) | Push + SMS | The promise made during volunteer recruitment. Keep it. |

Safety-critical notifications fall back to SMS, because push does not work on iOS below 16.4 and does not work on any iOS device until the app is added to the home screen.

**Never send:** streaks, re-engagement nudges, "you haven't opened Teman in a while", or anything counting activity. §44 sets the goal as getting people off the app and together in the real world.

---

## 13 · Failure paths worth designing properly

These are the ones that decide whether someone trusts the product.

| Situation | Behaviour |
|---|---|
| No one offers, deadline approaching | Honest notice before the date, plus alternatives — community centres, trying another time, asking a trusted Teman. Never silent. |
| Volunteer cancels last minute | Requester notified immediately, request returns to Looking, trusted circle pinged first, cancellation recorded but not publicly displayed. |
| Requester cancels | Volunteer thanked, not penalised. |
| Neither starts the session | Nudge at +15 min, then "did you meet?" — because they may simply have forgotten the app. |
| Session never ended | Prompt at expected duration + 1 h, then a safety check to both parties and the trusted contact. |
| Serious report filed | Matching restricted immediately, both parties informed of the process, moderation notified. |
| Connection lost mid-form | Autosaved. Resume where they were. |
| Verification rejected | Reason, retry, and a human contact route if they disagree. |

The unmatched-request path is the one to over-invest in. Every product hides it. Showing it honestly is what an NGO will judge you on.
