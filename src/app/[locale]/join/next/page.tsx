import { redirect } from 'next/navigation';
import { personIdFromSession } from '@/auth';
import { personForJoin, nextJoinPath } from '@/lib/join';

/* Lands here after OTP success (and any resume). Sends the account to its
   first incomplete step — this is what makes a force-quit lose nothing. */
export default async function JoinNextPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}/join/phone`);
  const p = await personForJoin(personId);
  if (!p) redirect(`/${locale}/join/phone`);
  redirect(`/${locale}${nextJoinPath(p)}`);
}
