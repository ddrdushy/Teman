# 14 · Demo-Day Runbook

Everything needed to run, rescue, and reset the Teman demo. Written for the
five minutes before the NGO walks in.

---

## The demo logins

All four use OTP **000000** (demo environment only — `DEMO_MODE=true`).

| Phone | Who | Opens |
|---|---|---|
| `+60 12-000 0001` | **Dushy** — the caregiver | The main walkthrough account. Friday's HKL request for Dad sits in Upcoming; Dad's trusted Temans; the coordination thread with Kumar. |
| `+60 12-000 0002` | **Kumar** — the volunteer | Availability set, the Teman side of the spine request. |
| `+60 12-000 0003` | **Siti** — NGO coordinator | Verification queue (6 waiting, one duplicate flagged) and the volunteer directory. |
| `+60 12-000 0004` | **Platform admin** | Everything: incidents (I-0093 pinned urgent), analytics (147 Moments), unmet demand (Sentul 48%). |

Tamil at Large text for the walkthrough: sign in, `You → Language & text
size`, pick தமிழ் and **Large** — both persist to the account.

## The ten steps (docs/02, rehearse in this order)

1. Public site `/ta/volunteer` — 60 seconds, sets the frame
2. `/start` → register → verify, in Tamil at Large
3. Dushy: Need a Teman → all seven steps for Dad — don't skip any
4. Kumar: Nearby → the request (accessibility above the offer button) → offer
5. Dushy: the offer → trust panel → **Accept** ★ *pause here — amber's first appearance*
6. Session: both press start → safety button → both press end
7. Feedback: words, then the two private questions → the Teman Moment
8. The expired request — the honest failure (Lim Ah Kow's, under Mei Ling's account, or point at admin)
9. Admin: verification queue (duplicate flagged) → incidents → analytics
10. Elder view: `You → Settings → Simple view` on Dushy — close on this

## If the demo goes sideways — the ten-second reset

On the VPS:

```sh
cd /opt/teman && sudo docker run --rm --network teman_default \
  -v /opt/teman:/w -w /w \
  -e DATABASE_URL=postgres://teman:<pw>@db:5432/teman \
  node:22-alpine sh -c "npm i --no-save postgres@3 >/dev/null 2>&1 && \
    node scripts/seed/demo.mjs --reset && node scripts/seed/admins.mjs"
```

Locally: `set -a; source .env; set +a; node scripts/seed/demo.mjs --reset && node scripts/seed/admins.mjs`

The seed is deterministic and relative-dated: the same world, with Friday's
appointment still on Friday.

## Health checks

```sh
TEMAN_URL=https://<host> node scripts/demo-rehearsal.mjs   # the ten steps, headless
pnpm check:contrast                                        # token maths
pnpm check:messages                                        # no raw key paths
sh scripts/backup-drill.sh                                 # dump → restore → counts
```

## Known state (be honest if asked)

- ms/ta/zh catalogues are largely English copies — the human translation
  pass is the worklist at `/admin/translations`. Safety copy especially is
  English-only pending NGO sign-off (docs/12 forbids machine translation).
- SMS is stubbed (`DEMO_MODE`); trusted-contact messages print to server
  logs. A provider key turns it real.
- AI is off (`AI_PROVIDER=none`) and every screen works that way by design.
- The demo range `+60 12-000 xxxx` and OTP `000000` must never exist in a
  production `.env` — the seed refuses production either way.
