import { getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';
import { Photo } from '@/components/Photo';
import { Sisi } from '@/components/Sisi';

/* P2 · Remove uncertainty — both journeys, four steps each, side by side
   where the screen allows. */
export default async function HowItWorksPage() {
  const t = await getTranslations('site.how');
  const tImg = await getTranslations('site.img');

  const journey = (side: 'need' | 'help') => (
    <div style={{ flex: '1 1 280px', display: 'grid', gap: 'var(--s-2)', alignContent: 'start' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{t(`${side}.title`)}</h2>
      <ol style={{ margin: 0, paddingInlineStart: '1.3em', display: 'grid', gap: '0.5em' }}>
        {['s1', 's2', 's3', 's4'].map((k) => <li key={k}>{t(`${side}.${k}` as never)}</li>)}
      </ol>
    </div>
  );

  return (
    <ProsePage title={t('title')} lede={t('lede')} photo={<Photo slot="market" alt={tImg('market')} eager />}>
      <div style={{ display: 'flex', gap: 'var(--s-6)', flexWrap: 'wrap' }}>
        {journey('need')}
        {journey('help')}
      </div>
      <Section>
        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <Sisi state="answered" size={56} />
          <p style={{ margin: 0, fontWeight: 600 }}>{t('bothAccept')}</p>
        </div>
        <p style={{ margin: 0, color: 'var(--n-700)' }}>{t('offApp')}</p>
      </Section>
    </ProsePage>
  );
}
