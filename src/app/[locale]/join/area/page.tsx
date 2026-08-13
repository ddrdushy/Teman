import { redirect } from 'next/navigation';
import { personIdFromSession } from '@/auth';
import { AreaStep } from './AreaStep';

/* A6 · Where you're based. A searchable picker, never a map pin. */
export default async function JoinAreaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}/join/phone`);
  return <AreaStep />;
}
