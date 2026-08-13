'use client';

import { useLocale } from 'next-intl';

type Props = {
  /** first day of the shown month, ISO */
  month: string;
  /** ISO dates that have a confirmed Teman — the amber dot. Connection only. */
  temanDays?: string[];
  selected?: string | null;
  onSelect?: (iso: string) => void;
};

/** Month grid. Tapping a day opens that day's agenda — read-only in the
 *  member app, never an editor. */
export function Calendar({ month, temanDays = [], selected, onSelect }: Props) {
  const locale = useLocale();
  const first = new Date(`${month.slice(0, 7)}-01T12:00:00`);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const heads = Array.from({ length: 7 }, (_, i) =>
    weekdayFmt.format(new Date(2024, 0, i + 1)), // 2024-01-01 was a Monday
  );
  const iso = (day: number) =>
    `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <div className="cal">
      {heads.map((h, i) => <span key={i} className="cal-head" aria-hidden="true">{h}</span>)}
      {Array.from({ length: startOffset }, (_, i) => (
        <span key={`o${i}`} className="cal-day is-outside" aria-hidden="true" />
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayIso = iso(day);
        const hasTeman = temanDays.includes(dayIso);
        return (
          <button
            key={day}
            type="button"
            className={[
              'cal-day',
              hasTeman ? 'has-teman' : '',
              selected === dayIso ? 'is-selected' : '',
            ].join(' ').trim()}
            aria-pressed={selected === dayIso}
            onClick={() => onSelect?.(dayIso)}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
