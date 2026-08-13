import { getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';

/* P12 · Reach a human. Visible contact information is itself a trust
   signal; the response time is stated. */
export default async function ContactPage() {
  const t = await getTranslations('site.contact');
  return (
    <ProsePage title={t('title')} lede={t('lede')}>
      <Section heading={t('emailTitle')}>
        <p style={{ margin: 0 }}>
          <a href="mailto:hello@teman.my" style={{ color: 'var(--t-900)', fontWeight: 600 }}>hello@teman.my</a>
        </p>
        <p style={{ margin: 0, color: 'var(--n-700)' }}>{t('responseTime')}</p>
      </Section>
      <Section heading={t('orgTitle')}>
        <p style={{ margin: 0 }}>{t('orgBody')}</p>
      </Section>
    </ProsePage>
  );
}
