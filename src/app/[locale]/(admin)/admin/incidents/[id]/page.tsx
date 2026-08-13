import { asc, eq, or } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { report, person, session, match, request, message, auditLog } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';
import { IncidentActions } from './IncidentActions';

/* N11 · Incident detail — the full timeline: request, match, messages,
   session events, prior reports on either party. Opening it is logged. */
export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const actor = await requireRole(['admin']);
  if (!actor) redirect(`/${locale}/admin`);
  const t = await getTranslations('admin');

  const r = await db.query.report.findFirst({ where: eq(report.id, id) });
  if (!r) notFound();
  await audit(actor.id, 'admin_viewed_incident', 'report', id);

  const subject = await db.query.person.findFirst({ where: eq(person.id, r.subjectPersonId) });
  const reporter = await db.query.person.findFirst({ where: eq(person.id, r.reporterId) });

  const s = r.sessionId ? await db.query.session.findFirst({ where: eq(session.id, r.sessionId) }) : null;
  const m = s ? await db.query.match.findFirst({ where: eq(match.id, s.matchId) }) : null;
  const req = m ? await db.query.request.findFirst({ where: eq(request.id, m.requestId) }) : null;
  const msgs = req
    ? await db.query.message.findMany({ where: eq(message.requestId, req.id), orderBy: asc(message.createdAt), limit: 50 })
    : [];
  const prior = await db.query.report.findMany({
    where: or(eq(report.subjectPersonId, r.subjectPersonId), eq(report.subjectPersonId, r.reporterId)),
  });
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '760px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: 0 }}>
        {t(`inc.cat.${r.category}` as never)} · {subject?.displayName}
      </h1>
      <p style={{ margin: 0, color: 'var(--n-700)', fontSize: '15px' }}>
        {t('inc.reportedBy', { name: reporter?.displayName ?? '—', at: fmt.format(r.createdAt) })}
        {' · '}
        <span className={`pill ${r.severity === 'urgent' ? 'pill-error' : 'pill-looking'}`}>
          {t(`inc.sev.${r.severity}` as never)}
        </span>
        {subject?.suspendedAt && <> · <span className="pill pill-error">{t('inc.restricted')}</span></>}
      </p>
      {r.detail && <blockquote style={{ margin: 0, borderInlineStart: '3px solid var(--n-300)', paddingInlineStart: '12px' }}>{r.detail}</blockquote>}

      {req && (
        <section>
          <h2 style={{ fontSize: '16px', margin: '0 0 6px' }}>{t('inc.timeline')}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              {[
                [fmt.format(req.createdAt), t('inc.tlPublished', { title: req.title })],
                ...(m ? [[fmt.format(m.createdAt), t('inc.tlMatched')]] : []),
                ...(s?.startedAt ? [[fmt.format(s.startedAt), t('inc.tlStarted')]] : []),
                ...msgs.map((x) => [
                  fmt.format(x.createdAt),
                  `${x.senderId === r.subjectPersonId ? subject?.displayName : reporter?.displayName}: ${x.body}`,
                ]),
                ...(s?.endedAt ? [[fmt.format(s.endedAt), t('inc.tlEnded')]] : []),
                [fmt.format(r.createdAt), t('inc.tlReported')],
              ].map(([at, what], i) => (
                <tr key={i}>
                  <td style={{ padding: '5px 10px 5px 0', whiteSpace: 'nowrap', color: 'var(--n-700)', verticalAlign: 'top' }}>{at}</td>
                  <td style={{ padding: '5px 0', borderBottom: '1px solid var(--n-100)' }}>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {prior.length > 1 && (
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--err-text)', fontWeight: 600 }}>
          {t('inc.priorReports', { count: prior.length - 1 })}
        </p>
      )}

      {r.status === 'open'
        ? <IncidentActions reportId={r.id} subjectSuspended={Boolean(subject?.suspendedAt)} />
        : <p style={{ color: 'var(--n-700)' }}>{t('inc.closed', { status: r.status })}</p>}
    </div>
  );
}
