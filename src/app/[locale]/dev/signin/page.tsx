import { auth } from '@/auth';
import type { AppSession } from '@/auth';
import { SignInHarness } from './SignInHarness';

/* Dev harness, not a product screen — the real join flow (A1–A7) lands in G6
   after the primitives exist. This page proves the G1 done-when: sign in by
   phone, switch language and text size, choices survive reload and
   sign-out/sign-in. Kept in the repo like /dev/components. */
export default async function DevSignInPage() {
  const session = (await auth()) as AppSession;
  return <SignInHarness personId={session?.personId ?? null} />;
}
