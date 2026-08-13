'use client';

import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/Button';

/* Sign out preserves language and text size on the device (A-05) — the
   cookie fallback holds them until the next sign-in. */
export function SignOutRow() {
  const t = useTranslations('you');
  const locale = useLocale();
  return (
    <Button
      variant="line"
      size="md"
      onClick={() => signOut({ callbackUrl: `/${locale}` })}
    >
      {t('signOut')}
    </Button>
  );
}
