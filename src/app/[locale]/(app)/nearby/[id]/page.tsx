import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { request, careRecipient, category, area, offer } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { recipientForTeman } from '@/lib/privacy';
import { Card } from '@/components/Card';
import { Banner } from '@/components/Banner';
import { OfferForm } from './OfferForm';

/* G3 · Request detail, the Teman's view. Accessibility needs and
   conversation preferences sit ABOVE the offer button, always — a volunteer
   who accepts and then discovers a wheelchair they can't accommodate is a
   failed meeting and a lost volunteer. Recipient data passes through
   recipientForTeman(); the emergency contact never leaves the server. */
export default async function NearbyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('nearby');
  const tc = await getTranslations('care');
  const format = await getFormatter();

  const r = await db.query.request.findFirst({ where: eq(request.id, id) });
  if (!r || r.requesterId === personId) notFound();

  const taken = r.status !== 'looking';
  const existing = await db.query.offer.findFirst({
    where: and(eq(offer.requestId, id), eq(offer.temanId, personId)),
  });

  const cat = await db.query.category.findFirst({ where: eq(category.id, r.categoryId) });
  const a = r.areaId ? await db.query.area.findFirst({ where: eq(area.id, r.areaId) }) : null;
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';

  const recipientRaw = r.beneficiaryId
    ? await db.query.careRecipient.findFirst({ where: eq(careRecipient.id, r.beneficiaryId) })
    : null;
  const recipient = recipientRaw ? recipientForTeman(recipientRaw) : null;
  const prefs = (r.prefs ?? {}) as { mood?: string[] };

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{r.title}</h1>
      <Card>
        <p className="card-meta" style={{ margin: 0 }}>
          {format.dateTime(r.startsAt, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}
          {' · '}{areaName}
        </p>
        <p className="card-meta" style={{ margin: '0.2em 0 0' }}>
          {(locale === 'ms' ? cat?.nameMs : locale === 'ta' ? cat?.nameTa : locale === 'zh' ? cat?.nameZh : cat?.nameEn) ?? cat?.nameEn}
        </p>
      </Card>
      {r.description && <p style={{ margin: 0 }}>“{r.description}”</p>}

      {/* BEFORE the offer button — non-negotiable */}
      {recipient && (
        <Banner variant="info" title={t('aboutPerson', { name: recipient.preferredName })}>
          {[
            recipient.ageBand ? tc(`ageBand.${recipient.ageBand}` as never) : null,
            ...((recipient.accessibility as string[]) ?? []).map((x) => tc(`access.${x}` as never)),
            ...((recipient.conversationPrefs as string[]) ?? []).map((x) => tc(`conv.${x}` as never)),
            recipient.mobilityNotes,
          ].filter(Boolean).join(' · ')}
        </Banner>
      )}
      {prefs.mood && prefs.mood.length > 0 && (
        <Banner variant="info">
          {prefs.mood.map((m) => t(`mood.${m}` as never)).join(' · ')}
        </Banner>
      )}

      {taken ? (
        <Banner variant="warning">{t('alreadyTaken')}</Banner>
      ) : existing ? (
        <Banner variant="success">{t('alreadyOffered')}</Banner>
      ) : (
        <OfferForm requestId={id} />
      )}
    </main>
  );
}
