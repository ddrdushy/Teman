import { count, desc, eq, gt, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, area, availability } from '@/db/schema';
import { requireRole } from '@/lib/admin';

/* N5 · Volunteer directory — the NGO's main screen during recruitment:
   who registered, which area, which tier, availability declared. The rows
   with NO availability are the follow-up list. */
export default async function VolunteerDirectoryPage() {
  const locale = await getLocale();
  const actor = await requireRole(['coordinator', 'admin']);
  if (!actor) redirect(`/${locale}`);
  const t = await getTranslations('admin');

  const rows = await db.select({
    id: person.id, name: person.displayName, tier: person.verificationTier,
    areaName: area.name, createdAt: person.createdAt,
    hasPhoto: person.photoKey, languages: person.languages,
    slots: count(availability.id),
  }).from(person)
    .leftJoin(area, eq(person.areaId, area.id))
    .leftJoin(availability, and(eq(availability.personId, person.id), gt(availability.endsAt, new Date())))
    .groupBy(person.id, area.name)
    .orderBy(desc(person.createdAt))
    .limit(200);

  const members = rows.filter((r) => r.name);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', margin: '0 0 4px' }}>{t('vol.title')}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--n-700)', fontSize: '15px' }}>
        {t('vol.followUpHint', { count: members.filter((r) => r.slots === 0).length })}
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr>
            {['name', 'area', 'tier', 'languages', 'availability'].map((h) => (
              <th key={h} style={{ textAlign: 'start', padding: '8px 10px', borderBottom: '2px solid var(--n-200)' }}>
                {t(`vol.${h}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((r) => (
            <tr key={r.id} style={r.slots === 0 ? { background: 'var(--warn-fill)' } : undefined}>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)', fontWeight: 600 }}>{r.name}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>{r.areaName ?? '—'}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>{r.tier}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>{(r.languages ?? []).join(', ') || '—'}</td>
              <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--n-100)' }}>
                {r.slots > 0
                  ? t('vol.slotCount', { count: r.slots })
                  : <b>{t('vol.noneSet')}</b>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
