'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconHome, IconRequests, IconMessages, IconYou } from '@/components/icons';

/* Icons resolve by name here — a server layout can't pass render functions
   across the client boundary. */
const ICONS = {
  home: IconHome,
  requests: IconRequests,
  messages: IconMessages,
  you: IconYou,
} as const;

export type NavTab = {
  href: string;             // locale-relative, e.g. '/home'
  label: string;            // caller passes t('nav.…')
  icon?: keyof typeof ICONS;
  badge?: number;           // unread count — a count, never a score
};

/** Four flat labelled tabs, always visible. No hamburger — a hidden menu
 *  costs a tap and a comprehension step, both expensive for this audience.
 *  Active state is colour AND the filled icon shape, never colour alone. */
export function NavBar({ tabs, locale }: { tabs: NavTab[]; locale: string }) {
  const pathname = usePathname();
  const t = useTranslations('ui');
  return (
    <nav className="navbar">
      {tabs.map((tab) => {
        const full = `/${locale}${tab.href}`;
        const active = pathname === full || pathname.startsWith(`${full}/`);
        const Icon = tab.icon ? ICONS[tab.icon] : null;
        return (
          <Link
            key={tab.href}
            href={full}
            className={['navbar-tab', active ? 'is-active' : ''].join(' ').trim()}
            aria-current={active ? 'page' : undefined}
          >
            {Icon
              ? <span className="navbar-svg" aria-hidden="true"><Icon active={active} /></span>
              : <span className="navbar-icon" aria-hidden="true" />}
            <span className="navbar-label">{tab.label}</span>
            {tab.badge ? (
              <span className="navbar-badge" aria-label={t('unread', { count: tab.badge })}>
                {tab.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
