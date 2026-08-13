/**
 * THE discovery query (docs/03). Route handlers never compose their own —
 * this single discipline is the location-privacy model for discovery.
 * Reads approx_point only. Ranking: same destination → existing trust →
 * distance. Distance is the tiebreaker, not the driver.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/db';

export type DiscoveryRow = {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  areaId: string | null;
  startsAt: Date;
  endsAt: Date | null;
  isFlexible: boolean;
  urgency: string;
  prefs: unknown;
  beneficiaryType: string;
  beneficiaryId: string | null;
  metres: number;
};

export async function discoverRequests(params: {
  temanId: string;
  centreWkt: string;
  radiusM: number;
  availStart: Date;
  availEnd: Date;
  categories: string[];        // empty = all
  temanLanguages: string[];
  temanVerified: boolean;
  destinationWkt?: string | null;
}): Promise<DiscoveryRow[]> {
  const rows = await db.execute(sql`
    SELECT r.id, r.category_id AS "categoryId", r.title, r.description,
           r.area_id AS "areaId", r.starts_at AS "startsAt", r.ends_at AS "endsAt",
           r.is_flexible AS "isFlexible", r.urgency, r.prefs,
           r.beneficiary_type AS "beneficiaryType", r.beneficiary_id AS "beneficiaryId",
           ST_Distance(r.approx_point, ${params.centreWkt}::geography) AS metres
    FROM request r
    JOIN person owner ON owner.id = r.requester_id
    WHERE r.status = 'looking'
      AND r.expires_at > now()
      AND owner.suspended_at IS NULL
      AND ST_DWithin(r.approx_point, ${params.centreWkt}::geography, ${params.radiusM})
      AND tstzrange(r.starts_at, COALESCE(r.ends_at, r.starts_at + interval '2 hours'))
          && tstzrange(${params.availStart.toISOString()}::timestamptz, ${params.availEnd.toISOString()}::timestamptz)
      AND (${params.categories.length === 0} OR r.category_id = ANY(${sql.raw(`ARRAY[${params.categories.map((c) => `'${c}'::uuid`).join(',') || 'NULL::uuid'}]`)}))
      AND (r.prefs->'languages' IS NULL
           OR jsonb_array_length(r.prefs->'languages') = 0
           OR r.prefs->'languages' ?| ${sql.raw(`ARRAY[${params.temanLanguages.map((l) => `'${l.replace(/'/g, '')}'`).join(',') || `''`}]`)})
      AND (COALESCE(r.prefs->>'verifiedOnly', 'false') <> 'true' OR ${params.temanVerified})
      AND r.requester_id <> ${params.temanId}
      AND NOT EXISTS (SELECT 1 FROM block b
                      WHERE (b.blocker_id = r.requester_id AND b.blocked_id = ${params.temanId})
                         OR (b.blocker_id = ${params.temanId} AND b.blocked_id = r.requester_id))
      AND NOT EXISTS (SELECT 1 FROM offer o
                      WHERE o.request_id = r.id AND o.teman_id = ${params.temanId}
                        AND o.state IN ('offered', 'accepted'))
    ORDER BY
      (COALESCE(r.prefs->>'sameDestination', 'false') = 'true'
        AND ${params.destinationWkt ?? null}::text IS NOT NULL) DESC,
      EXISTS (SELECT 1 FROM trusted_teman t
              WHERE t.owner_id = r.requester_id AND t.teman_id = ${params.temanId}) DESC,
      metres ASC
    LIMIT 20
  `);
  return rows as unknown as DiscoveryRow[];
}
