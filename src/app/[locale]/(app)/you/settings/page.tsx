import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Card } from '@/components/Card';
import { SettingsForm } from './SettingsForm';

/* B7 · Language, text size (options at their own size, live preview),
   elder view toggle. */
export default async function SettingsPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations();

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p) redirect(`/${locale}`);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
        {t('you.settingsTitle')}
      </h1>
      <SettingsForm textScale={p.textScale} isElderView={p.isElderView} />
      {/* live preview — how it will look */}
      <Card title={t('you.previewTitle')} meta={t('you.previewMeta')} />
    </main>
  );
}
