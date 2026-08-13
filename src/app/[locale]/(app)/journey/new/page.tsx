import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { JourneyForm } from './JourneyForm';

/* F5 · Going there too — destination and time. Nothing is auto-matched;
   this surfaces a possibility, it doesn't make a decision. */
export default async function JourneyNewPage() {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('journey');
  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('newTitle')}</h1>
      <JourneyForm />
    </main>
  );
}
