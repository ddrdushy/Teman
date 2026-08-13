'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Banner } from '@/components/Banner';
import { Sheet } from '@/components/Sheet';
import { Switch } from '@/components/Switch';
import { Sisi } from '@/components/Sisi';
import { TickDraw } from '@/components/TickDraw';

type Props = {
  sessionId: string;
  state: string;
  startedAt: string | null;
  startedByMe: boolean;
  startWaiting: boolean;
  endedByMe: boolean;
  endWaiting: boolean;
  liveLocation: boolean;
  isRequester: boolean;
  otherName: string;
  requestTitle: string;
  startsAt: string;
  trustedContacts: { id: string; name: string }[];
};

export function SessionView(p: Props) {
  const t = useTranslations('session');
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [, tick] = useState(0);

  /* the session moves when the OTHER person acts — poll while undecided */
  useEffect(() => {
    if (p.state === 'ended') return;
    const id = setInterval(() => { router.refresh(); tick((x) => x + 1); }, 6000);
    return () => clearInterval(id);
  }, [p.state, router]);

  async function act(action: string, extra?: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/sessions/${p.sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    setBusy(false);
    router.refresh();
  }

  const elapsed = p.startedAt
    ? format.dateTime(new Date(p.startedAt), { hour: 'numeric', minute: '2-digit' })
    : null;

  /* ── I8 done ── */
  if (p.state === 'ended') {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--s-6)' }}>
          <Sisi state="moment" size={98} />
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('endedTitle')}</h1>
        <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('endedBody')}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}><TickDraw /></div>
        <Link href={`/${locale}/sessions/${p.sessionId}/feedback`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          {t('feedbackCta')}
        </Link>
        <Link href={`/${locale}/home`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
          {t('backHome')}
        </Link>
      </main>
    );
  }

  /* ── I1/I2/I3 before it starts ── */
  if (p.state === 'scheduled') {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
          {t('checklistTitle', { name: p.otherName })}
        </h1>
        <Card title={p.requestTitle}
          meta={format.dateTime(new Date(p.startsAt), { weekday: 'long', hour: 'numeric', minute: '2-digit' })} />
        <Card>
          <p className="label" style={{ color: 'var(--n-700)', margin: '0 0 0.5em' }}>{t('beforeStart')}</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.4em' }}>
            <li>{p.trustedContacts.length > 0 ? '✓' : '○'} {p.trustedContacts.length > 0
              ? t('contactTold', { name: p.trustedContacts.map((c) => c.name).join(', ') })
              : t('noContactYet')}</li>
            <li>✓ {t('updatesPromise')}</li>
          </ul>
          {p.trustedContacts.length === 0 && (
            <Link href={`/${locale}/trusted-contacts`} className="btn btn-line" style={{ marginTop: '0.6em', textDecoration: 'none', minHeight: 'var(--tap-min)' }}>
              {t('addContactCta')}
            </Link>
          )}
        </Card>
        {!p.isRequester && (
          <Button variant="ghost" loading={busy} onClick={() => act('arrived')}>{t('arrivedCta')}</Button>
        )}
        {p.startWaiting && !p.startedByMe && (
          <Banner variant="info">{t('otherStarted', { name: p.otherName })}</Banner>
        )}
        {p.startedByMe ? (
          <Banner variant="info">{t('waitingForOther', { name: p.otherName })}</Banner>
        ) : (
          <>
            <Banner variant="info">{t('startExplain')}</Banner>
            <Button loading={busy} onClick={() => act('start')}>{t('startCta')}</Button>
          </>
        )}
      </main>
    );
  }

  /* ── I4 live ── */
  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--s-3)' }}>
        <Sisi state="together" size={80} />
      </div>
      <p className="label" style={{ color: 'var(--n-700)', textAlign: 'center', margin: 0 }}>{t('togetherSince')}</p>
      <p style={{ fontFamily: 'var(--serif)', fontSize: '2.1em', fontWeight: 600, textAlign: 'center', margin: 0, color: 'var(--t-900)' }}>
        {elapsed}
      </p>
      <p style={{ color: 'var(--n-700)', textAlign: 'center', margin: 0 }}>{p.requestTitle}</p>

      <Card>
        <p className="label" style={{ color: 'var(--n-700)', margin: '0 0 0.5em' }}>{t('whoTold')}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.4em' }}>
          <li>✓ {t('youTold')}</li>
          {p.trustedContacts.map((c) => <li key={c.id}>✓ {c.name}</li>)}
        </ul>
      </Card>

      {/* I5 · foreground-only, stated plainly — a PWA cannot track in the
          background, and implying otherwise would be a lie about safety */}
      <Switch
        title={t('liveLocation')}
        sub={t('liveLocationSub')}
        checked={p.liveLocation}
        onChange={(v) => act('location', { enabled: v })}
      />

      <Link href={`/${locale}/messages`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
        {t('messageCta', { name: p.otherName })}
      </Link>
      {p.endedByMe ? (
        <Banner variant="info">{t('endWaiting', { name: p.otherName })}</Banner>
      ) : (
        <Button variant="ghost" loading={busy} onClick={() => act('end')}>{t('endCta')}</Button>
      )}

      {/* Safety help: its own red, 20px clear of everything else,
          never mistaken for a normal action */}
      <div style={{ marginTop: '20px' }}>
        <Button variant="danger" onClick={() => setSafetyOpen(true)}>{t('safetyCta')}</Button>
      </div>
      <p className="field-hint" style={{ margin: 0, textAlign: 'center' }}>{t('notEmergency')}</p>

      {/* I6 · the safety sheet — 999 first and unambiguous */}
      <Sheet title={t('safetyCta')} open={safetyOpen} onClose={() => setSafetyOpen(false)}>
        <p className="field-hint" style={{ margin: '0 0 var(--s-3)' }}>{t('safetyPrivate', { name: p.otherName })}</p>
        <div className="stack">
          <a href="tel:999" className="btn btn-lg" style={{
            background: 'var(--err-strong)', color: 'var(--white)', textDecoration: 'none', fontWeight: 700,
          }}>
            {t('call999')}
          </a>
          <Button variant="ghost" loading={busy} disabled={p.trustedContacts.length === 0}
            onClick={async () => { await act('alert-trusted'); setAlertSent(true); }}>
            {t('alertTrusted')}
          </Button>
          {alertSent && <Banner variant="success">{t('alertSent')}</Banner>}
          <Link href={`/${locale}/report?session=${p.sessionId}`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
            {t('reportCta')}
          </Link>
        </div>
      </Sheet>
    </main>
  );
}
