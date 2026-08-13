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
  | 'requestsOpen'
  | 'offerReceived'
  | 'offerAccepted'
  | 'offerDeclined'
  | 'matchConfirmed'
  | 'requestExpired'
  | 'requestCancelledByRequester'
  | 'matchCancelledByTeman'
  | 'reminder24h'
  | 'reminder2h'
  | 'temanArrived'
  | 'sessionStarted'
  | 'sessionEnded'
  | 'trustedAlert'
  | 'recurringProposed'
  | 'recurringAgreed'
  | 'recurringEnded'
  | 'recurringSpawned';

const SISI_FOR_KIND: Record<NotificationKind, string | null> = {
  verificationApproved: 'answered',
  verificationRejected: null,
  requestsOpen: 'waiting',
  offerReceived: 'answered',
  offerAccepted: 'answered',
  offerDeclined: 'waiting',
  matchConfirmed: 'answered',
  requestExpired: 'waiting',
  requestCancelledByRequester: null,
  matchCancelledByTeman: 'waiting',
  reminder24h: 'answered',
  reminder2h: 'answered',
  temanArrived: 'answered',
  sessionStarted: 'together',
  sessionEnded: 'moment',
  trustedAlert: null,
  recurringProposed: 'answered',
  recurringAgreed: 'answered',
  recurringEnded: null,
  recurringSpawned: 'answered',
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
