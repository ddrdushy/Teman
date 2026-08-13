/**
 * Auth.js v5, phone-OTP as the only sign-in method (email is recovery, never
 * login — A-03). JWT sessions, 90 days: that IS the A-04 "device remembered"
 * behaviour. No separate device table.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { consumeChallenge } from '@/lib/auth-otp';

const DEVICE_TRUST_SECONDS = 90 * 24 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: DEVICE_TRUST_SECONDS },
  providers: [
    Credentials({
      id: 'otp',
      credentials: { phone: {}, code: {} },
      async authorize(credentials) {
        const phone = typeof credentials?.phone === 'string' ? credentials.phone : '';
        const code = typeof credentials?.code === 'string' ? credentials.code : '';
        if (!phone || !code) return null;
        const p = await consumeChallenge(phone, code);
        if (!p) return null;
        return { id: p.id, name: p.displayName };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.personId = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.personId) {
        (session as typeof session & { personId?: string }).personId =
          token.personId as string;
      }
      return session;
    },
  },
});

/** The session shape the app uses. */
export type AppSession = { personId?: string } | null;

export async function personIdFromSession(): Promise<string | null> {
  const session = (await auth()) as AppSession;
  return session?.personId ?? null;
}
