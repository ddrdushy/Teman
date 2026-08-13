# Teman — Admin Platform & Public Site Screen Specs

Two surfaces, opposite design problems. Admin is a dense internal tool used daily by two or three people; the public site is a conversion surface read once by a stranger. Neither follows the member app's elderly rules — different audience, different constraints.

---

# Part 1 · Admin platform — 22 screens

**Design position: keep it plain.** Dense tables, filters, no design pass. Every hour spent styling admin is an hour not spent on the member app, and nobody is judging it. The one thing that must be right is that consequential actions are hard to do by accident and impossible to do without a log entry.

Desktop-first, 1280 px baseline. Sidebar navigation. Data-dense tables with sticky headers. Keyboard shortcuts for the verification queue, because it's the screen someone will sit in for an hour during a recruitment drive.

**Two roles.** *NGO coordinator* — verification review, volunteer directory, circles, read-only analytics. *Platform admin* — everything, including suspension, deletion, roles, audit log. The role boundary is enforced server-side, not by hiding buttons.

## Users

| # | Route | Job | Notes |
|---|---|---|---|
| N1 | `/admin` | Dashboard | Counts that need action: pending verifications, open incidents, flagged requests, unmatched requests expiring soon. Every tile links to its queue. Not a vanity dashboard. |
| N2 | `/admin/users` | User list | Filter by area, tier, language, status, join date. Search by name or phone. Export CSV for the NGO. |
| N3 | `/admin/users/[id]` | User detail | Profile, verification history, requests, sessions, feedback received, reports for and against, restrictions. **Opening this writes to `audit_log`.** |
| N4 | `/admin/users/[id]/restrict` | Restrict or suspend | Reason required from a list. Duration or indefinite. States exactly what the user will see. |
| N5 | `/admin/volunteers` | Volunteer directory | The NGO's main screen during recruitment: who registered, which area, which tier, availability declared, profile completeness. |

## Verification

| # | Route | Job | Notes |
|---|---|---|---|
| N6 | `/admin/verifications` | Review queue | Oldest first, waiting time in hours shown and coloured past 24 h. Duplicate-hash matches flagged at the top. |
| N7 | `/admin/verifications/[id]` | Review one | ID image and selfie side by side at full size, submitted name and area alongside. Approve / Reject with reason. Keyboard: `A` approve, `R` reject, `→` next. Images served via short-lived signed URLs, never a public path. |
| N8 | `/admin/verifications/duplicates` | Duplicate queue | Same `doc_hash` across accounts. Usually innocent (a re-registration), occasionally not. |
| N9 | `/admin/orgs` | Organisation verification | Documents, contact, area, approve or reject. |

## Safety & moderation

| # | Route | Job | Notes |
|---|---|---|---|
| N10 | `/admin/incidents` | Incident queue | Severity: urgent / high / low. Urgent pinned. Time since report shown. Auto-created by `felt_safe = false`. |
| N11 | `/admin/incidents/[id]` | Incident detail | Full timeline: request, match, messages, session events, both profiles, prior reports on either party. Actions: no action, warn, restrict matching, suspend, escalate. Every action logged with a reason. |
| N12 | `/admin/reports` | All reports | Filterable by category from §36. |
| N13 | `/admin/blocked` | Blocked accounts | Who is suspended, why, by whom, when, and when it expires. |
| N14 | `/admin/repeat-offenders` | Repeat patterns | Users with more than one report across separate sessions. The pattern is the signal, not any single report. |
| N15 | `/admin/requests/flagged` | Flagged requests | Review, edit, remove with notification. |
| N16 | `/admin/matches/[id]` | Match inspection | Read-only full timeline for disputes. Opening it is logged. |

## Community & content

| # | Route | Job | Notes |
|---|---|---|---|
| N17 | `/admin/circles` | Circles | Approve, manage, assign coordinators. |
| N18 | `/admin/categories` | Category management | Add and edit categories with all four translations. Categories are data, not an enum, precisely so this screen can exist. |
| N19 | `/admin/translations` | Translation management | Every key, four columns, missing values highlighted. This is how the human translation pass actually gets done. |

## Analytics & platform

| # | Route | Job | Notes |
|---|---|---|---|
| N20 | `/admin/analytics` | The numbers that matter | **Teman Moments** as the headline. Then: requests created, matched, completion rate, median time to match, repeat companions, recurring arrangements, active Temans, people helped, family-managed requests, unfulfilled requests, safety incident rate, retention. Filterable by area and date. |
| N21 | `/admin/analytics/demand` | Unmet demand by area | Where requests go unmatched. This is the screen that tells the NGO where to recruit next — arguably the most operationally useful screen in the whole admin. |
| N22 | `/admin/audit` | Audit log | Every verification decision, address reveal, admin record access, and moderation action. Filterable by actor, subject, action, date. Read-only, append-only, exportable. |

