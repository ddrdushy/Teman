import { getTranslations } from 'next-intl/server';
import { EmptyState } from '@/components/EmptyState';

/* Honest placeholder — replaced by its module's goal. */
export default async function PlaceholderPage() {
  const t = await getTranslations('placeholder');
  return (
    <main className="screen-pad">
      <EmptyState illustration="waiting" title={t('title')} body={t('body')} />
    </main>
  );
}
