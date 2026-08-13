import { eq, sql as dsql } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { verification, person, area } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';
import { readUrl } from '@/lib/storage';
import { ReviewActions } from './ReviewActions';

/* N7 · Review one. ID and selfie side by side at full size; A approve,
   R reject, → next. Opening this page — seeing the documents — is itself an
   audited event. Images come via short-lived signed URLs (R2) or the
   role-gated file route (local). */
export default async function ReviewOnePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const row = await db
    .select({
      id: verification.id,
      state: verification.state,
      docType: verification.docType,
      docKey: verification.docKey,
      selfieKey: verification.selfieKey,
      createdAt: verification.createdAt,
      personId: person.id,
      name: person.displayName,
      areaName: area.name,
      dupCount: dsql<number>`(
        SELECT count(*)::int FROM verification v2
        WHERE v2.doc_hash = ${verification.docHash}
          AND v2.person_id <> ${verification.personId}
      )`,
    })
    .from(verification)
    .innerJoin(person, eq(verification.personId, person.id))
    .leftJoin(area, eq(person.areaId, area.id))
    .where(eq(verification.id, id))
    .then((r) => r[0]);
  if (!row) notFound();

  /* the reviewer saw the documents — logged, every time */
  await audit(actor.id, 'admin_viewed_verification', 'verification', row.id, {
    subjectPerson: row.personId,
  });

  const [docUrl, selfieUrl] = await Promise.all([
    row.docKey ? readUrl(row.docKey) : null,
    row.selfieKey ? readUrl(row.selfieKey) : null,
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 4px' }}>{row.name}</h1>
      <p style={{ color: 'var(--n-700)', margin: '0 0 12px', fontSize: '15px' }}>
        {row.areaName ?? '—'} · {row.docType} · {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(row.createdAt)}
      </p>
      {row.dupCount > 0 && (
        <p style={{ margin: '0 0 12px' }}>
          <span className="pill pill-error">! {t('queue.duplicateFlag')}</span>{' '}
          <span style={{ fontSize: '14px', color: 'var(--err-text)' }}>{t('review.dupNote', { count: row.dupCount })}</span>
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {[[docUrl, t('review.document')], [selfieUrl, t('review.selfie')]].map(([url, label], i) => (
          <figure key={i} style={{ margin: 0 }}>
            <figcaption className="label" style={{ marginBottom: '6px', color: 'var(--n-700)' }}>{label as string}</figcaption>
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url as string} alt="" style={{ width: '100%', border: '1px solid var(--n-200)', borderRadius: '8px' }} />
            ) : (
              <p style={{ color: 'var(--n-700)' }}>{t('review.imagePurged')}</p>
            )}
          </figure>
        ))}
      </div>
      {row.state === 'pending'
        ? <ReviewActions verificationId={row.id} />
        : <p style={{ color: 'var(--n-700)' }}>{t('review.alreadyDecided', { state: row.state })}</p>}
    </div>
  );
}
