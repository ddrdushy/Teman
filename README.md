# Teman — M0 Foundation

Nothing user-visible. Everything downstream breaks without it.

**Done when:** you can sign in with a phone number, switch between four languages and three text sizes, and the choice survives a reload — on a real domain with TLS.

---

## Day one, before any product code

```bash
cp .env.example .env          # fill in DOMAIN, POSTGRES_PASSWORD, AUTH_SECRET
docker compose up -d db       # PostGIS + pgcrypto + the pgboss schema
pnpm drizzle-kit push         # first migration, including the GIST indexes
docker compose up -d          # app, worker, caddy, backup
```

Caddy gets a certificate automatically from the `DOMAIN` value. There is no
manual TLS step.

Do this **before** the schema, before auth, before anything. It's a day's work
and it removes every infrastructure unknown while you still have the patience
for them.

---

## What's here

| File | Why it matters |
|---|---|
| `docker-compose.yml` | Five services. Postgres is not published to the host. The worker is the same image with a different command — pg-boss runs inside Postgres, so there's no Redis to operate. |
| `Caddyfile` | Automatic TLS, security headers, and a `no-cache` rule on `sw.js` so a PWA install can't pin an old build. |
| `scripts/init-db.sql` | PostGIS, pgcrypto, and the pgboss schema. Runs once. |
| `scripts/backup.sh` | Nightly `pg_dump`, gzipped, GPG-encrypted, pushed to R2, 30-day retention. **Restore-test it once before the pilot, not after the first incident.** |
| `src/db/schema.ts` | The core tables. Read the header comment before changing anything. |
| `src/lib/privacy.ts` | The entire location-privacy model. Nothing else reads `exactPoint`. |
| `src/lib/otp.ts` | Rate limits live in code, not config. Generous validity on purpose. |
| `src/i18n.ts` | Four locales, per-script type metrics, locale-aware date formatting. |
| `src/app/tokens.css` | Every colour and type value, traceable to the brand kit. A hex code anywhere else is a bug. |
| `src/components/Sisi.tsx` | The signature motif and the enforcement point for the amber rule. |
| `src/messages/*.json` | 78 keys. `ms`, `ta` and `zh` start as English copies — the *keys* must exist from day one. |

---

## Then, in order

1. **The 15 primitives.** Button, GhostButton, BigAction, TextField, Select, RadioCards, Sheet, Card, Pill, Banner, EmptyState, Stepper, NavBar, LanguageSheet, TextSizeControl. These are the highest-leverage hours in the whole build — 129 screens are assembled from them.
2. **`/dev/components`** — one page rendering every component in every state, in four languages at three text sizes. Keep it in the repo forever. It's the only practical way to catch a regression without opening 129 screens.
3. **M1** — volunteer onboarding. Finish it completely, all 21 screens, all four languages, all states, before going wide. That's what teaches you the real per-screen cost. Estimating 129 screens from zero completed screens is guessing.

---

## Rules that outlive M0

- **No literal user-visible string in a component.** Ever. Only keys.
- **No hex codes outside `tokens.css`.**
- **Nothing reads `exactPoint` except `revealLocation()`.**
- **`person` and `careRecipient` rows never reach the client raw** — everything goes through a serialiser in `privacy.ts`. Adding a schema field does not add it to the API.
- **Every consequential action writes to `audit_log`.** Verification decisions, address reveals, admin record access, moderation actions.
- **Text wraps, never truncates.** An ellipsis hides the words the person needed.

---

## Before the pilot

- [ ] Restore a backup into a scratch database and confirm it works
- [ ] Try to abuse the OTP endpoint yourself and confirm the rate limits hold
- [ ] Check `DEMO_MODE` is absent from the production `.env`
- [ ] Confirm the seed script refuses to run against production
- [ ] Test on a three-year-old Android at 3G, not just a recent iPhone
