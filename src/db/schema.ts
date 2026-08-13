/**
 * Teman — core schema (M0 slice).
 *
 * Four decisions baked in here that are painful to retrofit:
 *
 *  1. A request is *for* someone, not *by* someone. requesterId and beneficiary
 *     are separate. Model this on day one or every family-managed feature
 *     becomes a special case.
 *  2. Two locations per request. approxPoint is jittered and safe to expose;
 *     exactPoint is readable only through lib/privacy.ts after mutual accept.
 *  3. Language lives on the person, not the device. A caregiver sets up in
 *     English and hands the phone to a parent who reads Tamil.
 *  4. Safety feedback is separate from public feedback. Descriptors are shown;
 *     feltSafe is not, and it opens a case rather than lowering a number.
 */

import {
  pgTable, pgEnum, uuid, text, timestamp, boolean, integer, smallint,
  jsonb, customType, index, uniqueIndex,
} from 'drizzle-orm/pg-core';

/* PostGIS geography — matching is fundamentally a geo + time query. */
const geography = customType<{ data: string; driverData: string }>({
  dataType: () => 'geography(Point, 4326)',
});

export const langEnum   = pgEnum('lang', ['en', 'ms', 'ta', 'zh']);
export const verifTier  = pgEnum('verif_tier', ['none', 'basic', 'identity', 'community', 'enhanced']);
export const verifState = pgEnum('verif_state', ['pending', 'approved', 'rejected']);
export const reqStatus  = pgEnum('req_status', ['draft', 'looking', 'matched', 'active', 'completed', 'cancelled', 'expired']);
export const urgency    = pgEnum('urgency', ['planned', 'today', 'soon']);
export const offerState = pgEnum('offer_state', ['offered', 'accepted', 'declined', 'withdrawn']);
export const sessState  = pgEnum('sess_state', ['scheduled', 'active', 'ended', 'abandoned']);
export const partyRole  = pgEnum('party_role', ['requester', 'teman']);

/* Categories are a table, not an enum. Twenty-plus of them, each needing four
   translations and each likely to change after the pilot — an enum would mean
   a migration every time the NGO suggests one. */
export const area = pgTable('area', {
  id:        uuid('id').primaryKey().defaultRandom(),
  parentId:  uuid('parent_id'),
  level:     text('level').notNull(),          // country | state | city | area
  name:      text('name').notNull(),
  nameMs:    text('name_ms'),
  nameTa:    text('name_ta'),
  nameZh:    text('name_zh'),
  centroid:  geography('centroid'),
});

export const category = pgTable('category', {
  id:       uuid('id').primaryKey().defaultRandom(),
  group:    text('group').notNull(),           // health | errands | elderly | emotional | social | welfare | digital
  key:      text('key').notNull().unique(),
  nameEn:   text('name_en').notNull(),
  nameMs:   text('name_ms'),
  nameTa:   text('name_ta'),
  nameZh:   text('name_zh'),
  sort:     integer('sort').notNull().default(0),
  active:   boolean('active').notNull().default(true),
});

export const person = pgTable('person', {
  id:               uuid('id').primaryKey().defaultRandom(),
  phoneE164:        text('phone_e164').notNull().unique(),   // the login identity
  phoneVerifiedAt:  timestamp('phone_verified_at', { withTimezone: true }),
  email:            text('email'),                           // recovery only, never login
  displayName:      text('display_name').notNull(),
  photoKey:         text('photo_key'),                       // R2 object key
  preferredLanguage: langEnum('preferred_language').notNull().default('en'),
  textScale:        smallint('text_scale').notNull().default(18),   // 18 | 22 | 26
  areaId:           uuid('area_id').references(() => area.id),
  approxPoint:      geography('approx_point'),               // jittered home area
  bio:              text('bio'),
  languages:        text('languages').array(),
  categories:       uuid('categories').array(),
  transport:        jsonb('transport'),
  verificationTier: verifTier('verification_tier').notNull().default('none'),
  isElderView:      boolean('is_elder_view').notNull().default(false),
  /* Two admin roles (docs/08): coordinator = verification review + volunteer
     directory, read-only elsewhere; admin = everything. Enforced server-side
     in every admin route — never by hiding buttons. Null = a member. */
  role:             text('role'),
  /* Not a delete. Moderation needs history, and a serious report must restrict
     matching immediately while it is reviewed. */
  suspendedAt:      timestamp('suspended_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  approxIdx: index('person_approx_gist').using('gist', t.approxPoint),
}));

