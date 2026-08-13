import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { EmptyState } from '@/components/EmptyState';

/* Placeholder until G8 builds D1–D6. */
export default async function VerifyPage() {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('placeholder');
  return (
    <main className="screen-pad">
      <EmptyState illustration="waiting" title={t('title')} body={t('body')} />
    </main>
  );
}
