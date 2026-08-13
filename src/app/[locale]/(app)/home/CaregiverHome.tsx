'use client';

import Link from 'next/link';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import { BigAction } from '@/components/BigAction';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Banner } from '@/components/Banner';
import { Sisi } from '@/components/Sisi';
import { HomeBar } from './HomeBar';

type Props = {
  name: string;
  areaName: string;
  verificationTier: string;
  volunteersInArea: number;
  availabilityCount: number;
  hasPhoto: boolean;
  hasLanguages: boolean;
  requestsOpen: boolean;
  launchMonth: string; // YYYY-MM
};

function greetingKey(): 'greeting' | 'greetingAfternoon' | 'greetingEvening' {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kuala_Lumpur' })
      .format(new Date()),
  );
  return hour < 12 ? 'greeting' : hour < 19 ? 'greetingAfternoon' : 'greetingEvening';
}

/* B1 · No amber anywhere on this screen — nothing is connected yet, and
   amber without a person attached stops meaning anything. */
export function CaregiverHome(props: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const format = useFormatter();

  const launch = new Date(`${props.launchMonth}-01T12:00:00`);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)', paddingBottom: 0 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>
          {t(`home.${greetingKey()}`, { name: props.name })}
        </h1>
        <p style={{ color: 'var(--n-700)', margin: '0.2em 0 0' }}>
          {format.dateTime(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {props.requestsOpen ? (
        <div className="stack">
          <BigAction
            icon={<Sisi state="waiting" size={26} tone="dark" />}
            title={t('home.needTeman')}
            subtitle={t('home.needTemanSub')}
            onClick={() => { window.location.href = `/${locale}/requests/new`; }}
          />
          <BigAction
            variant="ghost"
            icon={<Sisi state="waiting" size={26} />}
            title={t('home.available')}
            subtitle={t('home.availableSub')}
            onClick={() => { window.location.href = `/${locale}/available`; }}
          />
          <BigAction
            variant="ghost"
            icon={<Sisi state="waiting" size={26} />}
            title={t('home.going')}
            subtitle={t('home.goingSub')}
            onClick={() => { window.location.href = `/${locale}/journey`; }}
          />
        </div>
      ) : (
        <>
          {/* Pre-launch: the screen that decides whether NGO-recruited
              volunteers are still here when requests open (docs/04). */}
          <Banner variant="info" title={t('home.requestsOpenIn', {
            month: format.dateTime(launch, { month: 'long', year: 'numeric' }),
          })}>
            {t('home.weWillMessage')}
          </Banner>

          <Card>
            <p className="card-meta" style={{ margin: 0 }}>
              {t('home.volunteersJoined', { count: props.volunteersInArea, area: props.areaName })}
            </p>
          </Card>

          <ListRow
            href={`/${locale}/verify`}
            title={t('home.verificationRow')}
            sub={t(`verify.tier.${props.verificationTier}`)}
          />
          <ListRow
            href={`/${locale}/available`}
            title={t('home.availabilityRow')}
            sub={props.availabilityCount > 0
              ? t('home.availabilitySet', { count: props.availabilityCount })
              : t('home.availabilityNone')}
          />

          <Card title={t('home.completeness')}>
            <ul style={{ margin: '0.4em 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: '0.4em' }}>
              <li>✓ {t('home.checkName')}</li>
              <li>✓ {t('home.checkArea')}</li>
              <li>{props.hasPhoto ? '✓' : '○'} {t('home.checkPhoto')}</li>
              <li>{props.hasLanguages ? '✓' : '○'} {t('home.checkLanguages')}</li>
            </ul>
          </Card>
        </>
      )}

      <HomeBar />
    </main>
  );
}
