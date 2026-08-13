# Teman — Component Library

Fifteen primitives carry 129 screens. These are the highest-leverage hours in the build: get them right once and the screens go fast; rush them and you re-fix 129 screens.

No component library. Every mainstream one has to be overridden on target size, text scaling, per-script line-height, truncation and icon-only controls — which is most of what its components do. Build these by hand and own them.

**Every component obeys, without restating:** 56 px minimum height (64 px for primary), 12 px minimum gap from any neighbour, visible focus ring (3 px, 3 px offset, amber on teal / teal on amber), text scales with the account's 18/22/26 setting, wraps rather than truncates, never communicates state by colour alone, and carries a visible word if it's interactive.

---

## 1 · Button

```ts
variant: 'primary' | 'connection' | 'ghost' | 'line' | 'danger'
size: 'lg' | 'md'          // lg = 64px, md = 56px. There is no small.
fullWidth?: boolean        // default true on mobile
loading?: boolean
disabled?: boolean
```

| Variant | Fill | Label | Use for |
|---|---|---|---|
| `primary` | Teal 900, white | 9.66:1 | The one main action per screen |
| `connection` | Amber 400, Neutral 900 | 7.07:1 | **Only** accepting a person or completing a Teman Moment |
| `ghost` | White, Neutral 500 border | 15.48:1 | Secondary |
| `line` | Transparent, Neutral 500 border | | Tertiary |
| `danger` | Error fill, Error text, red border | 8.17:1 | Safety help, report. Never for delete. |

States: default · hover · focus · active (scale .985) · disabled (Neutral 200 on Neutral 500) · loading (spinner replaces label, width held).

Labels state the outcome: "Publish request", "Accept Kumar", "End this Teman session". Never "Submit", "OK", "Continue" where something more specific is true.

`connection` is the enforcement point for the amber rule. If it appears on a screen with no person attached, that's the bug.

---

## 2 · BigAction

The home-screen action. Icon, title, subtitle, all in one 64 px+ target.

```ts
icon: ReactNode           // Sisi variant, 26px
title: string
subtitle?: string
variant: 'primary' | 'ghost'
```

Subtitle at 0.8em, wraps to two lines without changing the component's shape. Malay and Tamil strings run 20% longer than English — this component must never be width-constrained to the English label.

---

## 3 · TextField

```ts
label: string             // always visible, never a placeholder standing in
hint?: string             // why we're asking, for anything sensitive
error?: string
optional?: boolean        // mark OPTIONAL, never mark required with an asterisk
inputMode, autoComplete
```

Label above, 14 px uppercase Neutral 700 (Latin only — no uppercase or tracking on Tamil or CJK). Input 56 px, Neutral 500 border at 3.78:1, Teal 900 border and focus ring on focus. Error below in Error text with an icon, and **the entered value is never wiped**. Validate inline as they type, not only on submit.

Placeholder is never the only source of a required instruction. A placeholder disappears on focus and an older user loses the field's purpose with it.

---

## 4 · RadioCards

Single choice from a visible set — the workhorse of the seven-step request flow.

```ts
options: { value, label, description?, icon? }[]
columns: 1 | 2            // 1 for text-heavy, 2 for a category grid
```

Each card 64 px minimum, full width at `columns: 1`. Selected: 2.5 px Teal 900 border, Teal 50 fill, and a visible tick — border plus fill plus tick, because colour alone is never the signal. Whole card is the target, not just the radio dot.

---

## 5 · Select

Native `<select>` on mobile — the OS picker is bigger, familiar, and better with a screen reader than anything custom. Custom dropdowns are where accessibility quietly breaks. For search over long lists (areas, destinations), use a full-screen search sheet rather than a typeahead dropdown.

---

## 6 · Sheet

Bottom sheet for language, text size, filters, safety options.

```ts
title: string
dismissible?: boolean     // false for safety sheets
children
```

Rounded 18 px top corners, scrim at Neutral 900/45%, focus trapped, Escape closes, a real Close button with a word — never a bare ✕. Max height 96%, content scrolls. Opens with a 180 ms ease-out; respects `prefers-reduced-motion`.

---

## 7 · Card

`image? → title → meta → action`, in that order, 14 px radius, Neutral 500 border, subtle shadow. Reflows 4→2→1 without redesign.

