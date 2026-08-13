'use client';

import { useState, type CSSProperties } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { locales, localeNames, type Locale } from '@/i18n';

const SCALES = [18, 22, 26] as const;

const box: CSSProperties = {
  minHeight: 'var(--tap-primary)',
  width: '100%',
  borderRadius: 'var(--r-btn)',
  border: '1.5px solid var(--n-500)',
  background: 'var(--n-050)',
  color: 'var(--n-900)',
  font: 'inherit',
  padding: '0 var(--s-4)',
};

export function SignInHarness({ personId }: { personId: string | null }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'busy' | 'error'>('idle');

  async function sendCode() {
    setStatus('busy');
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, locale }),
    });
    setStatus(res.ok ? 'idle' : 'error');
    if (res.ok) setSent(true);
  }

  async function confirm() {
    setStatus('busy');
    const res = await signIn('otp', { phone, code, redirect: false });
    if (res?.error) {
      setStatus('error');
      return; /* input is kept — never wipe what they typed */
    }
    setStatus('idle');
    router.refresh();
  }

  async function setScale(scale: number) {
    await fetch('/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textScale: scale }),
    });
    router.refresh();
  }

  async function pickLanguage(l: Locale) {
    await fetch('/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: l }),
    });
  }

  return (
    <main style={{ maxWidth: '44ch', margin: '0 auto', padding: 'var(--s-6) var(--s-5)', display: 'grid', gap: 'var(--s-3)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em' }}>{t('dev.harnessTitle')}</h1>

      {personId ? (
        <>
          <p>{t('dev.signedIn')}</p>
          <button style={box} onClick={() => signOut({ redirect: false }).then(() => router.refresh())}>
            {t('dev.signOut')}
          </button>
        </>
      ) : (
        <>
          <label style={{ display: 'grid', gap: 'var(--s-1)' }}>
            <span>{t('join.phoneTitle')}</span>
            <input
              style={box}
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <button style={{ ...box, background: 'var(--t-900)', color: 'var(--n-050)', border: 0 }} onClick={sendCode}>
            {t('join.sendCode')}
          </button>

          {sent && (
            <>
              <label style={{ display: 'grid', gap: 'var(--s-1)' }}>
                <span>{t('join.otpTitle')}</span>
                <input
                  style={box}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </label>
              <button style={{ ...box, background: 'var(--t-900)', color: 'var(--n-050)', border: 0 }} onClick={confirm}>
                {t('join.confirm')}
              </button>
            </>
          )}
          {status === 'error' && (
            <p style={{ color: 'var(--err-text)' }}>{t('join.otpWrong')}</p>
          )}
        </>
      )}

      <h2 style={{ fontSize: '1em', marginTop: 'var(--s-4)' }}>{t('language.textSize')}</h2>
      <div style={{ display: 'grid', gap: 'var(--tap-gap)' }}>
        {SCALES.map((s) => (
          <button key={s} style={{ ...box, fontSize: `${s}px` }} onClick={() => setScale(s)}>
            {t(s === 18 ? 'language.standard' : s === 22 ? 'language.large' : 'language.extraLarge')}
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: '1em', marginTop: 'var(--s-4)' }}>{t('language.choose')}</h2>
      <div style={{ display: 'grid', gap: 'var(--tap-gap)' }}>
        {locales.map((l) => (
          <Link
            key={l}
            lang={l}
            href={`/${l}/dev/signin`}
            onClick={() => pickLanguage(l)}
            style={{ ...box, display: 'flex', alignItems: 'center', textDecoration: 'none',
              ...(l === locale ? { border: '2.5px solid var(--t-900)', background: 'var(--t-050)' } : {}) }}
          >
            {localeNames[l].own}
          </Link>
        ))}
      </div>
    </main>
  );
}
