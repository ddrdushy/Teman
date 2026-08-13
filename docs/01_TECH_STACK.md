# Teman — Tech Stack & Infrastructure

**Context that drives every decision below:** one developer, no revenue, PWA first, self-hosted on a VPS, first users are NGO-recruited volunteers in a single Malaysian neighbourhood. Optimise for *how little you have to operate*, not for scale you don't have.

---

## 1. The stack

| Layer | Choice | Why this one |
|---|---|---|
| **App** | Next.js 15, App Router, TypeScript | One codebase for UI + API. Server Components mean less client JS, which matters on the low-end Androids the audience actually owns. Installable PWA with no separate mobile build. |
| **Styling** | Tailwind CSS with the brand tokens as CSS variables | Tokens live in one file and map 1:1 to the brand kit. No component library — the elderly constraints (64 px targets, 18–26 px scalable text, per-script line-height) fight every default library you'd pull in. |
| **Database** | PostgreSQL 16 + PostGIS | Matching is fundamentally a geo + time query. PostGIS gives you `ST_DWithin` on an index; doing proximity in application code will not survive the first hundred requests. |
| **ORM** | Drizzle | SQL-shaped, tiny runtime, migrations are plain files you can read. Prisma's engine binary is a needless weight on a small VPS. |
| **Auth** | Auth.js v5, phone-OTP primary | The audience has phone numbers, not habitual email. Email is a secondary recovery factor, not the login. |
| **Background jobs** | pg-boss | Runs *inside Postgres*. No Redis, no second service to operate. Handles the reminder/nudge/expiry jobs the product needs. |
| **File storage** | Cloudflare R2 | ID documents and selfies. Free egress, S3-compatible, and — critically — keeps sensitive documents off the same disk as everything else. |
| **Email** | Resend or Postmark | Low volume. Transactional only. |
| **SMS (OTP)** | See §5 — this is the one real cost | |
| **Push** | Web Push (VAPID) | Free, no vendor. Caveats in §6. |
| **i18n** | next-intl | Message catalogues per locale, ICU plurals, locale-aware date and time formatting. |
| **Errors** | Sentry (free tier) | Solo dev has no QA. You need to hear about crashes from the tool, not from the NGO. |
| **Deploy** | Docker Compose + Caddy on one VPS | Caddy does automatic TLS with a two-line config. Compose keeps the whole system in one file you can read in a minute. |

### VPS
Start with **2 vCPU / 4 GB / 40 GB** — Hetzner CX22 or equivalent, roughly €5–8/month. Everything on one box: app, Postgres, Caddy. This comfortably serves the pilot phase.

---

## 2. Why not the obvious alternatives

**Firebase / Supabase** — both are faster on day one and both would have been a reasonable answer. Two things push against them here. First, geo matching: Firestore can't do the radius-plus-time query the matching engine needs, and you'd end up bolting on a second system. Second, the data is unusually sensitive — MyKad images, home addresses of people living alone, live location during sessions — and self-hosting means the PDPA conversation with the NGO's lawyer is about one server you control, not about a US processor's sub-processor list. Supabase is the closest call, and it's self-hostable, so it stays a valid fallback if operating a VPS becomes the bottleneck.

**React Native / Flutter** — a native build is two app-store review processes, two release pipelines, and a signing setup, for one developer, before a single volunteer has registered. The PWA gets to a testable product weeks earlier. Revisit when push notification reliability on iOS becomes the thing blocking you, not before.

**A component library (MUI, shadcn, Chakra)** — the accessibility requirements in the elderly spec override defaults in almost every component: target sizes, text scaling, per-script line-height, no icon-only controls, no truncation. You'd spend more time overriding than building. Build roughly fifteen components by hand and own them.

---

## 3. Repository shape

