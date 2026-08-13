'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  label: string;            // always visible — a placeholder is never the label
  hint?: string;            // why we're asking, for anything sensitive
  error?: string;           // the entered value is never wiped on error
  optional?: boolean;       // marked OPTIONAL — never an asterisk on required
  multiline?: boolean;
} & InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>;

export function TextField({ label, hint, error, optional, multiline, className, ...rest }: Props) {
  const t = useTranslations('ui');
  const id = useId();
  const errorId = `${id}-err`;
  const hintId = `${id}-hint`;
  const described = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const shared = {
    id,
    className: 'input',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': described,
  };

  return (
    <div className={['field', error ? 'has-error' : '', className ?? ''].join(' ').trim()}>
      <label htmlFor={id} className="label">
        {label}
        {optional && <> · {t('optional')}</>}
      </label>
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      {multiline
        ? <textarea {...shared} rows={4} {...(rest as InputHTMLAttributes<HTMLTextAreaElement>)} />
        : <input {...shared} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />}
      {error && (
        <p id={errorId} className="field-error">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
