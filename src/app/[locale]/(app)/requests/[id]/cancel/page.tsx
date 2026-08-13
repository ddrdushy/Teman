import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { request } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { CancelConfirm } from './CancelConfirm';

/* E16 · Cancel — a full screen, never a small dialog with a tiny X. */
export default async function CancelPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('req');

  const r = await db.query.request.findFirst({
    where: and(eq(request.id, id), eq(request.requesterId, personId)),
  });
  if (!r) notFound();

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('cancelTitle')}</h1>
      <p style={{ margin: 0 }}>{t('cancelImpact')}</p>
      <CancelConfirm requestId={id} />
    </main>
  );
}