```
teman/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/           # en · ms · ta · zh
│  │  │  ├─ (public)/        # language picker, sign in, about
│  │  │  ├─ (app)/           # authenticated: home, requests, messages, you
│  │  │  └─ (admin)/         # moderation + verification review
│  │  └─ api/
│  ├─ components/            # hand-built, ~15 primitives
│  ├─ db/                    # drizzle schema + migrations
│  ├─ lib/                   # auth, geo, matching, notify, jobs
│  └─ messages/              # en.json · ms.json · ta.json · zh.json
├─ docker-compose.yml
├─ Caddyfile
└─ .env.example
```

**Rule:** no user-visible string ever appears inside a component. Every string is a key in `messages/`. This is unenforceable retroactively — hardcode English strings for two weeks and you will spend a month extracting them.

---

## 4. Data handling — decide before you write the schema

These are not "later" concerns; each one changes the table definitions.

- **Never store a raw MyKad number.** Store a salted hash for duplicate detection, plus the verification outcome. The number itself has no product use after verification.
- **ID images live in R2 with a short retention** — 90 days after review, then deleted by a scheduled job. Access is via short-lived signed URLs, admin-only, and every access is logged.
- **Two locations per request.** An approximate point (jittered to roughly 500 m, safe to expose in discovery) and the exact point (readable only after both parties accept). Enforce this in a query helper, not in each component — a single forgotten `select *` in a discovery endpoint is the whole privacy model gone.
- **Encrypt at rest**: full-disk on the VPS, plus column-level encryption for emergency contact numbers and care-recipient notes.
- **Backups**: nightly `pg_dump` to R2, encrypted, 30-day retention. Restore-test it once before the pilot, not after the first incident.
- **Audit log** from day one for: verification decisions, address reveals, admin access to a user record, report handling. The NGO will ask who saw what, and "we don't log that" is not an acceptable answer for this product.

---

## 5. SMS OTP — the one cost that bites

Malaysian A2P SMS runs roughly RM 0.05–0.12 per message. At pilot scale (say 200 volunteers averaging three OTPs each) that's negligible — under RM 100. It becomes real if you grow, and it becomes ugly if someone scripts your OTP endpoint.

Mitigations, in order of importance:
1. Rate-limit by phone number *and* by IP, with an exponential backoff. This is not optional; an unprotected OTP endpoint is a direct route to a bill.
2. Long OTP validity (10 minutes) and generous retries — the audience will misread digits. Do not make this strict for "security"; it just locks out the users you need.
3. Cache a successful device for 90 days so returning users don't re-OTP.
4. Consider WhatsApp OTP later — near-universal in Malaysia and cheaper at volume, but it's a Meta Business verification process, so not for phase one.

Providers: Twilio (expensive, works immediately) or a local Malaysian gateway (cheaper, more setup). Start with Twilio; swap later behind a one-function interface.

---

## 6. PWA limits you should know now, not in month three

- **Android**: installable, web push works, this is where most of the audience is. Fine.
- **iOS 16.4+**: web push works **only after the user adds the app to the home screen**. That means your onboarding needs an explicit "Add to Home Screen" step with real screenshots, in all four languages. Budget for it.
- **iOS below 16.4**: no push at all. Fall back to SMS for the handful of notifications that genuinely matter — match found, Teman arrived, session started.
- **Background location**: not available to a PWA. The "share live location during a session" feature therefore only works while the app is in the foreground. Say this plainly in the UI rather than implying continuous tracking. If a future safety review demands true background tracking, that is the thing that justifies a native build — nothing else on the roadmap does.

---

## 7. When to change any of this

You explicitly wanted to start on a VPS and revisit as users grow. Concrete triggers:

| Signal | Do this |
|---|---|
| Postgres CPU consistently above 60% | Move Postgres to its own VPS. One-hour job. |
| More than ~2,000 active users in one area | Add a read replica; move matching queries onto it. |
| iOS push gaps blocking safety notifications | Wrap the PWA (Capacitor) rather than rewriting native. |
| More than one developer | CI, preview environments, a staging database. Not before — it's overhead with no payoff at one person. |
| An NGO asks where data is hosted | You already have the answer. This is a reason to stay self-hosted. |

Nothing above requires a rewrite. That's the point of the choice.
