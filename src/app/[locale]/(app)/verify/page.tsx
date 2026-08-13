import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, verification } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Pill } from '@/components/Pill';

/* D1 · The ladder. Four rungs drawn vertically — the metaphor is progression.
   Each locked rung states what it unlocks, because "get verified" is not a
   reason and "verified Temans can accept hospital requests" is. */
export default async function VerifyLadderPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('verify');

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p) redirect(`/${locale}`);
  const latest = await db.query.verification.findFirst({
    where: eq(verification.personId, personId),
    orderBy: desc(verification.createdAt),
  });

  const identityDone = ['identity', 'community', 'enhanced'].includes(p.verificationTier);
  const identityPending = !identityDone && latest?.state === 'pending';
  const identityRejected = !identityDone && !identityPending && latest?.state === 'rejected';

  const rungs = [
    { key: 'basic', done: true, current: false, locked: false },
    { key: 'identity', done: identityDone, current: !identityDone, locked: false },
    { key: 'community', done: ['community', 'enhanced'].includes(p.verificationTier), current: false, locked: true },
    { key: 'enhanced', done: p.verificationTier === 'enhanced', current: false, locked: true },
  ] as const;

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('ladderTitle')}</h1>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 0 }}>
        {rungs.map((r, i) => (
          <li
            key={r.key}
            style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--s-3)',
              paddingBottom: i < rungs.length - 1 ? 'var(--s-4)' : 0,
              position: 'relative',
            }}
          >
            {/* the rail that makes it a ladder, not four cards */}
            {i < rungs.length - 1 && (
              <span aria-hidden="true" style={{
                position: 'absolute', insetInlineStart: '15px', top: '34px', bottom: 0,
                width: '2.5px', background: 'var(--n-200)',
              }} />
            )}
            <span aria-hidden="true" style={{
              width: '32px', height: '32px', borderRadius: '50%', zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.85em',
              background: r.done ? 'var(--t-900)' : 'var(--white)',
              color: r.done ? 'var(--white)' : r.locked ? 'var(--n-500)' : 'var(--t-900)',
              border: r.done ? 'none' : `2.5px solid ${r.current ? 'var(--t-900)' : 'var(--n-500)'}`,
            }}>
              {r.done ? '✓' : i + 1}
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{t(`tier.${r.key === 'basic' ? 'basic' : r.key}`)}</p>
              <p className="card-meta" style={{ margin: '0.1em 0 0' }}>{t(`unlocks.${r.key}`)}</p>
              {r.key === 'identity' && identityPending && (
                <p style={{ margin: '0.4em 0 0' }}><Pill variant="looking">{t('pendingPill')}</Pill></p>
              )}
              {r.key === 'identity' && identityRejected && (
                <p style={{ margin: '0.4em 0 0' }}><Pill variant="error">{t('rejectedPill')}</Pill></p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {identityPending ? (
        <Link href={`/${locale}/verify/pending`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
          {t('seePending')}
        </Link>
      ) : identityRejected ? (
        <Link href={`/${locale}/verify/rejected`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          {t('seeRejected')}
        </Link>
      ) : !identityDone ? (
        <Link href={`/${locale}/verify/why`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          {t('startCta')}
        </Link>
      ) : null}
    </main>
  );
}
