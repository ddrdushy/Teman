import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';

/* P6 ★ · Get an NGO or residents association to partner. Contact goes to
   a real person; the platform costs the organisation nothing. */
export default async function OrganisationsPage() {
  const locale = await getLocale();
  const t = await getTranslations('site.orgs');

  return (
    <ProsePage title={t('title')} lede={t('lede')}>
      <Section heading={t('whatTitle')}>
        <p style={{ margin: 0 }}>{t('whatBody')}</p>
      </Section>
      <Section heading={t('toolsTitle')}>
        <ul style={{ margin: 0, paddingInlineStart: '1.3em', display: 'grid', gap: '0.5em' }}>
          {['t1', 't2', 't3', 't4'].map((k) => <li key={k}>{t(`tools.${k}` as never)}</li>)}
        </ul>
      </Section>
      <Section heading={t('costTitle')}>
        <p style={{ margin: 0 }}>{t('costBody')}</p>
      </Section>
      <Link href={`/${locale}/contact`} className="btn btn-primary btn-lg" style={{ width: 'auto', textDecoration: 'none', justifySelf: 'start' }}>
        {t('cta')}
      </Link>
    </ProsePage>
  );
}