/* A person managed by an account holder. NOT a `person` — they may never sign in. */
export const careRecipient = pgTable('care_recipient', {
  id:                uuid('id').primaryKey().defaultRandom(),
  managedBy:         uuid('managed_by').notNull().references(() => person.id, { onDelete: 'cascade' }),
  preferredName:     text('preferred_name').notNull(),
  relationship:      text('relationship'),
  ageBand:           text('age_band'),          // a band, not a birthdate — nothing needs the exact date
  preferredLanguage: langEnum('preferred_language').notNull(),
  /* Free text only. NO structured medical fields, ever — the moment a
     `conditions` table exists someone fills it in, and you are holding health
     data under a different legal regime. (Scope §17.) */
  mobilityNotes:     text('mobility_notes'),           // encrypted at rest
  accessibility:     jsonb('accessibility'),           // ['wheelchair','slow_walking','hearing']
  conversationPrefs: jsonb('conversation_prefs'),      // ['just_listen','no_advice']
  emergencyContact:  jsonb('emergency_contact'),       // encrypted at rest
  createdAt:         timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id:           uuid('id').primaryKey().defaultRandom(),
  personId:     uuid('person_id').notNull().references(() => person.id, { onDelete: 'cascade' }),
  tier:         verifTier('tier').notNull(),
  docType:      text('doc_type'),                 // mykad | passport
  docKey:       text('doc_key'),                  // R2 — deleted 90 days after review
  /* Salted hash only. The raw number has no product use after verification,
     and storing it would be a liability with no upside. */
  docHash:      text('doc_hash'),
  selfieKey:    text('selfie_key'),
  state:        verifState('state').notNull().default('pending'),
  reviewedBy:   uuid('reviewed_by').references(() => person.id),
  reviewedAt:   timestamp('reviewed_at', { withTimezone: true }),
  rejectReason: text('reject_reason'),
  purgeAfter:   timestamp('purge_after', { withTimezone: true }),   // drives the deletion job
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  hashIdx:  index('verification_hash').on(t.docHash),
  queueIdx: index('verification_queue').on(t.state, t.createdAt),
}));

export const request = pgTable('request', {
  id:              uuid('id').primaryKey().defaultRandom(),
  requesterId:     uuid('requester_id').notNull().references(() => person.id),
  beneficiaryType: text('beneficiary_type').notNull(),        // 'self' | 'care_recipient'
  beneficiaryId:   uuid('beneficiary_id'),
  categoryId:      uuid('category_id').notNull().references(() => category.id),
  status:          reqStatus('status').notNull().default('draft'),
  urgency:         urgency('urgency').notNull().default('planned'),
  title:           text('title').notNull(),
  description:     text('description'),
  areaId:          uuid('area_id').references(() => area.id),
  /* jittered ~500m — this is what discovery reads */
  approxPoint:     geography('approx_point').notNull(),
  /* PRIVATE until mutual accept. Only lib/privacy.ts reads these. */
  exactPoint:      geography('exact_point'),
  exactAddress:    text('exact_address'),
  startsAt:        timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt:          timestamp('ends_at', { withTimezone: true }),
  isFlexible:      boolean('is_flexible').notNull().default(false),
  prefs:           jsonb('prefs'),   // {gender, languages[], ageRange, driving, verifiedOnly, sameDestination}
  visibility:      text('visibility').notNull().default('public'),
  /* Load-bearing. This is what lets a job say "no one could make Friday"
     *before* Friday, instead of leaving someone to find out on the morning. */
  expiresAt:       timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  approxIdx: index('request_approx_gist').using('gist', t.approxPoint),
  lookIdx:   index('request_looking').on(t.status, t.startsAt),
}));

/* A journey ("I'm going there too") is availability with a destination,
   not a separate concept. */
export const availability = pgTable('availability', {
  id:               uuid('id').primaryKey().defaultRandom(),
  personId:         uuid('person_id').notNull().references(() => person.id, { onDelete: 'cascade' }),
  startsAt:         timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt:           timestamp('ends_at', { withTimezone: true }).notNull(),
  areaId:           uuid('area_id').references(() => area.id),
  centrePoint:      geography('centre_point').notNull(),
  radiusM:          integer('radius_m').notNull().default(5000),
  categories:       uuid('categories').array(),
  transport:        jsonb('transport'),
  destinationPoint: geography('destination_point'),   // set = this is a journey
  repeatsWeekly:    boolean('repeats_weekly').notNull().default(false),
  isActive:         boolean('is_active').notNull().default(true),
}, (t) => ({
  centreIdx: index('availability_centre_gist').using('gist', t.centrePoint),
  timeIdx:   index('availability_time').on(t.startsAt, t.endsAt),
}));

export const offer = pgTable('offer', {
  id:          uuid('id').primaryKey().defaultRandom(),
  requestId:   uuid('request_id').notNull().references(() => request.id, { onDelete: 'cascade' }),
  temanId:     uuid('teman_id').notNull().references(() => person.id),
  state:       offerState('state').notNull().default('offered'),
  message:     text('message'),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
}, (t) => ({
  uniq: uniqueIndex('offer_unique').on(t.requestId, t.temanId),
  byReq: index('offer_by_request').on(t.requestId, t.state),
}));

/* The match row existing *is* the permission grant for exact location.
   No separate ACL table. */
