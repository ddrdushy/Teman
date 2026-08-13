'use client';

type Props = {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  label: string;   // group label for assistive tech
};

/** Multi-select chips. Selection is border + fill + tick — never colour
 *  alone — and every chip clears the 56px floor. */
export function Chips({ options, selected, onChange, label }: Props) {
  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  }
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button key={o.value} type="button" className="chip" aria-pressed={on} onClick={() => toggle(o.value)}>
            {on && <span aria-hidden="true">✓</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
