import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Avatar } from '@/components/Avatar';
import { ListRow } from '@/components/ListRow';
import { SignOutRow } from './SignOutRow';
import { InstallRow } from './InstallRow';

/* B6 · Account hub. Every row shows its current value. */
export default async function YouPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations();

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p) redirect(`/${locale}`);

  const scaleLabel =
    p.textScale === 26 ? t('language.extraLarge') : p.textScale === 22 ? t('language.large') : t('language.standard');

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
        <Avatar name={p.displayName} size="lg" />
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{p.displayName}</h1>
          <p className="card-meta" style={{ margin: 0 }}>{t(`verify.tier.${p.verificationTier}`)}</p>
        </div>
      </div>
      <div className="stack">
        <ListRow href={`/${locale}/you/settings`} icon="🌐" title={t('you.languageRow')} sub={scaleLabel} />
        <ListRow href={`/${locale}/verify`} icon="✓" title={t('you.verificationRow')} sub={t(`verify.tier.${p.verificationTier}`)} />
        <ListRow href={`/${locale}/profile`} icon={p.displayName.charAt(0)} title={t('you.profileRow')} sub={t('you.profileSub')} />
        <ListRow href={`/${locale}/notifications`} icon="🔔" title={t('notifications.title')} sub={t('you.notificationsSub')} />
        <InstallRow />
        <SignOutRow />
      </div>
    </main>
  );
}