export const match = pgTable('match', {
  id:                     uuid('id').primaryKey().defaultRandom(),
  requestId:              uuid('request_id').notNull().unique().references(() => request.id, { onDelete: 'cascade' }),
  temanId:                uuid('teman_id').notNull().references(() => person.id),
  acceptedByRequesterAt:  timestamp('accepted_by_requester_at', { withTimezone: true }),
  acceptedByTemanAt:      timestamp('accepted_by_teman_at', { withTimezone: true }),
  createdAt:              timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable('session', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  matchId:             uuid('match_id').notNull().unique().references(() => match.id, { onDelete: 'cascade' }),
  state:               sessState('state').notNull().default('scheduled'),
  startedAt:           timestamp('started_at', { withTimezone: true }),
  endedAt:             timestamp('ended_at', { withTimezone: true }),
  expectedDurationMin: integer('expected_duration_min'),
  startedBy:           uuid('started_by'),
  endedBy:             uuid('ended_by'),
  liveLocationEnabled: boolean('live_location_enabled').notNull().default(false),
});

export const feedback = pgTable('feedback', {
  id:           uuid('id').primaryKey().defaultRandom(),
  sessionId:    uuid('session_id').notNull().references(() => session.id, { onDelete: 'cascade' }),
  fromPerson:   uuid('from_person').notNull().references(() => person.id),
  aboutPerson:  uuid('about_person').notNull().references(() => person.id),
  role:         partyRole('role').notNull(),
  /* PUBLIC — words only. No stars, no averages, no percentages. */
  descriptors:  text('descriptors').array(),
  /* PRIVATE — never rendered on a profile. A `false` here fires a moderation
     event; it never touches a displayed count. This single line is what keeps
     Teman from becoming a rating platform. (Scope §35.) */
  feltSafe:        boolean('felt_safe'),
  wouldMeetAgain:  boolean('would_meet_again'),
  privateNote:     text('private_note'),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trustedContact = pgTable('trusted_contact', {
  id:           uuid('id').primaryKey().defaultRandom(),
  personId:     uuid('person_id').notNull().references(() => person.id, { onDelete: 'cascade' }),
  name:         text('name').notNull(),
  phone:        text('phone').notNull(),      // encrypted at rest
  relationship: text('relationship'),
  notifyOn:     jsonb('notify_on'),           // {start, arrival, end, liveLocation}
});

export const report = pgTable('report', {
  id:              uuid('id').primaryKey().defaultRandom(),
  reporterId:      uuid('reporter_id').notNull().references(() => person.id),
  subjectPersonId: uuid('subject_person_id').notNull().references(() => person.id),
  sessionId:       uuid('session_id').references(() => session.id),
  category:        text('category').notNull(),
  detail:          text('detail'),
  severity:        text('severity').notNull().default('high'),
  status:          text('status').notNull().default('open'),
  handledBy:       uuid('handled_by').references(() => person.id),
  handledAt:       timestamp('handled_at', { withTimezone: true }),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const block = pgTable('block', {
  blockerId: uuid('blocker_id').notNull().references(() => person.id, { onDelete: 'cascade' }),
  blockedId: uuid('blocked_id').notNull().references(() => person.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: uniqueIndex('block_unique').on(t.blockerId, t.blockedId),
}));

/* One row per OTP sent. Rate limits are computed from these rows (3/number/hr,
   10/IP/hr — the constants live in lib/otp.ts, not in config). Only the hash is
   stored; codes are never persisted in clear. Device trust (A-04) is the 90-day
   session cookie, not a table. */
export const otpChallenge = pgTable('otp_challenge', {
  id:         uuid('id').primaryKey().defaultRandom(),
  phoneE164:  text('phone_e164').notNull(),
  codeHash:   text('code_hash').notNull(),
  salt:       text('salt').notNull(),
  requestIp:  text('request_ip'),
  attempts:   integer('attempts').notNull().default(0),
  expiresAt:  timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  phoneIdx: index('otp_phone').on(t.phoneE164, t.createdAt),
  ipIdx:    index('otp_ip').on(t.requestIp, t.createdAt),
}));

/* Notifications are stored as kind + params and rendered through the message
   catalogues at read time, in the RECIPIENT'S language — a caregiver in
   English and a volunteer in Tamil see the same event correctly. Helpful
   only, never engagement-driven (§39): no streaks, no "come back" nudges. */
export const notification = pgTable('notification', {
  id:        uuid('id').primaryKey().defaultRandom(),
  personId:  uuid('person_id').notNull().references(() => person.id, { onDelete: 'cascade' }),
  kind:      text('kind').notNull(),        // maps to messages notifications.<kind>
  params:    jsonb('params'),               // interpolation values, no PII beyond first names
  sisiState: text('sisi_state'),            // waiting | answered | together | moment
  readAt:    timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byPerson: index('notification_person').on(t.personId, t.createdAt),
}));

/* Append-only. Verification decisions, address reveals, admin record access,
   moderation actions. The NGO will ask who saw what. */
export const auditLog = pgTable('audit_log', {
  id:          uuid('id').primaryKey().defaultRandom(),
  actorId:     uuid('actor_id').references(() => person.id),
  action:      text('action').notNull(),
  subjectType: text('subject_type'),
  subjectId:   uuid('subject_id'),
  meta:        jsonb('meta'),
  at:          timestamp('at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  actorIdx:   index('audit_actor').on(t.actorId, t.at),
  subjectIdx: index('audit_subject').on(t.subjectType, t.subjectId),
}));
