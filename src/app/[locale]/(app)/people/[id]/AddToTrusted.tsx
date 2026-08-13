'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Sheet } from '@/components/Sheet';
import { Banner } from '@/components/Banner';

/* K2 · Add to trusted — and pick who it's for ("for me" / "for Mum"). */
export function AddToTrusted({ temanId, recipients }: {
  temanId: string;
  recipients: { id: string; name: string }[];
}) {
  const t = useTranslations('community');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  async function add(forRecipientId: string | null) {
    await fetch('/api/trusted-temans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temanId, forRecipientId }),
    });
    setOpen(false);
    setDone(true);
    router.refresh();
  }

  if (done) return <Banner variant="success">{t('trustedAdded')}</Banner>;

  return (
    <>
      <Button variant="ghost" onClick={() => (recipients.length ? setOpen(true) : add(null))}>
        {t('addToTrusted')}
      </Button>
      <Sheet title={t('trustedForWhom')} open={open} onClose={() => setOpen(false)}>
        <div className="stack">
          <Button variant="ghost" size="md" onClick={() => add(null)}>{t('forMyself')}</Button>
          {recipients.map((r) => (
            <Button key={r.id} variant="ghost" size="md" onClick={() => add(r.id)}>
              {t('trustedFor', { name: r.name })}
            </Button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
