'use client';

type Props<V extends string> = {
  /** Never more than three — beyond that it becomes unreadable slivers in Tamil. */
  options: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  label: string;   // group label for assistive tech
};

export function Segmented<V extends string>({ options, value, onChange, label }: Props<V>) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.slice(0, 3).map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
