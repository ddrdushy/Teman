'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { ListRow } from '@/components/ListRow';
import { EmptyState } from '@/components/EmptyState';
import { Toast } from '@/components/Toast';

type Contact = { id: string; name: string; relationship: string | null };

export function ContactManager({ contacts }: { contacts: Contact[] }) {
  const t = useTranslations('safety');
  const router = useRouter();
  const [adding, setAdding] = useState(contacts.length === 0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [removedName, setRemovedName] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setInvalid(false);
    const res = await fetch('/api/trusted-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, relationship }),
    });
    setBusy(false);
    if (res.ok) {
      setName(''); setPhone(''); setRelationship(''); setAdding(false);
      router.refresh();
    } else setInvalid(true);
  }

  async function remove(c: Contact) {
    await fetch(`/api/trusted-contacts?id=${c.id}`, { method: 'DELETE' });
    setRemovedName(c.name);
    router.refresh();
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
      {contacts.length === 0 && !adding && (
        <EmptyState illustration="none" title={t('contactsEmptyTitle')} body={t('contactsEmptyBody')} />
      )}
      {contacts.length > 0 && (
        <div className="stack">
          {contacts.map((c) => (
            <div key={c.id} style={{ display: 'grid', gap: 'var(--s-1)' }}>
              <ListRow icon={c.name.charAt(0)} title={c.name} sub={c.relationship ?? undefined} onClick={() => {}} />
              <Button variant="line" size="md" onClick={() => remove(c)}>
                {t('removeContact', { name: c.name })}
              </Button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
          <TextField label={t('contactName')} value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)} />
          <TextField label={t('contactPhone')} hint={t('contactPhoneHint')} inputMode="tel"
            error={invalid ? t('contactInvalid') : undefined} value={phone}
            onChange={(e) => { setPhone((e.target as HTMLInputElement).value); setInvalid(false); }} />
          <TextField label={t('contactRel')} optional value={relationship}
            onChange={(e) => setRelationship((e.target as HTMLInputElement).value)} />
          <Button loading={busy} disabled={!name.trim() || !phone.trim()} onClick={add}>
            {t('saveContact')}
          </Button>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setAdding(true)}>{t('addContact')}</Button>
      )}

      {removedName && (
        <Toast message={t('contactRemoved', { name: removedName })} onDismiss={() => setRemovedName(null)} />
      )}
    </div>
  );
}
