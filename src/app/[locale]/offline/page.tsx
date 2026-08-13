import { getTranslations } from 'next-intl/server';
import { Sisi } from '@/components/Sisi';

/* The offline fallback the service worker precaches — M-07's honest face.
   No auth (it must render for anyone), no data, nothing to go stale. */
export default async function OfflinePage() {
  const t = await getTranslations('pwa');
  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)', textAlign: 'center', alignContent: 'center', minHeight: '80dvh' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Sisi state="waiting" size={76} />
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.4em', margin: 0 }}>{t('offlineTitle')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0, maxWidth: '34ch', justifySelf: 'center' }}>{t('offlineBody')}</p>
    </main>
  );
}
