'use client';

import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { RadioCards } from '@/components/RadioCards';
import { Stepper } from '@/components/Stepper';
import { Banner } from '@/components/Banner';

type DocType = 'mykad' | 'passport';

export function CaptureFlow() {
  const t = useTranslations('verify');
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [docType, setDocType] = useState<DocType | null>(null);
  const [docNumber, setDocNumber] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!docType || !docNumber.trim() || !docFile || !selfieFile) return;
    setBusy(true);
    setFailed(false);
    const form = new FormData();
    form.set('docType', docType);
    form.set('docNumber', docNumber);
    form.set('doc', docFile);
    form.set('selfie', selfieFile);
    const res = await fetch('/api/verification/submit', { method: 'POST', body: form });
    setBusy(false);
    if (res.ok) router.push(`/${locale}/verify/pending`);
    else setFailed(true); /* everything entered is kept */
  }

  if (step === 1) {
    return (
      <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <Stepper current={1} total={2} />
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('idTitle')}</h1>
        <RadioCards
          value={docType}
          onChange={(v) => setDocType(v)}
          options={[
            { value: 'mykad', label: t('docMykad') },
            { value: 'passport', label: t('docPassport'), description: t('docPassportSub') },
          ]}
        />
        <TextField
          label={t('docNumberLabel')}
          hint={t('docNumberHint')}
          inputMode="numeric"
          value={docNumber}
          onChange={(e) => setDocNumber((e.target as HTMLInputElement).value)}
        />

        {/* frame guidance in words — all four corners, no glare */}
        <Banner variant="info">{t('idGuide')}</Banner>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
        <input ref={galleryRef} type="file" accept="image/*" hidden
          onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
        <div className="stack">
          <Button variant={docFile ? 'ghost' : 'primary'} onClick={() => cameraRef.current?.click()}>
            {t('takePhoto')}
          </Button>
          <Button variant={docFile ? 'ghost' : 'primary'} onClick={() => galleryRef.current?.click()}>
            {t('fromGallery')}
          </Button>
        </div>
        {docFile && <Banner variant="success">{t('photoAttached', { name: docFile.name })}</Banner>}
        <p className="field-hint" style={{ margin: 0 }}>{t('idPromise')}</p>
        <Button disabled={!docType || !docNumber.trim() || !docFile} onClick={() => setStep(2)}>
          {t('toSelfie')}
        </Button>
      </main>
    );
  }

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <Stepper current={2} total={2} />
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('selfieTitle')}</h1>
      {/* explains why BEFORE the camera opens */}
      <p style={{ margin: 0 }}>{t('selfieWhy')}</p>
      <input ref={selfieRef} type="file" accept="image/*" capture="user" hidden
        onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)} />
      <Button variant={selfieFile ? 'ghost' : 'primary'} onClick={() => selfieRef.current?.click()}>
        {t('takeSelfie')}
      </Button>
      {selfieFile && <Banner variant="success">{t('photoAttached', { name: selfieFile.name })}</Banner>}
      {failed && <Banner variant="error">{t('submitFailed')}</Banner>}
      <Button loading={busy} disabled={!selfieFile} onClick={submit}>{t('submitCta')}</Button>
      <Button variant="ghost" size="md" onClick={() => setStep(1)}>{t('backToId')}</Button>
    </main>
  );
}
