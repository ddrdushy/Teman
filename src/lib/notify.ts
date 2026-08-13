/**
 * Notifications: stored as kind + params, rendered in the recipient's
 * language at read time. Push/SMS delivery channels attach here later (M8);
 * writing the row is the part every module needs from M1 on.
 *
 * Never sent from here: streaks, re-engagement nudges, activity counts.
 * §44's goal is getting people OFF the app and together in the real world.
 */

import { db } from '@/db';
import { notification } from '@/db/schema';

export type NotificationKind =
  | 'verificationApproved'
  | 'verificationRejected'
  | 'requestsOpen';

const SISI_FOR_KIND: Record<NotificationKind, string | null> = {
  verificationApproved: 'answered',
  verificationRejected: null,
  requestsOpen: 'waiting',
};

export async function notify(
  personId: string,
  kind: NotificationKind,
  params?: Record<string, string | number>,
) {
  await db.insert(notification).values({
    personId,
    kind,
    params,
    sisiState: SISI_FOR_KIND[kind],
  });
}
