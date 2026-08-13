'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';

type Msg = { id: string; mine: boolean; body: string; at: string };

/* H5/H6 · Bubbles at reading size, quick-reply chips for the phrases people
   actually need — every one an i18n key, inserted in the sender's language.
   (A shared-language phrasebook is a later refinement.) */
const QUICK = ['onMyWay', 'imHere', 'runningLate', 'whereExactly'] as const;

export function Conversation({ requestId, otherName, requestTitle }: {
  requestId: string;
  otherName: string;
  requestTitle: string;
}) {
  const t = useTranslations('coord');
  const format = useFormatter();
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/messages?requestId=${requestId}`);
    if (res.ok) setMessages((await res.json()).messages);
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length]);

  async function send(text: string) {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    setFailed(false);
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, body }),
    });
    setBusy(false);
    if (res.ok) { setDraft(''); await load(); }
    else setFailed(true); /* the draft is kept */
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 66px)', maxWidth: '44ch', margin: '0 auto', width: '100%' }}>
      <header style={{ padding: 'var(--s-4) var(--s-5) var(--s-2)', borderBottom: '1px solid var(--n-200)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.2em', margin: 0 }}>{otherName}</h1>
        <p className="card-meta" style={{ margin: 0 }}>{requestTitle}</p>
      </header>

      <div style={{ flex: 1, padding: 'var(--s-3) var(--s-5)', display: 'grid', gap: 'var(--s-2)', alignContent: 'start' }}>
        {messages === null ? (
          <Skeleton lines={3} />
        ) : messages.length === 0 ? (
          <p style={{ color: 'var(--n-700)', textAlign: 'center', margin: 'var(--s-6) 0' }}>
            {t('threadStart', { name: otherName })}
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{
              justifySelf: m.mine ? 'end' : 'start',
              maxWidth: '85%',
              background: m.mine ? 'var(--t-900)' : 'var(--white)',
              color: m.mine ? 'var(--white)' : 'var(--n-900)',
              border: m.mine ? 'none' : '1px solid var(--n-500)',
              borderRadius: 'var(--r-card)',
              padding: '0.5em 0.8em',
              lineHeight: 1.45,
            }}>
              {m.body}
              <div style={{ fontSize: '0.7em', opacity: 0.75, marginTop: '0.2em' }}>
                {format.dateTime(new Date(m.at), { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: 'var(--s-2) var(--s-5) var(--s-4)', borderTop: '1px solid var(--n-200)', display: 'grid', gap: 'var(--s-2)' }}>
        <div className="chips">
          {QUICK.map((q) => (
            <button key={q} type="button" className="chip" onClick={() => send(t(`quick.${q}`))}>
              {t(`quick.${q}`)}
            </button>
          ))}
        </div>
        {failed && <p style={{ color: 'var(--err-text)', margin: 0, fontSize: '0.9em' }}>{t('sendFailed')}</p>}
        <div style={{ display: 'flex', gap: 'var(--tap-gap)', alignItems: 'flex-end' }}>
          <textarea
            className="input"
            aria-label={t('writeLabel')}
            rows={2}
            style={{ flex: 1, minWidth: 0, resize: 'none' }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button size="md" style={{ width: 'auto' }} loading={busy} onClick={() => send(draft)}>
            {t('sendCta')}
          </Button>
        </div>
      </div>
    </main>
  );
}