**Admin rules.** No destructive action without a typed confirmation and a reason. No bulk delete. No admin sees an ID document without it being logged. Suspension is reversible and always states what the user is told. `audit_log` is append-only — not even a platform admin can edit it.

---

# Part 2 · Public site — 12 pages

**Design position: this is a conversion surface with one goal per page.** Same brand system as the app, with more room. Prose can breathe; body text at 18 px, measure capped at 70 characters, generous vertical rhythm.

Four languages. Real photography of Malaysian neighbourhoods — a hospital corridor, a wet market, a bus stop, a kopitiam table. **Not** stock images of smiling seniors being helped, which read as a charity brochure and break the dignity principle in §2 before a single word is read.

Scroll reveals only, used sparingly, `prefers-reduced-motion` respected. One animation idea and one only: **Sisi completes on scroll** in the hero — the dashed form fills amber as the visitor scrolls past. It's the brand argument made without words, and it needs no second effect supporting it.

| # | Route | Goal | Structure |
|---|---|---|---|
| P1 | `/[l]` | Understand and pick a side | Hero: the exchange itself — *I need someone* above *I can be there*, Sisi between them completing on scroll. Then: three real situations in prose, not a three-card feature grid. Then the two CTAs. Then how safety works, briefly. Then the NGO partnership. |
| P2 | `/[l]/how-it-works` | Remove uncertainty | Both journeys side by side, four steps each, real screenshots from the app — never a browser-chrome mockup. |
| P3 | `/[l]/need-a-teman` | Get a request started | Problem-aware audience. Real situations in their words. What it costs (nothing) and what it isn't (not a nurse, not a driver, not a therapist). |
| P4 | `/[l]/volunteer` ★ | **Get a volunteer to sign up** | The NGO's recruitment link. Write this page first. What you'd actually be doing, how long it takes, what happens on the day, the verification process stated plainly, what Teman asks of you and what it doesn't. One CTA repeated. Real volunteer stories once you have them. |
| P5 | `/[l]/families` | Reassure a caregiver | Solution-aware audience. Managing a parent's profile, tracking a session, trusted contacts, the safety model in detail. This visitor's real question is "is my father safe with a stranger" — answer it directly. |
| P6 | `/[l]/organisations` ★ | Get an NGO or RA to partner | Write this second. What partnering involves, coordinator tools, verified community profiles, how volunteers are managed, what the platform costs the organisation (nothing). Contact form to a real person. |
| P7 | `/[l]/safety` | Make trust legible | Verification tiers, session model, trusted contacts, SOS, reporting, moderation, what Teman is not. Long, plain, unmarketed — a page that reads as legal-ish here builds *more* trust, not less. |
| P8 | `/[l]/about` | Why this exists | The narrative from the brand kit. No founder-hero framing. |
| P9 | `/[l]/faq` | Answer the objections | Grouped accordions. Lead with the uncomfortable ones — is it really free, who are these people, what if something goes wrong, what happens to my ID. Avoiding them reads as evasion. |
| P10 | `/[l]/privacy` | PDPA compliance | Plain language first, formal text below. What's collected, why, how long, who sees it, how to delete it. |
| P11 | `/[l]/terms` | Terms | Includes the liability position and the not-an-emergency-service statement. |
| P12 | `/[l]/contact` | Reach a human | Real contact route, stated response time. Visible contact information is itself a trust signal. |

## Public site rules

**One goal per page.** No competing CTAs. P4 asks for a volunteer sign-up and nothing else.

**Benefits over features, but never exaggerate.** A reader believes everything on a page or nothing — one implausible claim undermines the credible ones beside it. Teman's honest claim is small and true: someone will sit with you. Don't inflate it.

**Specific social proof only.** "Kumar has accompanied 12 people to hospital appointments in Brickfields" beats "trusted by hundreds". Until real numbers exist, say nothing rather than something vague.

**Never a three-identical-card feature grid.** It's the clearest tell of a templated page. The content here isn't three parallel points, so don't force it into that shape.

**The moment after signing up is the highest-engagement point in the whole relationship.** Don't waste the confirmation on "Thanks!" — set expectations for what happens next, and, during the pre-launch phase, state the month requests open. That promise was made during recruitment; the site is where it's kept.
