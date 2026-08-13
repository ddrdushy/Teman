import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';
import { Photo } from '@/components/Photo';

/* P4 ★ · The NGO's recruitment link — one goal: a volunteer signs up.
   What you'd actually do, how long it takes, the verification stated
   plainly, what Teman asks and what it doesn't. One CTA, repeated. */
export default async function VolunteerPage() {
  const locale = await getLocale();
  const t = await getTranslations('site.volunteer');
  const tImg = await getTranslations('site.img');
  const cta = (
    <Link href={`/${locale}/start`} className="btn btn-primary btn-lg" style={{ width: 'auto', textDecoration: 'none', justifySelf: 'start' }}>
      {t('cta')}
    </Link>
  );

  return (
    <ProsePage title={t('title')} lede={t('lede')} photo={<Photo slot="arcade" alt={tImg('arcade')} eager />}>
      {cta}
      <Section heading={t('whatTitle')}>
        <p style={{ margin: 0 }}>{t('whatBody1')}</p>
        <p style={{ margin: 0 }}>{t('whatBody2')}</p>
      </Section>
      <Section heading={t('dayTitle')}>
        <ol style={{ margin: 0, paddingInlineStart: '1.3em', display: 'grid', gap: '0.5em' }}>
          {['d1', 'd2', 'd3', 'd4'].map((k) => <li key={k}>{t(`day.${k}` as never)}</li>)}
        </ol>
      </Section>
      <Section heading={t('verifTitle')}>
        <p style={{ margin: 0 }}>{t('verifBody1')}</p>
        <p style={{ margin: 0 }}>{t('verifBody2')}</p>
      </Section>
      <Section heading={t('asksTitle')}>
        <p style={{ margin: 0 }}>{t('asksBody')}</p>
        <p style={{ margin: 0, fontWeight: 600 }}>{t('neverAsks')}</p>
      </Section>
      {cta}
    </ProsePage>
  );
}
