'use client';

import { useLocale } from 'next-intl';

type Props = {
  /** ISO dates offered as big cards — most requests are today, tomorrow or
   *  the weekend; a calendar grid for that is needless precision. */
  days: string[];
  value: string | null;
  onChange: (iso: string) => void;
  /** the fourth card: opens the full Calendar */
  moreLabel: string;
  onMore: () => void;
};

export function DayPicker({ days, value, onChange, moreLabel, onMore }: Props) {
  const locale = useLocale();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  return (
    <div className="day-picker">
      {days.slice(0, 3).map((iso) => {
        const d = new Date(`${iso}T12:00:00`);
        return (
          <button
            key={iso}
            type="button"
            className="day-card"
            aria-pressed={value === iso}
            onClick={() => onChange(iso)}
          >
            <small>{weekday.format(d)}</small>
            <b>{d.getDate()}</b>
          </button>
        );
      })}
      <button type="button" className="day-card" onClick={onMore}>
        <small>{moreLabel}</small>
        <b aria-hidden="true">›</b>
      </button>
    </div>
  );
}
