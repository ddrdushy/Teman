import { and, count, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { request, offer, person, area, match, session } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { publicPerson } from '@/lib/privacy';
import { readUrl } from '@/lib/storage';
import { Sisi } from '@/components/Sisi';
import { Avatar } from '@/components/Avatar';
import { AcceptActions } from './AcceptActions';

/* G8 ★ · Someone answered — the peak of the entire product. Deep teal
   full-bleed, Sisi completes (amber's first appearance in this flow), the
   trust panel: facts and words, no score, no percentage match. One amber CTA.
   Exact address and phone stay hidden until both accept — and it says so. */
export default async function OfferReceivedPage({
  params,
}: {
  params: Promise<{ id: string; oid: string; locale: string }>;
}) {
  const { id, oid } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('offer');

  const r = await db.query.request.findFirst({
    where: and(eq(request.id, id), eq(request.requesterId, personId)),
  });
  if (!r) notFound();
  const o = await db.query.offer.findFirst({
    where: and(eq(offer.id, oid), eq(offer.requestId, id)),
  });
  if (!o) notFound();

  const p = await db.query.person.findFirst({ where: eq(person.id, o.temanId) });
  if (!p) notFound();

  /* moments = completed sessions as the Teman; descriptors arrive with M7 */
  const [moments] = await db.select({ n: count() }).from(session)
    .innerJoin(match, eq(session.matchId, match.id))
    .where(and(eq(match.temanId, p.id), eq(session.state, 'ended')));

  const trust = publicPerson(p, { moments: moments.n, descriptors: [] });
  const a = trust.areaId ? await db.query.area.findFirst({ where: eq(area.id, trust.areaId) }) : null;
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';
  const photoUrl = trust.photoKey ? await readUrl(trust.photoKey) : undefined;
  const firstName = trust.displayName.split(/\s+/)[0];

  const verified = ['identity', 'community', 'enhanced'].includes(trust.verificationTier);
  const memberSince = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .format(trust.memberSince);

  return (
    <main className="on-deep" style={{
      minHeight: 'calc(100dvh - 66px)', background: 'var(--t-900)', color: 'var(--white)',
      padding: 'var(--s-6) var(--s-5)', display: 'grid', gap: 'var(--s-4)',
      alignContent: 'start', maxWidth: '44ch', margin: '0 auto', width: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--s-4)' }}>
        <Sisi state="answered" size={98} tone="dark" />
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.6em', textAlign: 'center', margin: 0, color: 'var(--white)' }}>
        {t('canBeThere', { name: firstName })}
      </h1>
      {o.message && (
        <p style={{ textAlign: 'center', color: 'var(--t-100)', fontStyle: 'italic', margin: 0 }}>
          “{o.message}”
        </p>
      )}

      {/* the trust panel — facts and words, because that is what turns a
          stranger into someone you'd let sit beside your father */}
      <div style={{
        background: 'color-mix(in srgb, var(--white) 7%, transparent)',
        border: '1px solid color-mix(in srgb, var(--white) 16%, transparent)',
        borderRadius: 'var(--r-card)', padding: 'var(--s-4)',
        display: 'grid', gap: '0.5em',
      }}>
        <div style={{ display: 'flex', gap: '0.7em', alignItems: 'center' }}>
          <Avatar name={trust.displayName} photoUrl={photoUrl} />
          {verified && (
            <span style={{
              background: 'var(--a-400)', color: 'var(--n-900)', fontWeight: 700,
              fontSize: '0.78em', padding: '0.35em 0.8em', borderRadius: 'var(--r-pill)',
            }}>
              ✓ {t('verifiedBadge')}
            </span>
          )}
        </div>
        {[
          [t('momentsLabel'), t('momentsValue', { count: trust.temanMoments })],
          [t('memberSinceLabel'), memberSince],
          [t('areaLabel'), areaName],
        ].map(([label, value], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', gap: '1em',
            borderBottom: '1px solid color-mix(in srgb, var(--white) 11%, transparent)',
            paddingBottom: '0.4em', fontSize: '0.95em',
          }}>
            <span style={{ color: 'var(--t-100)' }}>{label}</span>
            <b style={{ textAlign: 'end' }}>{value}</b>
          </div>
        ))}
        {trust.bio && <p style={{ margin: '0.3em 0 0', color: 'var(--t-100)', fontSize: '0.9em' }}>{trust.bio}</p>}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--t-100)', fontSize: '0.85em', margin: 0 }}>
        {t('hiddenUntilAccept')}
      </p>

      <AcceptActions offerId={oid} requestId={id} firstName={firstName} />
    </main>
  );
}
