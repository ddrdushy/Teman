import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { db } from '@/db';
import { session, match, request, person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { FeedbackFlow } from './FeedbackFlow';

/* J1–J3 · How was it → two private questions → the Teman Moment. */
export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);

  const s = await db.query.session.findFirst({ where: eq(session.id, id) });
  if (!s || s.state !== 'ended') notFound();
  const m = await db.query.match.findFirst({ where: eq(match.id, s.matchId) });
  const r = m ? await db.query.request.findFirst({ where: eq(request.id, m.requestId) }) : null;
  if (!m || !r) notFound();
  if (personId !== r.requesterId && personId !== m.temanId) notFound();

  const otherId = personId === r.requesterId ? m.temanId : r.requesterId;
  const other = await db.query.person.findFirst({
    where: eq(person.id, otherId),
    columns: { displayName: true },
  });

  return <FeedbackFlow sessionId={id} otherName={other?.displayName.split(/\s+/)[0] ?? ''} />;
}
