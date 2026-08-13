import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { personIdFromSession } from '@/auth';
import { HeroSisi } from './HeroSisi';
import { LandingFx } from './LandingFx';
import { Photo } from '@/components/Photo';

/* P1 · The exchange itself, told top to bottom — ported from
   design/teman-landing.html. Screenshots under /shots/<locale>/ are captured
   from the seeded app in that locale by scripts/capture-shots.mjs.
   Signed-in members skip all of this and land on their home. */
export default async function PublicHomePage() {
  const locale = await getLocale();
  if (await personIdFromSession()) redirect(`/${locale}/home`);
  const t = await getTranslations('site');
  const shot = (name: string) => `/shots/${locale}/${name}.webp`;

  const faq = [
    ['freeQ', 'freeA'],
    ['whoQ', 'whoA'],
    ['nobodyQ', 'nobodyA'],
    ['wrongQ', 'wrongA'],
    ['noPhoneQ', 'noPhoneA'],
  ] as const;

  return (
    <main id="ld-root">
      <LandingFx />

      {/* the spine — decoration for wide screens, invisible to readers */}
      <div className="ld-spine" aria-hidden="true">
        <span className="ld-spine-you" />
        <span className="ld-spine-track" />
        <span className="ld-spine-fill" id="ld-fill" />
      </div>

      {/* hero */}
      <section className="ld-wrap" style={{ padding: 'clamp(52px, 9vw, 104px) clamp(20px, 4vw, 40px) clamp(40px, 6vw, 72px)' }}>
        <div className="hero-grid">
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 700, lineHeight: 1.05, margin: 0, fontSize: 'clamp(2.1em, 6.6vw, 4em)', letterSpacing: '-0.02em' }}>
              <span style={{ display: 'block', color: 'var(--t-900)' }}>{t('hero.need')}</span>
              <span className="ld-mid" aria-hidden="true">
                <span className="ld-mid-ln" /><span className="ld-mid-lb">{t('hero.mid')}</span><span className="ld-mid-ln" />
              </span>
              <span style={{ display: 'block', color: 'var(--a-700)' }}>{t('hero.canBe')}</span>
            </h1>
            <p style={{ fontSize: 'clamp(1.05em, 2.1vw, 1.25em)', color: 'var(--n-700)', maxWidth: '34ch', margin: '26px 0 0', lineHeight: 1.5 }}>
              {t('hero.lede')}
            </p>
            <p style={{ margin: '20px 0 0' }}>
              <span className="pill pill-matched">{t('hero.free')}</span>
            </p>
            <div className="hero-ctas" style={{ marginTop: '26px' }}>
              <Link href={`/${locale}/start`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                {t('hero.ctaNeed')}
              </Link>
              <Link href={`/${locale}/volunteer`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
                {t('hero.ctaVolunteer')}
              </Link>
            </div>
            <p className="hero-signin" style={{ margin: '18px 0 0' }}>
              {t('hero.already')}{' '}
              <Link href={`/${locale}/join/phone`}>{t('nav.signIn')}</Link>
            </p>
          </div>
          <div className="hero-sisi">
            <HeroSisi missingLabel={t('hero.missing')} thereLabel={t('hero.there')} />
          </div>
        </div>
      </section>

      {/* why this exists — three real situations, in prose */}
      <section className="ld-section" style={{ paddingTop: 0 }}>
        <div className="ld-wrap">
          <div className="ld-split">
            <div>
              <p className="ld-eyebrow rv">{t('why.eyebrow')}</p>
              <h2 className="ld-h2 rv">{t('why.title')}</h2>
              <p className="ld-lead rv">{t('why.lede')}</p>
            </div>
            <div className="rv">
              <Photo slot="waiting-room" alt={t('img.waiting-room')} />
            </div>
          </div>
          <div className="ld-sits">
            {(['sit1', 'sit2', 'sit3'] as const).map((k) => (
              <div key={k} className="ld-sit rv">
                <span className="ld-sit-mark" aria-hidden="true" />
                <div>
                  <p className="ld-sit-q">{t(`why.${k}`)}</p>
                  <p className="ld-sit-who">{t(`why.${k}Who`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the two paths — one exchange, from either side */}
      <section className="ld-section" style={{ paddingTop: 0 }}>
        <div className="ld-wrap">
          <p className="ld-eyebrow rv">{t('paths.eyebrow')}</p>
          <h2 className="ld-h2 rv">{t('paths.title')}</h2>
          <div className="ld-paths">
            <div className="ld-path ld-path-a rv on-deep">
              <h3>{t('paths.aTitle')}</h3>
              <p style={{ margin: 0 }}>{t('paths.aBody')}</p>
              <ul>
                {(['aL1', 'aL2', 'aL3', 'aL4'] as const).map((k) => <li key={k}>{t(`paths.${k}`)}</li>)}
              </ul>
              <Link href={`/${locale}/start`} className="btn btn-lg ld-btn-light">{t('hero.ctaNeed')}</Link>
            </div>
            <div className="ld-path ld-path-b rv">
              <h3>{t('paths.bTitle')}</h3>
              <p style={{ margin: 0 }}>{t('paths.bBody')}</p>
              <ul>
                {(['bL1', 'bL2', 'bL3', 'bL4'] as const).map((k) => <li key={k}>{t(`paths.${k}`)}</li>)}
              </ul>
              <Link href={`/${locale}/volunteer`} className="btn btn-primary btn-lg">{t('hero.ctaVolunteer')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* how it works — four steps beside the real screen */}
      <section className="ld-section ld-dark on-deep" id="how">
        <div className="ld-wrap">
          <p className="ld-eyebrow rv">{t('howHome.eyebrow')}</p>
          <h2 className="ld-h2 rv">{t('howHome.title')}</h2>
          <p className="ld-lead rv">{t('howHome.lede')}</p>
          <div className="ld-moment">
            <ol className="ld-steps rv">
              {([1, 2, 3, 4] as const).map((n) => (
                <li key={n}>
                  <b>{t(`howHome.s${n}t`)}</b>
                  <span>{t(`howHome.s${n}s`)}</span>
                </li>
              ))}
            </ol>
            <div className="rv">
              <div className="ld-phone">
                <img src={shot('offer')} alt={t('howHome.shotAlt')} width={375} height={812} loading="lazy" />
              </div>
              <p className="ld-shotcap">{t('howHome.shotCap')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* what it looks like — three more real screens */}
      <section className="ld-section">
        <div className="ld-wrap">
          <p className="ld-eyebrow rv">{t('shots.eyebrow')}</p>
          <h2 className="ld-h2 rv">{t('shots.title')}</h2>
          <div className="ld-shots">
            {(['1', '2', '3'] as const).map((n, i) => (
              <div key={n} className="rv">
                <div className="ld-phone">
                  <img src={shot(['home', 'ask', 'nearby'][i])} alt={t(`shots.alt${n}`)} width={375} height={812} loading="lazy" />
                </div>
                <p className="ld-shotcap">{t(`shots.cap${n}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* safety — numbered facts, not promises */}
      <section className="ld-section" id="safety-facts" style={{ paddingTop: 0 }}>
        <div className="ld-wrap">
          <p className="ld-eyebrow rv">{t('facts.eyebrow')}</p>
          <h2 className="ld-h2 rv">{t('facts.title')}</h2>
          <p className="ld-lead rv">{t('facts.lede')}</p>
          <div className="ld-facts">
            {(['f1', 'f2', 'f3', 'f4'] as const).map((k) => (
              <div key={k} className="ld-fact rv">
                <div className="ld-fact-n" aria-hidden="true">{t(`facts.${k}n`)}</div>
                <h4>{t(`facts.${k}t`)}</h4>
                <p>{t(`facts.${k}p`)}</p>
              </div>
            ))}
          </div>
          <p className="ld-emg rv">
            <strong>{t('facts.emgLead')}</strong> {t('facts.emgBody')}
          </p>
          <p className="rv" style={{ marginTop: '20px' }}>
            <Link href={`/${locale}/safety`} style={{ color: 'var(--t-900)', fontWeight: 600 }}>
              {t('safetyBrief.more')}
            </Link>
          </p>
        </div>
      </section>

      {/* what it is not */}
      <section className="ld-section" style={{ paddingTop: 0 }}>
        <div className="ld-wrap ld-narrow" style={{ marginInline: 'auto' }}>
          <p className="ld-eyebrow rv">{t('nots.eyebrow')}</p>
          <h2 className="ld-h2 rv">{t('nots.title')}</h2>
          <p className="ld-lead rv">{t('nots.lede')}</p>
          <div className="ld-nots">
            {(['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10'] as const).map((k) => (
              <span key={k} className="ld-not rv">{t(`nots.${k}`)}</span>
            ))}
          </div>
          <div className="ld-split" style={{ marginTop: 'var(--s-6)' }}>
            <p className="ld-is rv" style={{ marginTop: 0 }}>{t('nots.isLine')}</p>
            <div className="rv">
              <Photo slot="hands" alt={t('img.hands')} />
            </div>
          </div>
        </div>
      </section>

      {/* the NGO partnership */}
      <section className="ld-section" style={{ paddingTop: 0 }}>
        <div className="ld-wrap">
          <div className="ld-ngo rv">
            <div>
              <p className="ld-eyebrow" style={{ marginBottom: '10px' }}>{t('ngoEyebrow')}</p>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.25em, 2.8vw, 1.65em)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 12px' }}>
                {t('ngo.title')}
              </h3>
              <p style={{ color: 'var(--n-700)', lineHeight: 1.6, maxWidth: '56ch', margin: 0 }}>{t('ngo.body')}</p>
            </div>
            <Link href={`/${locale}/organisations`} className="btn btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap', width: 'auto' }}>
              {t('ngo.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* questions people actually ask */}
      <section className="ld-section" id="questions" style={{ paddingTop: 0 }}>
        <div className="ld-wrap">
          <p className="ld-eyebrow rv">{t('nav.faq')}</p>
          <h2 className="ld-h2 rv">{t('faq.title')}</h2>
          <div className="ld-faq rv">
            {faq.map(([q, a], i) => (
              <details key={q} className="ld-q" open={i === 0}>
                <summary>{t(`faq.${q}`)}<span className="ld-pm" aria-hidden="true">+</span></summary>
                <p className="ld-ans">{t(`faq.${a}`)}</p>
              </details>
            ))}
          </div>
          <p className="rv" style={{ marginTop: '20px' }}>
            <Link href={`/${locale}/faq`} style={{ color: 'var(--t-900)', fontWeight: 600 }}>{t('faqMore')}</Link>
          </p>
        </div>
      </section>

      {/* closing */}
      <section className="ld-section ld-dark ld-close on-deep">
        <div className="ld-wrap">
          <svg width="112" height="78" viewBox="0 0 100 72" style={{ marginBottom: '22px' }} aria-hidden="true">
            <rect x="20" y="14" width="24" height="46" rx="12" fill="var(--n-050)" />
            <rect x="56" y="14" width="24" height="46" rx="12" fill="var(--a-400)" />
            <rect x="38" y="30" width="24" height="8" rx="4" fill="var(--t-700)" />
          </svg>
          <p className="ld-close-ex">
            {t('close.l1')}<br /><span>{t('close.l2')}</span>
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '26px' }}>
            <Link href={`/${locale}/start`} className="btn btn-lg ld-btn-light" style={{ textDecoration: 'none', width: 'auto' }}>
              {t('hero.ctaNeed')}
            </Link>
            <Link href={`/${locale}/volunteer`} className="btn btn-lg btn-ghost" style={{ textDecoration: 'none', width: 'auto', color: 'var(--white)', borderColor: 'var(--t-300)' }}>
              {t('hero.ctaVolunteer')}
            </Link>
          </div>
          <p style={{ color: 'var(--t-100)', fontSize: '0.9em', marginTop: '26px' }}>{t('close.note')}</p>
        </div>
      </section>
    </main>
  );
}
