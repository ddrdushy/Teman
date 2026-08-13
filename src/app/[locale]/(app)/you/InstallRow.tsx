'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/* A-visible way to install the PWA. Chromium hands us beforeinstallprompt;
   iOS never fires it, so Safari gets a plain instruction instead. Renders
   nothing once the app already runs standalone. */
export function InstallRow() {
  const t = useTranslations('pwa');
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = 'standalone' in navigator && (navigator as { standalone?: boolean }).standalone;
    setIos(isIos && !standalone);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (prompt) {
    return (
      <Button
        variant="line"
        size="md"
        onClick={async () => {
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === 'accepted') setPrompt(null);
        }}
      >
        {t('install')}
      </Button>
    );
  }
  if (ios) {
    return (
      <p className="card-meta" style={{ margin: 0, padding: 'var(--s-2) 0' }}>
        {t('iosHint')}
      </p>
    );
  }
  return null;
}
