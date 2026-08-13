import { getTranslations } from 'next-intl/server';
import { ProsePage } from '../ProsePage';
import { Accordion } from '@/components/Accordion';

/* P9 · The questions people actually ask — leading with the uncomfortable
   ones, because avoiding them reads as evasion. */
export default async function FaqPage() {
  const t = await getTranslations('site.faq');
  const ITEMS = ['free', 'who', 'nobody', 'wrong', 'noPhone', 'gender', 'dating', 'id'] as const;

  return (
    <ProsePage title={t('title')}>
      <div>
        {ITEMS.map((k, i) => (
          <Accordion key={k} summary={t(`${k}Q`)} open={i === 0}>
            {t(`${k}A`)}
          </Accordion>
        ))}
      </div>
    </ProsePage>
  );
}
