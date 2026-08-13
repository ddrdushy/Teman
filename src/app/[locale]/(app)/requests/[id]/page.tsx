import Link from 'next/link';
import { and, asc, eq, count } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { request, offer, person, match, session, careRecipient } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Sisi } from '@/components/Sisi';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { Banner } from '@/components/Banner';
import { Avatar } from '@/components/Avatar';

/* E14 · Request detail, owner view — status-driven; it changes shape per
   state. Looking shows the honest promise + offers received (G7); matched
   hands over to the coordination screens; expired is the honest failure
   with real alternatives. */
export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('req');
  const format = await getFormatter();

  const r = await db.query.request.findFirst({
    where: and(eq(request.id, id), eq(request.requesterId, personId)),
  });
  if (!r) notFound();

  const recipient = r.beneficiaryId
    ? await db.query.careRecipient.findFirst({ where: eq(careRecipient.id, r.beneficiaryId) })
    : null;

  const offers = r.status === 'looking'
    ? await db.select({
        id: offer.id, message: offer.message, createdAt: offer.createdAt,
        name: person.displayName, tier: person.verificationTier, personId: person.id,
      }).from(offer)
        .innerJoin(person, eq(offer.temanId, person.id))
        .where(and(eq(offer.requestId, id), eq(offer.state, 'offered')))
        .orderBy(asc(offer.createdAt))
    : [];

  const m = ['matched', 'active', 'completed'].includes(r.status)
    ? await db.query.match.findFirst({ where: eq(match.requestId, id) })
    : null;
  const teman = m ? await db.query.person.findFirst({ where: eq(person.id, m.temanId) }) : null;

  const when = format.dateTime(r.startsAt, {
    weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
  });

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      {r.status === 'looking' && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--s-4)' }}>
          <Sisi state="waiting" size={76} />
        </div>
      )}
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0, textAlign: r.status === 'looking' ? 'center' : 'start' }}>
        {recipient ? t('titleFor', { title: r.title, name: recipient.preferredName }) : r.title}
      </h1>

      <Card>
        <p className="card-meta" style={{ margin: 0 }}>{when}</p>
        {r.description && <p style={{ margin: '0.4em 0 0' }}>{r.description}</p>}
        <p style={{ margin: '0.5em 0 0' }}>
          <Pill variant={
            r.status === 'looking' ? 'looking'
            : r.status === 'matched' ? 'matched'
            : r.status === 'active' ? 'live'
            : r.status === 'completed' ? 'completed'
            : r.status === 'expired' ? 'error' : 'neutral'
          }>
            {t(`status.${r.status}`)}
          </Pill>
        </p>
      </Card>

      {r.status === 'looking' && (
        <>
          <Banner variant="info">
            {t('lookingPromise', {
              when: format.dateTime(r.expiresAt, { weekday: 'long', hour: 'numeric', minute: '2-digit' }),
            })}
          </Banner>

          {offers.length > 0 ? (
            <>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15em', margin: 0 }}>
                {t('offersTitle', { count: offers.length })}
              </h2>
              <div className="stack">
                {offers.map((o) => (
                  <Link key={o.id} href={`/${locale}/requests/${id}/offers/${o.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card accent="connection">
                      <div style={{ display: 'flex', gap: '0.7em', alignItems: 'center' }}>
                        <Avatar name={o.name} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>
                            {t('offerLine', { name: o.name.split(/\s+/)[0] })}
                          </p>
                          {o.message && <p className="card-meta" style={{ margin: '0.15em 0 0' }}>{o.message}</p>}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--n-700)', margin: 0, textAlign: 'center' }}>{t('noOffersYet')}</p>
          )}

          <Link href={`/${locale}/requests/${id}/cancel`} className="btn btn-line" style={{ textDecoration: 'none' }}>
            {t('cancelCta')}
          </Link>
        </>
      )}

      {(r.status === 'matched' || r.status === 'active') && teman && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Sisi state={r.status === 'active' ? 'together' : 'answered'} size={76} />
          </div>
          <Card accent="connection">
            <div style={{ display: 'flex', gap: '0.7em', alignItems: 'center' }}>
              <Avatar name={teman.displayName} />
              <p style={{ margin: 0, fontWeight: 600 }}>
                {t('matchedWith', { name: teman.displayName.split(/\s+/)[0] })}
              </p>
            </div>
          </Card>
          <Link href={`/${locale}/matches/${m!.id}`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
            {t('openMatch')}
          </Link>
        </>
      )}

      {r.status === 'expired' && (
        <>
          <Banner variant="warning" title={t('expiredTitle')}>{t('expiredBody')}</Banner>
          {/* two real alternatives, never a dead end */}
          <Link href={`/${locale}/requests/new`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
            {t('tryDifferentTime')}
          </Link>
          <Link href={`/${locale}/around`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
            {t('seeCommunity')}
          </Link>
        </>
      )}

      {r.status === 'cancelled' && (
        <Banner variant="info">{t('cancelledBody')}</Banner>
      )}
      {r.status === 'completed' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Sisi state="moment" size={76} />
        </div>
      )}
    </main>
  );
}
