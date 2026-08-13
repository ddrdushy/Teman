import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { HeroSisi } from './HeroSisi';

/* P1 · The exchange itself. Signed-in members skip the marketing and land
   on their home. Three real situations in prose — deliberately not a
   three-identical-card grid. */
export default async function PublicHomePage() {
  const locale = await getLocale();
  if (await personIdFromSession()) redirect(`/${locale}/home`);
  const t = await getTranslations('site');

  return (
    <main>
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--s-10) var(--s-5) var(--s-14)' }}>
        <div className="hero-grid">
          <div style={{ display: 'grid', gap: 'var(--s-5)' }}>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(2em, 6vw, 3.2em)', lineHeight: 1.08, margin: 0, maxWidth: '14ch' }}>
              <span style={{ display: 'block', color: 'var(--t-900)' }}>{t('hero.need')}</span>
              <span style={{ display: 'block', color: 'var(--a-700)' }}>{t('hero.canBe')}</span>
            </h1>
            <p style={{ fontSize: '1.1em', color: 'var(--n-700)', maxWidth: '42ch', margin: 0, lineHeight: 1.55 }}>
              {t('hero.lede')}
            </p>
            <p style={{ margin: 0 }}>
              <span className="pill pill-matched">{t('hero.free')}</span>
            </p>
            <div className="hero-ctas">
              <Link href={`/${locale}/start`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                {t('hero.ctaNeed')}
              </Link>
              <Link href={`/${locale}/volunteer`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
                {t('hero.ctaVolunteer')}
              </Link>
            </div>
            <p className="hero-signin" style={{ margin: 0 }}>
              {t('hero.already')}{' '}
              <Link href={`/${locale}/join/phone`}>{t('nav.signIn')}</Link>
            </p>
          </div>
          <div className="hero-sisi">
            <HeroSisi missingLabel={t('hero.missing')} thereLabel={t('hero.there')} />
          </div>
        </div>
      </section>

      {/* three real situations, in prose */}
      <section style={{ background: 'var(--white)', borderBlock: '1px solid var(--n-200)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'var(--s-10) var(--s-5)', display: 'grid', gap: 'var(--s-5)' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.6em', margin: 0, maxWidth: '24ch' }}>{t('why.title')}</h2>
          <p style={{ margin: 0, color: 'var(--n-700)', lineHeight: 1.6 }}>{t('why.lede')}</p>
          {['sit1', 'sit2', 'sit3'].map((k) => (
            <blockquote key={k} style={{
              margin: 0, paddingInlineStart: 'var(--s-4)',
              borderInlineStart: `4px solid ${k === 'sit2' ? 'var(--a-400)' : 'var(--t-900)'}`,
            }}>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.15em', margin: 0, lineHeight: 1.45 }}>
                {t(`why.${k}` as never)}
              </p>
              <p style={{ margin: '0.3em 0 0', fontSize: '0.85em', color: 'var(--n-700)', fontWeight: 600 }}>
                {t(`why.${k}Who` as never)}
              </p>
            </blockquote>
          ))}
        </div>
      </section>

      {/* how safety works, briefly — the long form is P7 */}
      <section style={{ background: 'var(--t-900)', color: 'var(--white)' }} className="on-deep">
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'var(--s-10) var(--s-5)', display: 'grid', gap: 'var(--s-4)' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.6em', margin: 0, color: 'var(--white)' }}>{t('safetyBrief.title')}</h2>
          {['b1', 'b2', 'b3', 'b4'].map((k) => (
            <p key={k} style={{ margin: 0, color: 'var(--t-100)', lineHeight: 1.6 }}>{t(`safetyBrief.${k}` as never)}</p>
          ))}
          <Link href={`/${locale}/safety`} style={{ color: 'var(--a-300)', fontWeight: 600 }}>
            {t('safetyBrief.more')}
          </Link>
        </div>
      </section>

      {/* the NGO partnership */}
      <section>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'var(--s-10) var(--s-5)', display: 'grid', gap: 'var(--s-3)' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.4em', margin: 0 }}>{t('ngo.title')}</h2>
          <p style={{ margin: 0, color: 'var(--n-700)', lineHeight: 1.6 }}>{t('ngo.body')}</p>
          <Link href={`/${locale}/organisations`} className="btn btn-line" style={{ width: 'auto', textDecoration: 'none', justifySelf: 'start' }}>
            {t('ngo.cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
