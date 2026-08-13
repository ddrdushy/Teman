'use client';

import { useId, type SelectHTMLAttributes } from 'react';

type Props = {
  label: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>;

/** Native <select> on purpose — the OS picker is bigger, familiar, and better
 *  with a screen reader than anything custom. For search over long lists
 *  (areas, destinations), use a full-screen search sheet instead. */
export function Select({ label, options, className, ...rest }: Props) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className={['select', className ?? ''].join(' ').trim()} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
