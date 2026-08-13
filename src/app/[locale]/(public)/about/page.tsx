import { getTranslations } from 'next-intl/server';
import { ProsePage } from '../ProsePage';

/* P8 · Why this exists — the narrative from the brand kit. No founder-hero
   framing. */
export default async function AboutPage() {
  const t = await getTranslations('site.about');
  return (
    <ProsePage title={t('title')}>
      {['p1', 'p2', 'p3', 'p4'].map((k) => (
        <p key={k} style={{ margin: 0 }}>{t(k as never)}</p>
      ))}
    </ProsePage>
  );
}
