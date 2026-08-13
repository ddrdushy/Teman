import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { NavBar } from '@/components/NavBar';

/* The authenticated shell: four flat labelled tabs, always visible, no
   hamburger. Everything inside requires a session. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('nav');

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>{children}</div>
      <NavBar
        locale={locale}
        tabs={[
          { href: '/home', label: t('home') },
          { href: '/requests', label: t('requests') },
          { href: '/messages', label: t('messages') },
          { href: '/you', label: t('you') },
        ]}
      />
    </div>
  );
}
