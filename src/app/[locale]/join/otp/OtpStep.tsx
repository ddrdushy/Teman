'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Stepper } from '@/components/Stepper';
import { Banner } from '@/components/Banner';

export function OtpStep() {
  const t = useTranslations('join');
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    const p = sessionStorage.getItem('join-phone');
    if (!p) router.replace(`/${locale}/join/phone`);
    else setPhone(p);
  }, [locale, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function confirm() {
    if (!phone) return;
    setBusy(true);
    const res = await signIn('otp', { phone, code, redirect: false });
    setBusy(false);
    if (res?.error) {
      setWrong(true); /* input preserved — they can fix one digit */
      return;
    }
    sessionStorage.removeItem('join-phone');
    router.push(`/${locale}/join/next`);
    router.refresh();
  }

  async function resend() {
    if (!phone) return;
    setCooldown(30);
    setWrong(false);
    await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, locale }),
    });
  }

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <Stepper current={2} total={4} />
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('otpTitle')}</h1>
      {phone && <Banner variant="info">{t('smsSent', { phone })}</Banner>}
      <TextField
        label={t('otpTitle')}
        hint={t('otpHint')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        style={{ letterSpacing: '0.35em', fontSize: '1.3em', textAlign: 'center' }}
        value={code}
        onChange={(e) => { setCode((e.target as HTMLInputElement).value); setWrong(false); }}
        error={wrong ? t('otpWrong') : undefined}
      />
      <Button loading={busy} onClick={confirm} disabled={code.length !== 6}>{t('confirm')}</Button>
      {cooldown > 0
        ? <p style={{ color: 'var(--n-700)', textAlign: 'center' }}>{t('resendIn', { seconds: cooldown })}</p>
        : <Button variant="ghost" size="md" onClick={resend}>{t('resend')}</Button>}
    </main>
  );
}
