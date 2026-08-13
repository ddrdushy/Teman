'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TextField } from '@/components/TextField';
import { Chips } from '@/components/Chips';
import { Button } from '@/components/Button';

const LANG_OPTIONS = ['ms', 'en', 'ta', 'zh-mandarin', 'zh-cantonese', 'hokkien', 'other'];
const TRANSPORT_OPTIONS = ['car', 'canDrive', 'publicTransport', 'accompanyYours', 'meetThere'];

type Cat = { id: string; group: string; name: string };

export function ProfileEditor(props: {
  bio: string;
  languages: string[];
  categories: string[];
  transport: string[];
  allCategories: Cat[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [bio, setBio] = useState(props.bio);
  const [languages, setLanguages] = useState(props.languages);
  const [categories, setCategories] = useState(props.categories);
  const [transport, setTransport] = useState(props.transport);
  const [saved, setSaved] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const bioTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function save(patch: Record<string, unknown>) {
    const res = await fetch('/api/me/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  }

  function onBio(v: string) {
    setBio(v);
    clearTimeout(bioTimer.current);
    bioTimer.current = setTimeout(() => save({ bio: v }), 800); /* autosave */
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    const form = new FormData();
    form.set('photo', file);
    const res = await fetch('/api/me/profile', { method: 'POST', body: form });
    if (res.ok) { setSaved(true); router.refresh(); }
  }

  const groups = useMemo(() => {
    const g = new Map<string, Cat[]>();
    for (const c of props.allCategories) {
      g.set(c.group, [...(g.get(c.group) ?? []), c]);
    }
    return [...g.entries()];
  }, [props.allCategories]);

  return (
    <div style={{ display: 'grid', gap: 'var(--s-5)' }}>
      {saved && (
        <p role="status" style={{ margin: 0, color: 'var(--ok-text)', fontWeight: 600 }}>
          ✓ {t('ui.saved')}
        </p>
      )}

      <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('profile.photoSection')}</h2>
        <p className="field-hint" style={{ margin: 0 }}>{t('profile.photoWhy')}</p>
        <input ref={photoRef} type="file" accept="image/*" hidden
          onChange={(e) => onPhoto(e.target.files?.[0] ?? null)} />
        <Button variant="ghost" size="md" onClick={() => photoRef.current?.click()}>
          {t('profile.choosePhoto')}
        </Button>
      </section>

      <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
        <TextField
          label={t('profile.bioLabel')}
          hint={t('profile.bioHint')}
          optional
          multiline
          value={bio}
          onChange={(e) => onBio((e.target as HTMLTextAreaElement).value)}
        />
      </section>

      <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('profile.langSection')}</h2>
        <Chips
          label={t('profile.langSection')}
          options={LANG_OPTIONS.map((l) => ({ value: l, label: t(`profile.lang.${l}` as never) }))}
          selected={languages}
          onChange={(next) => { setLanguages(next); save({ languages: next }); }}
        />
      </section>

      <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('profile.catSection')}</h2>
        {groups.map(([group, cats]) => (
          <div key={group} style={{ display: 'grid', gap: 'var(--s-1)' }}>
            <p className="field-hint" style={{ margin: 0 }}>{t(`profile.group.${group}` as never)}</p>
            <Chips
              label={t(`profile.group.${group}` as never)}
              options={cats.map((c) => ({ value: c.id, label: c.name }))}
              selected={categories}
              onChange={(next) => { setCategories(next); save({ categories: next }); }}
            />
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
        <h2 className="label" style={{ margin: 0, color: 'var(--n-700)' }}>{t('profile.transportSection')}</h2>
        <Chips
          label={t('profile.transportSection')}
          options={TRANSPORT_OPTIONS.map((o) => ({ value: o, label: t(`profile.transport.${o}` as never) }))}
          selected={transport}
          onChange={(next) => { setTransport(next); save({ transport: next }); }}
        />
      </section>
    </div>
  );
}
