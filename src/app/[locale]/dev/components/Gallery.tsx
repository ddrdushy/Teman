'use client';

/* Section headings here are component names — code identifiers, deliberately
   untranslated. All product-like copy inside the demos comes from the real
   message catalogues, so this page doubles as the translation check. */

import { useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/Button';
import { BigAction } from '@/components/BigAction';
import { TextField } from '@/components/TextField';
import { RadioCards } from '@/components/RadioCards';
import { Select } from '@/components/Select';
import { Sheet } from '@/components/Sheet';
import { Card } from '@/components/Card';
import { Pill, type PillVariant } from '@/components/Pill';
import { Banner } from '@/components/Banner';
import { EmptyState } from '@/components/EmptyState';
import { Stepper } from '@/components/Stepper';
import { NavBar } from '@/components/NavBar';
import { LanguageSheet } from '@/components/LanguageSheet';
import { TextSizeControl } from '@/components/TextSizeControl';
import { Sisi, type SisiState } from '@/components/Sisi';
import { ListRow } from '@/components/ListRow';
import { Switch } from '@/components/Switch';
import { Counter } from '@/components/Counter';
import { Segmented } from '@/components/Segmented';
import { Accordion } from '@/components/Accordion';
import { Avatar, AvatarGroup } from '@/components/Avatar';
import { Toast } from '@/components/Toast';
import { Skeleton } from '@/components/Skeleton';
import { ProgressRing } from '@/components/ProgressRing';
import { DayPicker } from '@/components/DayPicker';
import { Calendar } from '@/components/Calendar';
import { SisiReveal } from '@/components/SisiReveal';
import { TickDraw } from '@/components/TickDraw';

function Section({ n, name, children }: { n: number; name: string; children: ReactNode }) {
  return (
    <section style={{ borderTop: '1px solid var(--n-200)', padding: 'var(--s-5) 0' }}>
      <h2 style={{ font: '600 0.9em var(--sans)', color: 'var(--t-800)', letterSpacing: '0.05em', margin: '0 0 0.8em' }}>
        {n} · {name}
      </h2>
      <div className="stack">{children}</div>
    </section>
  );
}

export function Gallery({ textScale }: { textScale: number }) {
  const t = useTranslations();
  const locale = useLocale();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [radio, setRadio] = useState<string | null>('b');
  const [grid, setGrid] = useState<string | null>(null);
  const [sw1, setSw1] = useState(true);
  const [sw2, setSw2] = useState(false);
  const [hours, setHours] = useState(3);
  const [seg, setSeg] = useState('nearby');
  const [day, setDay] = useState<string | null>(null);
  const [calDay, setCalDay] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  const today = new Date();
  const iso = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const monthIso = iso(0).slice(0, 7) + '-01';

  return (
    <main className="screen-pad" style={{ maxWidth: '52ch', paddingBottom: '90px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: '0 0 0.3em' }}>/dev/components</h1>
      <p style={{ color: 'var(--n-700)', margin: '0 0 1em' }}>28 · {locale} · {textScale}px</p>

      <div className="stack">
        <Button variant="ghost" size="md" onClick={() => setLangOpen(true)}>{t('language.control')}</Button>
        <TextSizeControl current={textScale} />
      </div>
      <LanguageSheet open={langOpen} onClose={() => setLangOpen(false)} />

      <Section n={1} name="Button">
        <Button>{t('home.needTeman')}</Button>
        <Button variant="connection" size="md">{t('ui.on')}</Button>
        <Button variant="ghost" size="md">{t('common.back')}</Button>
        <Button variant="line" size="md">{t('common.cancel')}</Button>
        <Button variant="danger" size="md">{t('common.tryAgain')}</Button>
        <Button size="md" disabled>{t('common.continue')}</Button>
        <Button size="md" loading>{t('common.continue')}</Button>
      </Section>

      <Section n={2} name="BigAction">
        <BigAction
          icon={<Sisi state="waiting" size={26} tone="dark" />}
          title={t('home.needTeman')}
          subtitle={t('home.needTemanSub')}
        />
        <BigAction
          variant="ghost"
          icon={<Sisi state="waiting" size={26} />}
          title={t('home.available')}
          subtitle={t('home.availableSub')}
        />
      </Section>

      <Section n={3} name="TextField">
        <TextField label={t('join.phoneTitle')} hint={t('join.phoneHint')} inputMode="tel" />
        <TextField label={t('join.nameTitle')} optional />
        <TextField label={t('join.otpTitle')} error={t('join.otpWrong')} defaultValue="00000" inputMode="numeric" />
        <TextField label={t('join.areaTitle')} hint={t('join.areaHint')} multiline />
      </Section>

      <Section n={4} name="RadioCards">
        <RadioCards
          value={radio}
          onChange={setRadio}
          options={[
            { value: 'a', label: t('join.intentHelp') },
            { value: 'b', label: t('join.intentNeed'), description: t('home.needTemanSub') },
          ]}
        />
        <RadioCards
          columns={2}
          value={grid}
          onChange={setGrid}
          options={[
            { value: 'c', label: t('language.standard') },
            { value: 'd', label: t('language.large') },
            { value: 'e', label: t('language.extraLarge') },
            { value: 'f', label: t('ui.more') },
          ]}
        />
      </Section>

      <Section n={5} name="Select">
        <Select
          label={t('language.choose')}
          defaultValue="en"
          options={[
            { value: 'en', label: 'English' },
            { value: 'ms', label: 'Bahasa Melayu' },
            { value: 'ta', label: 'தமிழ்' },
            { value: 'zh', label: '中文' },
          ]}
        />
      </Section>

      <Section n={6} name="Sheet">
        <Button variant="ghost" size="md" onClick={() => setSheetOpen(true)}>{t('language.textSize')}</Button>
        <Sheet title={t('language.textSize')} open={sheetOpen} onClose={() => setSheetOpen(false)}>
          <TextSizeControl current={textScale} />
        </Sheet>
      </Section>

      <Section n={7} name="Card">
        <Card title={t('home.next')} meta={t('home.stillLooking')} />
        <Card accent="waiting" title={t('home.next')} meta={t('home.stillLooking')} />
        <Card accent="connection" title={t('home.next')} meta={t('dev.signedIn')} />
      </Section>

      <Section n={8} name="Pill">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          {(['neutral', 'looking', 'matched', 'live', 'completed', 'error'] as PillVariant[]).map((v) => (
            <Pill key={v} variant={v}>{t('home.stillLooking')}</Pill>
          ))}
        </div>
      </Section>

      <Section n={9} name="Banner">
        <Banner variant="info" title={t('language.textSize')}>{t('language.hint')}</Banner>
        <Banner variant="warning">{t('home.stillLooking')}</Banner>
        <Banner variant="success">{t('ui.saved')}</Banner>
        <Banner variant="error" title={t('join.otpExpired')} action={
          <Button variant="ghost" size="md">{t('join.resend')}</Button>
        }>{t('join.otpWrong')}</Banner>
      </Section>

      <Section n={10} name="EmptyState">
        <EmptyState
          title={t('home.stillLooking')}
          body={t('welcome.line1')}
          action={<Button size="md">{t('home.needTeman')}</Button>}
        />
      </Section>

      <Section n={11} name="Stepper">
        <Stepper current={3} total={7} />
        <Stepper current={5} total={7} saved />
      </Section>

      <Section n={12} name="NavBar">
        <div style={{ border: '1px solid var(--n-200)', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
          <NavBar
            locale={locale}
            tabs={[
              { href: '/dev/components', label: t('nav.home') },
              { href: '/requests', label: t('nav.requests'), badge: 2 },
              { href: '/messages', label: t('nav.messages') },
              { href: '/you', label: t('nav.you') },
            ]}
          />
        </div>
      </Section>

      <Section n={13} name="LanguageSheet">
        <Button variant="ghost" size="md" onClick={() => setLangOpen(true)}>{t('language.choose')}</Button>
      </Section>

      <Section n={14} name="TextSizeControl">
        <TextSizeControl current={textScale} />
      </Section>

      <Section n={15} name="Sisi">
        <div style={{ display: 'flex', gap: 'var(--s-5)', flexWrap: 'wrap', alignItems: 'center' }}>
          {(['waiting', 'answered', 'together', 'moment'] as SisiState[]).map((s) => (
            <Sisi key={s} state={s} size={76} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-5)', background: 'var(--t-900)', padding: 'var(--s-4)', borderRadius: 'var(--r-card)' }}>
          <Sisi state="waiting" size={76} tone="dark" />
          <Sisi state="answered" size={76} tone="dark" />
        </div>
      </Section>

      <Section n={16} name="ListRow">
        <ListRow icon="K" title="Kumar" sub={t('home.stillLooking')} onClick={() => {}} />
        <ListRow icon="🌐" title={t('language.choose')} sub={t('language.textSize')} onClick={() => {}} />
      </Section>

      <Section n={17} name="Switch">
        <Switch title={t('home.availableSub')} sub={t('home.goingSub')} checked={sw1} onChange={setSw1} />
        <Switch title={t('home.going')} checked={sw2} onChange={setSw2} />
      </Section>

      <Section n={18} name="Counter">
        <Counter
          valueLabel={`${hours}`}
          onDecrement={() => setHours((h) => Math.max(1, h - 1))}
          onIncrement={() => setHours((h) => Math.min(8, h + 1))}
          decrementLabel={t('common.back')}
          incrementLabel={t('ui.more')}
          min={hours <= 1}
          max={hours >= 8}
        />
      </Section>

      <Section n={19} name="Segmented">
        <Segmented
          label={t('language.choose')}
          value={seg}
          onChange={setSeg}
          options={[
            { value: 'nearby', label: t('nav.home') },
            { value: 'circles', label: t('nav.requests') },
            { value: 'trusted', label: t('nav.you') },
          ]}
        />
      </Section>

      <Section n={20} name="Accordion">
        <Accordion summary={t('welcome.title')} open>{t('welcome.line1')}</Accordion>
        <Accordion summary={t('language.choose')}>{t('language.hint')}</Accordion>
      </Section>

      <Section n={21} name="Avatar">
        <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
          <Avatar name="Kumar" />
          <Avatar name="Siva" size="lg" />
          <AvatarGroup names={['Farah', 'Mei Ling', 'Kumar', 'Priya', 'Ravi']} />
        </div>
      </Section>

      <Section n={22} name="Toast">
        <Button variant="ghost" size="md" onClick={() => setToastOpen(true)}>{t('ui.undo')}</Button>
        {toastOpen && (
          <Toast message={t('ui.saved')} onUndo={() => {}} onDismiss={() => setToastOpen(false)} />
        )}
      </Section>

      <Section n={23} name="Skeleton">
        <Skeleton lines={3} />
      </Section>

      <Section n={24} name="ProgressRing">
        <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
          <ProgressRing percent={70} label={t('ui.stepOf', { current: 7, total: 10 })} />
          <ProgressRing percent={100} label={t('ui.stepOf', { current: 10, total: 10 })} />
        </div>
      </Section>

      <Section n={25} name="DayPicker">
        <DayPicker
          days={[iso(0), iso(1), iso(2)]}
          value={day}
          onChange={setDay}
          moreLabel={t('ui.more')}
          onMore={() => {}}
        />
      </Section>

      <Section n={26} name="Calendar">
        <Calendar
          month={monthIso}
          temanDays={[iso(1), iso(6)]}
          selected={calDay}
          onSelect={setCalDay}
        />
      </Section>

      <Section n={27} name="SisiReveal">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
          <SisiReveal key={revealKey} size={76} />
          <Button variant="ghost" size="md" onClick={() => setRevealKey((k) => k + 1)}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </Section>

      <Section n={28} name="TickDraw">
        <TickDraw />
      </Section>
    </main>
  );
}
