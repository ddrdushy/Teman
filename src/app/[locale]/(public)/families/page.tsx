import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';

/* P5 · The caregiver's real question is "is my father safe with a
   stranger?" — answer it directly. */
export default async function FamiliesPage() {
  const locale = await getLocale();
  const t = await getTranslations('site.families');
  return (
    <ProsePage title={t('title')} lede={t('lede')}>
      <Section heading={t('manageTitle')}>
        <p style={{ margin: 0 }}>{t('manageBody')}</p>
      </Section>
      <Section heading={t('safeTitle')}>
        <p style={{ margin: 0 }}>{t('safeBody1')}</p>
        <p style={{ margin: 0 }}>{t('safeBody2')}</p>
      </Section>
      <Section heading={t('trackTitle')}>
        <p style={{ margin: 0 }}>{t('trackBody')}</p>
      </Section>
      <Link href={`/${locale}/start`} className="btn btn-primary btn-lg" style={{ width: 'auto', textDecoration: 'none', justifySelf: 'start' }}>
        {t('cta')}
      </Link>
    </ProsePage>
  );
}
