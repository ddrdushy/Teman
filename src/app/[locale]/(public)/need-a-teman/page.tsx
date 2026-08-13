import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';

/* P3 · Problem-aware audience. Real situations, what it costs (nothing),
   what it isn't. */
export default async function NeedATemanPage() {
  const locale = await getLocale();
  const t = await getTranslations('site.need');
  return (
    <ProsePage title={t('title')} lede={t('lede')}>
      <Section>
        {['ex1', 'ex2', 'ex3'].map((k) => (
          <p key={k} style={{ margin: 0, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.05em' }}>
            {t(k as never)}
          </p>
        ))}
      </Section>
      <Section heading={t('costTitle')}>
        <p style={{ margin: 0 }}>{t('costBody')}</p>
      </Section>
      <Section heading={t('isntTitle')}>
        <p style={{ margin: 0 }}>{t('isntBody')}</p>
      </Section>
      <Link href={`/${locale}/start`} className="btn btn-primary btn-lg" style={{ width: 'auto', textDecoration: 'none', justifySelf: 'start' }}>
        {t('cta')}
      </Link>
    </ProsePage>
  );
}
