'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Stepper } from '@/components/Stepper';
import { Banner } from '@/components/Banner';

export function PhoneStep() {
  const t = useTranslations('join');
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'invalid' | 'rate' | null>(null);
  const [retryMinutes, setRetryMinutes] = useState(0);

  async function send() {
    setBusy(true);
    setError(null);
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, locale }),
    });
    setBusy(false);
    if (res.ok) {
      sessionStorage.setItem('join-phone', phone);
      router.push(`/${locale}/join/otp`);
      return;
    }
    const body = await res.json().catch(() => ({}));
    if (res.status === 429) {
      setRetryMinutes(Math.max(1, Math.ceil((body.retryAfterMs ?? 60000) / 60000)));
      setError('rate');
    } else {
      setError('invalid'); /* the input is kept — never wiped */
    }
  }

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <Stepper current={1} total={4} />
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('phoneTitle')}</h1>
      {/* +60 visible, not hidden — the audience should see what will be dialled */}
      <div style={{ display: 'flex', gap: 'var(--tap-gap)', alignItems: 'flex-end' }}>
        <span className="input" style={{ flex: '0 0 auto', width: 'auto', display: 'flex', alignItems: 'center' }} aria-hidden="true">
          +60
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextField
            label={t('phoneTitle')}
            hint={t('phoneHint')}
            inputMode="tel"
            autoComplete="tel-national"
            value={phone}
            onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
            error={error === 'invalid' ? t('phoneInvalid') : undefined}
          />
        </div>
      </div>
      {error === 'rate' && (
        <Banner variant="warning">{t('rateLimited', { minutes: retryMinutes })}</Banner>
      )}
      <Button loading={busy} onClick={send}>{t('sendCode')}</Button>
    </main>
  );
}
