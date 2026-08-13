'use client';

import { useId, type ReactNode } from 'react';

export type RadioOption<V extends string> = {
  value: V;
  label: string;
  description?: string;
  icon?: ReactNode;
};

type Props<V extends string> = {
  name?: string;
  options: RadioOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  /** 1 for text-heavy, 2 for a category grid */
  columns?: 1 | 2;
};

/** Single choice from a visible set. The whole card is the target; selection
 *  is border + fill + tick, never colour alone. */
export function RadioCards<V extends string>({ name, options, value, onChange, columns = 1 }: Props<V>) {
  const groupId = useId();
  return (
    <div className={['radio-cards', columns === 2 ? 'cols-2' : ''].join(' ').trim()} role="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label key={o.value} className={['radio-card', selected ? 'is-selected' : ''].join(' ').trim()}>
            <input
              type="radio"
              name={name ?? groupId}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
            />
            {o.icon && <span aria-hidden="true">{o.icon}</span>}
            <span className="rc-text">
              <span className="rc-label">{o.label}</span>
              {o.description && <span className="rc-desc">{o.description}</span>}
            </span>
            <span className="rc-tick" aria-hidden="true">✓</span>
          </label>
        );
      })}
    </div>
  );
}
