import { getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';

/* P10 · PDPA — plain language first. */
export default async function PrivacyPage() {
  const t = await getTranslations('site.privacy');
  return (
    <ProsePage title={t('title')} lede={t('lede')}>
      {(['collected', 'why', 'retention', 'whoSees', 'deletion', 'rights'] as const).map((k) => (
        <Section key={k} heading={t(`${k}Title`)}>
          <p style={{ margin: 0 }}>{t(`${k}Body`)}</p>
        </Section>
      ))}
    </ProsePage>
  );
}
