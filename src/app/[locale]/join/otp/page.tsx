import { redirect } from 'next/navigation';
import { personIdFromSession } from '@/auth';
import { OtpStep } from './OtpStep';

/* A4 · Verify the code. Wrong keeps the input; expired offers resend with the
   cooldown stated; rate-limited states the wait in minutes. */
export default async function JoinOtpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (await personIdFromSession()) redirect(`/${locale}/join/next`);
  return <OtpStep />;
}
