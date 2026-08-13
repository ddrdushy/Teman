import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { NewCircleForm } from './NewCircleForm';

/* K9 · Create a circle — needs admin approval before it appears (N17). */
export default async function NewCirclePage() {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('community');
  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('createCircle')}</h1>
      <NewCircleForm />
    </main>
  );
}
