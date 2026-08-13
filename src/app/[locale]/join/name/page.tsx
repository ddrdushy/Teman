import { redirect } from 'next/navigation';
import { personIdFromSession } from '@/auth';
import { personForJoin } from '@/lib/join';
import { NameStep } from './NameStep';

/* A5 · The name others see. Pre-filled when returning — back never destroys input. */
export default async function JoinNamePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}/join/phone`);
  const p = await personForJoin(personId);
  return <NameStep initialName={p?.displayName ?? ''} />;
}
