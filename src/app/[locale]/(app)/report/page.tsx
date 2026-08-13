import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { ReportForm } from './ReportForm';

/* I11/I12 · Report — the §36 categories, then what happens next, honestly. */
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; about?: string }>;
}) {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const sp = await searchParams;
  return <ReportForm sessionId={sp.session ?? null} subjectPersonId={sp.about ?? null} />;
}
