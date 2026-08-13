# Teman — Data Model

Postgres 16 + PostGIS. Written for Drizzle, but the shape is what matters — the reasoning holds whatever ORM you end up with.

**Four decisions baked in here that are painful to retrofit.** Read these before the schema.

1. **A request is *for* someone, not *by* someone.** `requester_id` (who created it) and `beneficiary` (who it's for) are separate. The beneficiary is either the account holder or a care recipient. Model this on day one or every family-managed feature becomes a special case.
2. **Two locations per request, always.** `approx_point` is jittered and safe to expose; `exact_point` is readable only after a match is accepted. Enforced in a query helper, never left to the caller.
3. **Language sits on the person, not the device.** A caregiver sets up in English and hands the phone to a parent who reads Tamil. Both the account and each care recipient carry their own `preferred_language`.
4. **Safety feedback is separate from public feedback.** Descriptors are visible; "did you feel safe" is not, and it routes to moderation rather than lowering a number.

---

## Enums

```ts
export const langEnum = pgEnum('lang', ['en','ms','ta','zh']);
export const verifTier = pgEnum('verif_tier', ['none','basic','identity','community','enhanced']);
export const reqStatus = pgEnum('req_status', ['draft','looking','matched','active','completed','cancelled','expired']);
export const urgency   = pgEnum('urgency', ['planned','today','soon']);
export const offerState= pgEnum('offer_state', ['offered','accepted','declined','withdrawn']);
export const sessState = pgEnum('sess_state', ['scheduled','active','ended','abandoned']);
export const partyRole = pgEnum('party_role', ['requester','teman']);
```

**Category is a table, not an enum.** Twenty-plus categories across health, errands, elderly support, emotional and social companionship — each needing four translations and each likely to change after the pilot. An enum means a migration every time the NGO suggests a new one.

---

## Core tables

### person
The account. One row per human who signs in.

```ts
id                uuid pk
phone_e164        text unique not null      // login identity
phone_verified_at timestamptz
email             text                      // recovery only, never login
display_name      text not null
photo_key         text                      // R2 object key
preferred_language langEnum not null default 'en'
text_scale        smallint not null default 18   // 18 | 22 | 26
area_id           uuid → area
approx_point      geography(Point,4326)     // jittered home area, for matching
bio               text
verification_tier verifTier not null default 'none'
is_elder_view     boolean not null default false
suspended_at      timestamptz               // set by moderation, blocks all matching
created_at, updated_at
```

`suspended_at` rather than a delete. Moderation needs history, and a serious report must restrict matching immediately while it's reviewed.

### care_recipient
A person managed by an account holder. **Not** a `person` — they may never sign in.

```ts
id                 uuid pk
managed_by         uuid → person not null
preferred_name     text not null
relationship       text                     // 'parent' | 'relative' | ...
age_band           text                     // band, not birthdate — nothing needs the exact date
preferred_language langEnum not null
mobility_notes     text                     // encrypted
accessibility      jsonb                    // ['wheelchair','slow_walking','hearing']
conversation_prefs jsonb                    // ['just_listen','no_advice']
emergency_contact  jsonb                    // encrypted {name, phone, relationship}
created_at, updated_at
```

Scope section 17 is explicit: this must not become a medical record. Free-text notes only, no structured condition fields — the moment you add a `conditions` table someone will fill it in and you are holding health data under a different legal regime.

### area
The hyperlocal hierarchy from scope section 45. Self-referencing.

```ts
id, parent_id → area, level ('country'|'state'|'city'|'area'), name,
name_ms, name_ta, name_zh, centroid geography(Point,4326), boundary geography(Polygon,4326)
```

### request

```ts
id               uuid pk
requester_id     uuid → person not null
beneficiary_type text not null              // 'self' | 'care_recipient'
beneficiary_id   uuid                       // null when 'self'
category_id      uuid → category not null
status           reqStatus not null default 'draft'
urgency          urgency not null default 'planned'
title            text not null
description      text
area_id          uuid → area
approx_point     geography(Point,4326) not null   // jittered ~500m — exposed in discovery
exact_point      geography(Point,4326)            // PRIVATE until match accepted
exact_address    text                             // PRIVATE, encrypted
starts_at        timestamptz not null
ends_at          timestamptz
is_flexible      boolean default false
prefs            jsonb   // {gender, languages[], age_range, driving, verified_only, same_destination}
visibility       text default 'public'   // 'public' | 'circles' | 'trusted_only'
expires_at       timestamptz not null    // drives the honest unmatched notice
created_at, updated_at
```

`expires_at` is load-bearing. It's what lets a job tell someone "no one could make Friday" before Friday, instead of leaving them to discover it on the morning.

### availability
A volunteer declaring free time. Also carries "I'm going there too" — a journey is availability with a destination, not a separate concept.

```ts
id, person_id → person, starts_at, ends_at,
area_id → area, centre_point geography(Point,4326), radius_m integer default 5000,
categories uuid[], transport jsonb, destination_point geography(Point,4326),  // set = journey
is_active boolean default true
```

### offer / match

```ts
// offer
id, request_id → request, teman_id → person,
state offerState default 'offered', message text,
created_at, responded_at
unique(request_id, teman_id)

// match — created only on mutual accept; this row is what unlocks exact_point
id, request_id → request unique, teman_id → person,
accepted_by_requester_at, accepted_by_teman_at, created_at
```

The match row existing *is* the permission grant. No separate ACL table.

### session

```ts
id, match_id → match unique, state sessState default 'scheduled',
started_at, ended_at, expected_duration_min,
started_by uuid, ended_by uuid,
live_location_enabled boolean default false,
trusted_contacts_notified jsonb
```

### feedback

```ts
id, session_id → session, from_person uuid, about_person uuid, role partyRole,
descriptors text[],            // PUBLIC: kind, patient, reliable...
felt_safe boolean,             // PRIVATE — never rendered on a profile
would_meet_again boolean,      // PRIVATE
private_note text,             // PRIVATE
created_at
```

`felt_safe = false` fires a moderation event. It never touches a displayed count. This is scope section 35, and it is the single line that keeps Teman from becoming a rating platform.

---

## Trust, safety, community

```ts
verification   id, person_id, tier, doc_type, doc_key /*R2, 90-day retention*/,
               doc_hash /*salted — dedupe only, never the raw number*/,
               selfie_key, status ('pending'|'approved'|'rejected'),
               reviewed_by, reviewed_at, reject_reason, expires_at

trusted_contact id, person_id, name, phone /*encrypted*/, relationship, notify_on jsonb

trusted_teman   id, owner_id, teman_id, for_recipient_id /*nullable — "Mum's Temans"*/
                unique(owner_id, teman_id, for_recipient_id)

circle          id, name, area_id, organisation_id, visibility, created_by
circle_member   circle_id, person_id, role ('member'|'coordinator'), joined_at
organisation    id, name, type, area_id, verified_at, contact

report          id, reporter_id, subject_person_id, session_id, category, detail,
                severity ('low'|'high'|'urgent'), status, handled_by, handled_at
block           blocker_id, blocked_id, created_at
audit_log       id, actor_id, action, subject_type, subject_id, meta jsonb, at
```

`audit_log` covers verification decisions, address reveals, admin access to a user record, and report handling. The NGO will ask who saw what.

---

## Indexes that matter

```sql
CREATE INDEX ON request USING GIST (approx_point);
CREATE INDEX ON availability USING GIST (centre_point);
CREATE INDEX ON request (status, starts_at) WHERE status = 'looking';
CREATE INDEX ON availability (starts_at, ends_at) WHERE is_active;
CREATE INDEX ON offer (request_id, state);
```

The two GIST indexes are the difference between matching being instant and matching being a full table scan. Add them in the first migration, not when it gets slow.

---

## The matching query

```sql
SELECT r.*, ST_Distance(r.approx_point, $centre) AS metres
FROM request r
JOIN category c ON c.id = r.category_id
WHERE r.status = 'looking'
  AND r.expires_at > now()
  AND ST_DWithin(r.approx_point, $centre, $radius_m)
  AND tstzrange(r.starts_at, COALESCE(r.ends_at, r.starts_at + interval '2 hours'))
      && tstzrange($avail_start, $avail_end)
  AND r.category_id = ANY($categories)
  AND (r.prefs->'languages' IS NULL
       OR r.prefs->'languages' ?| $teman_languages)
  AND (r.prefs->>'verified_only' IS DISTINCT FROM 'true' OR $teman_verified)
  AND r.requester_id <> $teman_id
  AND NOT EXISTS (SELECT 1 FROM block b
                  WHERE (b.blocker_id = r.requester_id AND b.blocked_id = $teman_id)
                     OR (b.blocker_id = $teman_id AND b.blocked_id = r.requester_id))
ORDER BY
  (r.prefs->>'same_destination' = 'true' AND $destination IS NOT NULL) DESC,
  EXISTS (SELECT 1 FROM trusted_teman t
          WHERE t.owner_id = r.requester_id AND t.teman_id = $teman_id) DESC,
  metres ASC
LIMIT 20;
```

Ranking follows scope section 14: same destination first, then someone already trusted, then distance. Distance is the tiebreaker, not the driver.

**Note `approx_point`, not `exact_point`.** Write the discovery query once, in `lib/matching.ts`, and never let a route handler compose its own. That single discipline is the entire location-privacy model.

---

## Two rules to enforce in code, not in review

```ts
// lib/privacy.ts — the only way exact location is ever read
export async function revealLocation(requestId: string, viewerId: string) {
  const m = await db.query.match.findFirst({
    where: and(eq(match.requestId, requestId), eq(match.temanId, viewerId),
               isNotNull(match.acceptedByRequesterAt), isNotNull(match.acceptedByTemanAt)),
  });
  if (!m) throw new ForbiddenError('exact location requires an accepted match');
  await audit(viewerId, 'reveal_location', 'request', requestId);
  return db.select({ point: request.exactPoint, address: request.exactAddress })
           .from(request).where(eq(request.id, requestId));
}
```

Anything that reads `exact_point` or `exact_address` goes through this function. If a second code path appears, that's the bug.

Second rule: `person` and `care_recipient` rows are never returned raw to the client. Every response goes through a serialiser that strips `phone_e164`, `emergency_contact`, `mobility_notes` and `exact_*` unless the caller has earned them.
