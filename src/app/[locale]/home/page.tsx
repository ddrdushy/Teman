import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';

/* Placeholder until G7 builds B1/B2. Honest about being unfinished — never a
   fake-empty product screen. */
export default async function HomePage() {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('placeholder');
  return (
    <main className="screen-pad">
      <EmptyState illustration="waiting" title={t('title')} body={t('body')} />
    </main>
  );
}
