import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { db } from '@/db';
import { match, request, person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Conversation } from './Conversation';

/* H5 · One conversation, scoped to its request. */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ requestId: string; locale: string }>;
}) {
  const { requestId } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);

  const r = await db.query.request.findFirst({ where: eq(request.id, requestId) });
  const m = await db.query.match.findFirst({ where: eq(match.requestId, requestId) });
  if (!r || !m) notFound();
  if (personId !== r.requesterId && personId !== m.temanId) notFound();

  const otherId = personId === r.requesterId ? m.temanId : r.requesterId;
  const other = await db.query.person.findFirst({
    where: eq(person.id, otherId),
    columns: { displayName: true },
  });

  return (
    <Conversation
      requestId={requestId}
      otherName={other?.displayName.split(/\s+/)[0] ?? ''}
      requestTitle={r.title}
    />
  );
}
