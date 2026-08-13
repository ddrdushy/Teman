import { getTranslations } from 'next-intl/server';
import { ProsePage, Section } from '../ProsePage';

/* P11 · Terms — includes the liability position and the not-an-emergency-
   service statement. */
export default async function TermsPage() {
  const t = await getTranslations('site.terms');
  return (
    <ProsePage title={t('title')} lede={t('lede')}>
      {(['whatIs', 'conduct', 'liability', 'emergency', 'changes'] as const).map((k) => (
        <Section key={k} heading={t(`${k}Title`)}>
          <p style={{ margin: 0 }}>{t(`${k}Body`)}</p>
        </Section>
      ))}
    </ProsePage>
  );
}
