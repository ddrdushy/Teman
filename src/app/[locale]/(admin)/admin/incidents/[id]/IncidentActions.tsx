'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

/* N11 · no action / warn / restrict / suspend / reinstate — every action
   needs a typed reason and lands in audit_log. */
export function IncidentActions({ reportId, subjectSuspended }: {
  reportId: string;
  subjectSuspended: boolean;
}) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function act(action: string) {
    setBusy(action);
    await fetch(`/api/admin/incidents/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    setBusy(null);
    router.push(`/${locale}/admin/incidents`);
    router.refresh();
  }

  const actions = subjectSuspended
    ? ['dismiss', 'warn', 'keepRestricted', 'reinstate']
    : ['dismiss', 'warn', 'restrict'];

  return (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
      <TextField label={t('inc.reasonLabel')} value={reason}
        onChange={(e) => setReason((e.target as HTMLInputElement).value)} />
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {actions.map((a) => (
          <Button key={a} size="md" style={{ width: 'auto', flex: '1 1 40%' }}
            variant={a === 'dismiss' ? 'ghost' : a === 'reinstate' ? 'primary' : 'line'}
            loading={busy === a} disabled={!reason.trim()}
            onClick={() => act(a)}>
            {t(`inc.action.${a}` as never)}
          </Button>
        ))}
      </div>
    </div>
  );
}
