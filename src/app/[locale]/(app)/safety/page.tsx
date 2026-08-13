import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { Accordion } from '@/components/Accordion';
import { Banner } from '@/components/Banner';
import { ListRow } from '@/components/ListRow';

/* I14 · Safety centre — guidelines, what Teman is not, the emergency line.
   Long, plain, unmarketed. */
export default async function SafetyCentrePage() {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('safety');

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('centreTitle')}</h1>
      <Banner variant="error" title={t('notEmergencyTitle')}>{t('notEmergencyBody')}</Banner>

      <div className="stack">
        <ListRow href={`/${locale}/trusted-contacts`} icon="☎" title={t('contactsTitle')} sub={t('contactsLead')} />
        <ListRow href={`/${locale}/blocked`} icon="⃠" title={t('blockedTitle')} sub={t('blockedRowSub')} />
        <ListRow href={`/${locale}/report`} icon="!" title={t('reportTitle')} sub={t('reportRowSub')} />
      </div>

      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15em', margin: 'var(--s-2) 0 0' }}>{t('guidelinesTitle')}</h2>
      <div>
        <Accordion summary={t('g1Title')} open>{t('g1Body')}</Accordion>
        <Accordion summary={t('g2Title')}>{t('g2Body')}</Accordion>
        <Accordion summary={t('g3Title')}>{t('g3Body')}</Accordion>
        <Accordion summary={t('g4Title')}>{t('g4Body')}</Accordion>
      </div>
    </main>
  );
}
