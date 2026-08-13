import { redirect } from 'next/navigation';
import { personIdFromSession } from '@/auth';
import { PhoneStep } from './PhoneStep';

/* A3 · Collect the number. Signed-in accounts skip ahead — the same OTP flow
   is sign-up and sign-in, so "already registered" is a resume, not an error. */
export default async function JoinPhonePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (await personIdFromSession()) redirect(`/${locale}/join/next`);
  return <PhoneStep />;
}
