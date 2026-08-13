/**
 * The location-privacy model, in one file.
 *
 * Rule: nothing anywhere else in the codebase reads request.exactPoint or
 * request.exactAddress. If a second code path appears, that is the bug — not
 * a style problem. A single forgotten `select *` in a discovery endpoint is
 * the whole privacy model gone.
 *
 * The match row existing, with both accept timestamps set, *is* the permission
 * grant. There is no separate ACL.
 */

import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { match, request, person, careRecipient, auditLog } from '@/db/schema';

export class ForbiddenError extends Error {
  constructor(msg: string) { super(msg); this.name = 'ForbiddenError'; }
}

export async function audit(
  actorId: string | null,
  action: string,
  subjectType: string,
  subjectId: string,
  meta?: Record<string, unknown>,
) {
  await db.insert(auditLog).values({ actorId, action, subjectType, subjectId, meta });
}

/**
 * The only way exact location is ever read. Both sides must have accepted.
 * Every reveal is logged — a member can ask for that list under the PDPA.
 */
export async function revealLocation(requestId: string, viewerId: string) {
  const req = await db.query.request.findFirst({ where: eq(request.id, requestId) });
  if (!req) throw new ForbiddenError('request not found');

  const isRequester = req.requesterId === viewerId;

  if (!isRequester) {
    const m = await db.query.match.findFirst({
      where: and(
        eq(match.requestId, requestId),
        eq(match.temanId, viewerId),
        isNotNull(match.acceptedByRequesterAt),
        isNotNull(match.acceptedByTemanAt),
      ),
    });
    if (!m) throw new ForbiddenError('exact location requires an accepted match');
  }

  await audit(viewerId, 'reveal_location', 'request', requestId);

  return { point: req.exactPoint, address: req.exactAddress };
}

/* ── Serialisers ───────────────────────────────────────────────────────────
   person and careRecipient rows are never returned raw to the client. Every
   response goes through one of these, which strip anything the caller has not
   earned. Adding a field to the schema does NOT add it to the API.
   ────────────────────────────────────────────────────────────────────────── */

type PersonRow = typeof person.$inferSelect;

/** What a stranger sees before a match: trust facts only. No phone, no address,
 *  and deliberately no score — verification, count, tenure and words. */
export function publicPerson(p: PersonRow, extra: { moments: number; descriptors: string[] }) {
  return {
    id: p.id,
    displayName: p.displayName,
    photoKey: p.photoKey,
    areaId: p.areaId,
    languages: p.languages,
    bio: p.bio,
    verificationTier: p.verificationTier,
    memberSince: p.createdAt,
    temanMoments: extra.moments,
    descriptors: extra.descriptors,
    // NOT exposed: phoneE164, email, approxPoint, suspendedAt, textScale
  };
}

/** After a match: contact details unlock. Still no internal fields. */
export function matchedPerson(p: PersonRow, extra: { moments: number; descriptors: string[] }) {
  return { ...publicPerson(p, extra), phone: p.phoneE164 };
}

type RecipientRow = typeof careRecipient.$inferSelect;

/** What a Teman sees about the person they'd accompany, *before* offering.
 *  Accessibility and conversation preferences are included on purpose: a
 *  volunteer who accepts and then discovers a wheelchair they can't
 *  accommodate is a failed meeting and a lost volunteer. */
export function recipientForTeman(r: RecipientRow) {
  return {
    preferredName: r.preferredName,
    ageBand: r.ageBand,
    preferredLanguage: r.preferredLanguage,
    accessibility: r.accessibility,
    conversationPrefs: r.conversationPrefs,
    mobilityNotes: r.mobilityNotes,
    // NOT exposed: emergencyContact, managedBy, id
  };
}

/** Discovery always reads approxPoint. Never exactPoint. */
export function requestForDiscovery(r: typeof request.$inferSelect) {
  return {
    id: r.id,
    categoryId: r.categoryId,
    title: r.title,
    description: r.description,
    areaId: r.areaId,
    approxPoint: r.approxPoint,
    startsAt: r.startsAt,
    endsAt: r.endsAt,
    isFlexible: r.isFlexible,
    urgency: r.urgency,
    prefs: r.prefs,
    // NOT exposed: exactPoint, exactAddress, requesterId, beneficiaryId
  };
}
