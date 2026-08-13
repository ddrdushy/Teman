import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, category } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { readUrl } from '@/lib/storage';
import { ProgressRing } from '@/components/ProgressRing';
import { Avatar } from '@/components/Avatar';
import { Pill } from '@/components/Pill';
import { ProfileEditor } from './ProfileEditor';

/* C1 · Your profile — ring + checklist (what's missing, not just how much),
   then the C2–C5 editor sections below: basics, photo, languages,
   categories. One page; each section autosaves with a quiet ✓ Saved. */
export default async function ProfilePage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations();

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p) redirect(`/${locale}`);
  const cats = await db.select().from(category).where(eq(category.active, true)).orderBy(category.sort);
  const photoUrl = p.photoKey ? await readUrl(p.photoKey) : undefined;

  const checks = [
    { key: 'checkName', done: Boolean(p.displayName) },
    { key: 'checkArea', done: Boolean(p.areaId) },
    { key: 'checkPhoto', done: Boolean(p.photoKey) },
    { key: 'checkLanguages', done: Boolean(p.languages?.length) },
    { key: 'checkCategories', done: Boolean(p.categories?.length) },
    { key: 'checkBio', done: Boolean(p.bio) },
  ];
  const percent = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        <ProgressRing percent={percent} label={t('profile.ringLabel', { percent })} />
        <div>
          <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
            <Avatar name={p.displayName} photoUrl={photoUrl} />
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.3em', margin: 0 }}>{p.displayName}</h1>
          </div>
          {['identity', 'community', 'enhanced'].includes(p.verificationTier) && (
            <p style={{ margin: '0.4em 0 0' }}>
              <Pill variant="completed">{t('verify.tier.identity')}</Pill>
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <p className="label" style={{ color: 'var(--n-700)', margin: '0 0 0.5em' }}>{t('home.completeness')}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.35em' }}>
          {checks.map((c) => (
            <li key={c.key}>
              <span aria-hidden="true">{c.done ? '✓' : '○'}</span>{' '}
              {t(`profile.${c.key}` as never)}
            </li>
          ))}
        </ul>
      </div>

      <ProfileEditor
        bio={p.bio ?? ''}
        languages={p.languages ?? []}
        categories={p.categories ?? []}
        transport={(p.transport as string[] | null) ?? []}
        allCategories={cats.map((c) => ({
          id: c.id,
          group: c.group,
          name:
            (locale === 'ms' ? c.nameMs : locale === 'ta' ? c.nameTa : locale === 'zh' ? c.nameZh : c.nameEn) ??
            c.nameEn,
        }))}
      />
    </main>
  );
}
