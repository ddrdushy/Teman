import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { db } from '@/db';
import { session, match, request, person, trustedContact } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { SessionView } from './SessionView';

/* I1–I8 · One status-driven surface: pre-meeting checklist (scheduled),
   both-confirm start, the live session with Safety help in its own red, and
   both-confirm end. Ships before any real-world meeting — non-negotiable. */
export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);

  const s = await db.query.session.findFirst({ where: eq(session.id, id) });
  if (!s) notFound();
  const m = await db.query.match.findFirst({ where: eq(match.id, s.matchId) });
  const r = m ? await db.query.request.findFirst({ where: eq(request.id, m.requestId) }) : null;
  if (!m || !r) notFound();
  const isRequester = personId === r.requesterId;
  if (!isRequester && personId !== m.temanId) notFound();

  const other = await db.query.person.findFirst({
    where: eq(person.id, isRequester ? m.temanId : r.requesterId),
    columns: { displayName: true },
  });
  const contacts = await db.query.trustedContact.findMany({
    where: eq(trustedContact.personId, r.requesterId),
    columns: { id: true, name: true },
  });

  return (
    <SessionView
      sessionId={s.id}
      state={s.state}
      startedAt={s.startedAt?.toISOString() ?? null}
      startedByMe={s.startedBy === personId}
      startWaiting={Boolean(s.startedBy)}
      endedByMe={s.endedBy === personId}
      endWaiting={Boolean(s.endedBy)}
      liveLocation={s.liveLocationEnabled}
      isRequester={isRequester}
      otherName={other?.displayName.split(/\s+/)[0] ?? ''}
      requestTitle={r.title}
      startsAt={r.startsAt.toISOString()}
      trustedContacts={contacts}
    />
  );
}
