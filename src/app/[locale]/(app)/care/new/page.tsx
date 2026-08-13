import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { RecipientForm } from '../RecipientForm';

/* C7 · Add a person you care for. */
export default async function CareNewPage() {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('care');
  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('addTitle')}</h1>
      <RecipientForm />
    </main>
  );
}
