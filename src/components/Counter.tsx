'use client';

type Props = {
  /** already-formatted value — "3 hours" comes from the caller's t() */
  valueLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementLabel: string;   // accessible words for the − / + targets
  incrementLabel: string;
  min?: boolean;            // at minimum — disables −
  max?: boolean;
};

/** Replaces every numeric input and every slider — sliders and unsteady
 *  hands don't mix. 56px buttons; the value is typed by nobody. */
export function Counter({
  valueLabel, onDecrement, onIncrement, decrementLabel, incrementLabel, min, max,
}: Props) {
  return (
    <div className="counter">
      <button type="button" onClick={onDecrement} disabled={min} aria-label={decrementLabel}>
        <span aria-hidden="true">−</span>
      </button>
      <span className="counter-value" role="status">{valueLabel}</span>
      <button type="button" onClick={onIncrement} disabled={max} aria-label={incrementLabel}>
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