Variants: `plain` · `request` (4 px amber left border) · `person` (photo + trust line) · `status` (semantic fill).

Uniform grids of identical cards are forgettable. Where one item in a set genuinely matters more — the next upcoming Teman, the urgent incident — let it be visibly larger or differently treated rather than every card competing equally and none winning.

---

## 8 · Pill

Small status and category label. `neutral · looking · matched · live · completed · error`.

Semantic fills only, each paired with a glyph so state never rests on colour. Amber is not available as a Pill variant — connection state is carried by Sisi, not by a badge.

Pills are one device, not the only device. If every status in the product is a pill, everything starts to look interchangeable.

---

## 9 · Banner

Inline message: `info · warning · success · error`.

Semantic tokens from the brand kit. Icon plus heading plus body plus optional action. Errors explain what happened and what to do next, in the interface's voice. They don't apologise and they're never vague.

---

## 10 · EmptyState

```ts
illustration: SisiState   // waiting | none
title, body
action?: ButtonProps
```

An empty screen is an invitation, not a blank. Sisi in its waiting or absent state, one line explaining *why* it's empty, one primary action. Never "No data" and never a bare canvas.

The most important instance is the unmatched request. It gets its own warning-toned treatment, names the reason plainly, and offers two real alternatives.

---

## 11 · Stepper

Progress across a multi-step flow.

Words, not just dots: "Step 3 of 7". Completed steps carry a tick, current is filled, upcoming are outlined. Back is always available and never destroys input. Autosave status shown quietly as "Saved" — no explicit save button.

Never auto-advance a step. A screen that moves on its own is a screen that was never read.

---

## 12 · NavBar

Four flat tabs, always labelled, always visible. No hamburger — a hidden menu costs a tap and a comprehension step, and both are expensive for this audience.

66 px tall, whole tab is the target, 24 px icon plus a 12 px label. Active state is colour **and** a filled icon shape. Unread badge as a dot plus a count.

12 px is the one deliberate exception to the 15 px text floor: the label is always paired with an icon and never carries information alone.

---

## 13 · LanguageSheet

The most important small component in the product.

Four options, fixed order forever — English, Bahasa Melayu, தமிழ், 中文. Each shows its own script at 21 px with the English name beneath at 14 px. Never translated, never reordered, no flags. Reachable from the sticky home bar, from Account, and from every onboarding and verification screen.

Switching re-renders font family, line-height, size bump and `lang` attribute together, and persists to the account, not the device.

---

## 14 · TextSizeControl

Three options — Standard 18, Large 22, Extra large 26 — each rendered *at its own size* so the choice is visible rather than described. Persists per account. Elder view defaults to Large.

Applies on top of the OS font setting. Test at both maxima together; that combination is where layouts actually break.

---

## 15 · Sisi

The brand motif as a component. The single most-reused element in the product.

```ts
state: 'waiting' | 'answered' | 'together' | 'moment'
size: number              // 24 · 26 · 76 · 118
tone: 'light' | 'dark'    // dark = on Teal 900 panels
```

| State | Left | Right | Join | Appears on |
|---|---|---|---|---|
| `waiting` | Teal 900 | Dashed, Neutral 300 | — | Published request, empty states, waiting notifications |
| `answered` | Teal 900 | Amber 400 | — | Match screen, app icon, match notification |
| `together` | Teal 900 | Amber 400 | Teal 800 | Live session |
| `moment` | Amber 300 | Amber 300 | Amber 300 | Completed — the only badge the product gives |

Rendered as inline SVG so it scales with text size. Always `aria-hidden` with the state carried by adjacent text, because a shape is never the sole signal.

---

## Build order

1. Tokens as CSS variables — colour, type, spacing, radius, per-script font and line-height
2. Sisi (15) — everything else references it
3. Button (1), TextField (3), Card (7)
4. RadioCards (4), Stepper (11) — these two unlock the whole request flow
5. LanguageSheet (13), TextSizeControl (14) — build early, they change every other component's rendering
6. Sheet (6), NavBar (12), BigAction (2)
7. Pill (8), Banner (9), EmptyState (10), Select (5)

Build a single page rendering every component in every state, in four languages at three text sizes. Keep it at `/dev/components`, in the repo, forever. It is faster to check a regression there than in the app, and it is the only practical way to verify 15 components × 5 states × 4 languages × 3 sizes without opening 129 screens.
