import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { careRecipient } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { RecipientForm, type RecipientData } from '../RecipientForm';

/* C8 · Their profile — the owner sees everything and edits in place. The
   Teman-facing view goes through recipientForTeman() in lib/privacy.ts and
   never includes the emergency contact. */
export default async function CareDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('care');

  const r = await db.query.careRecipient.findFirst({
    where: and(eq(careRecipient.id, id), eq(careRecipient.managedBy, personId)),
  });
  if (!r) notFound();

  const initial: RecipientData = {
    id: r.id,
    preferredName: r.preferredName,
    relationship: r.relationship,
    ageBand: r.ageBand,
    preferredLanguage: r.preferredLanguage,
    mobilityNotes: r.mobilityNotes ?? '',
    accessibility: (r.accessibility as string[] | null) ?? [],
    conversationPrefs: (r.conversationPrefs as string[] | null) ?? [],
    emergencyContact: (r.emergencyContact as RecipientData['emergencyContact']) ?? null,
  };

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{r.preferredName}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('editLead')}</p>
      <RecipientForm initial={initial} />
    </main>
  );
}
