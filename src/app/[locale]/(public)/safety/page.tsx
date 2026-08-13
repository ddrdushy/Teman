import { getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';
import { Photo } from '@/components/Photo';
import { Banner } from '@/components/Banner';

/* P7 · Make trust legible. Long, plain, unmarketed — a page that reads
   legal-ish here builds MORE trust, not less. */
export default async function PublicSafetyPage() {
  const t = await getTranslations('site.safety');
  const tImg = await getTranslations('site.img');
  return (
    <ProsePage title={t('title')} lede={t('lede')} photo={<Photo slot="bus-stop" alt={tImg('bus-stop')} eager />}>
      <Banner variant="error" title={t('emergencyTitle')}>{t('emergencyBody')}</Banner>
      {(['verification', 'reveal', 'session', 'contacts', 'reporting', 'isnot'] as const).map((k) => (
        <Section key={k} heading={t(`${k}Title`)}>
          <p style={{ margin: 0 }}>{t(`${k}Body`)}</p>
        </Section>
      ))}
    </ProsePage>
  );
}
