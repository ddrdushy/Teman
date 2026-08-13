import { count, desc, eq, or } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, area, request, report, verification, session, match } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';
import { RestrictUser } from './RestrictUser';

/* N3/N4 · User detail — opening it writes to audit_log, and the page says
   so. Restriction states exactly what the member will see. */
export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const actor = await requireRole(['admin']);
  if (!actor) redirect(`/${locale}/admin`);
  const t = await getTranslations('admin');

  const p = await db.query.person.findFirst({ where: eq(person.id, id) });
  if (!p) notFound();
  await audit(actor.id, 'admin_viewed_user', 'person', id);

  const a = p.areaId ? await db.query.area.findFirst({ where: eq(area.id, p.areaId) }) : null;
  const [reqCount] = await db.select({ n: count() }).from(request).where(eq(request.requesterId, id));
  const [momentCount] = await db.select({ n: count() }).from(session)
    .innerJoin(match, eq(session.matchId, match.id))
    .where(eq(match.temanId, id));
  const reportsAbout = await db.query.report.findMany({
    where: eq(report.subjectPersonId, id), orderBy: desc(report.createdAt), limit: 10,
  });
  const verifs = await db.query.verification.findMany({
    where: eq(verification.personId, id), orderBy: desc(verification.createdAt), limit: 5,
  });
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <div style={{ display: 'grid', gap: '14px', maxWidth: '680px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: 0 }}>{p.displayName || '—'}</h1>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--n-700)' }}>{t('users.viewLogged')}</p>
      <table style={{ borderCollapse: 'collapse', fontSize: '15px' }}>
        <tbody>
          {[
            [t('users.area'), a?.name ?? '—'],
            [t('users.tier'), p.verificationTier],
            [t('users.lang'), p.preferredLanguage],
            [t('users.joined'), fmt.format(p.createdAt)],
            [t('users.requests'), String(reqCount.n)],
            [t('users.moments'), String(momentCount.n)],
            [t('users.status'), p.suspendedAt ? t('users.restricted') : t('users.active')],
          ].map(([k, v], i) => (
            <tr key={i}>
              <td style={{ padding: '6px 14px 6px 0', color: 'var(--n-700)' }}>{k}</td>
              <td style={{ padding: '6px 0', fontWeight: 600 }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {verifs.length > 0 && (
        <section>
          <h2 style={{ fontSize: '16px', margin: '0 0 6px' }}>{t('users.verifHistory')}</h2>
          {verifs.map((v) => (
            <p key={v.id} style={{ margin: '2px 0', fontSize: '14px' }}>
              {fmt.format(v.createdAt)} · {v.docType} · {v.state}{v.rejectReason ? ` (${v.rejectReason})` : ''}
            </p>
          ))}
        </section>
      )}
      {reportsAbout.length > 0 && (
        <section>
          <h2 style={{ fontSize: '16px', margin: '0 0 6px' }}>{t('users.reportsAbout', { count: reportsAbout.length })}</h2>
          {reportsAbout.map((r) => (
            <p key={r.id} style={{ margin: '2px 0', fontSize: '14px' }}>
              {fmt.format(r.createdAt)} · {r.category} · {r.severity} · {r.status}
            </p>
          ))}
        </section>
      )}

      <RestrictUser personId={id} suspended={Boolean(p.suspendedAt)} />
    </div>
  );
}
