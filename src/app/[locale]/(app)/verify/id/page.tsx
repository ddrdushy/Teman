import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { CaptureFlow } from './CaptureFlow';

/* D3 + D4 · ID capture then selfie, one client flow (file handles cannot
   survive a navigation, so the two screens share a route). Camera AND
   gallery, equally weighted. No quality gate — a human reviews. */
export default async function VerifyIdPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);

  const latest = await db.query.verification.findFirst({
    where: eq(verification.personId, personId),
    orderBy: desc(verification.createdAt),
  });
  if (latest?.state === 'pending') redirect(`/${locale}/verify/pending`);

  return <CaptureFlow />;
}
