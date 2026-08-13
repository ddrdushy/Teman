# 15 · Visual assets

> Reconstructed 2026-08-14 from the visual-assets goal directive — the
> original document was not in the handover set. Slot assignments below are
> my mapping of the eight supplied images to surfaces; flagged for review.

## Photography

Eight images, supplied 2026-08-14 (AI-generated, reviewed one by one:
**no faces anywhere** — places, hands, objects only, per the rule). They are
placeholders standing in for real photography of real places and volunteers,
to be re-shot after the pilot. Sources live in `images/` (not committed);
the pipeline `scripts/build-images.mjs` emits AVIF/WebP/JPEG + LQIP into
`public/images/` and the manifest module `src/lib/images.generated.mjs`.

| # | slot | source | aspect | used on |
|---|------------------|--------|-------|-------------------------------------------|
| 1 | `waiting-room` | (1) | 3:2 | Landing · "Why this exists" |
| 2 | `arcade` | (2) | 2:3 | `/volunteer` header |
| 3 | `market` | (3) | 3:2 | `/how-it-works` header |
| 4 | `kopitiam` | (4) | 1:1 | `/families` header |
| 5 | `bus-stop` | (5) | 3:2 | `/safety` header |
| 6 | `hands` | (6) | 1:1 | Landing · "What Teman is not" closing |
| 7 | `corridor` | (7) | 2:3 | `/organisations` header |
| 8 | `chair-ticket` | (8) | 3:2 | `/need-a-teman` header |

The images carry the brand's subject — waiting, absence, the places where
someone should be beside you — never illness, never staged joy.

## Alt text

Alt text is an i18n key per slot: `site.img.<slot>` in all four catalogues
(ms/ta/zh currently carry the English line pending the human translation
pass, tracked in /admin/translations like all other copy).

| slot | en |
|------|----|
| waiting-room | A row of empty clinic chairs; one umbrella and a bag left on a seat |
| arcade | A covered five-foot walkway outside old shophouses, wet after rain |
| market | A wet market aisle with vegetables stacked and a rattan basket |
| kopitiam | A kopitiam marble table with two cups of tea, a newspaper and reading glasses |
| bus-stop | An empty bus stop bench under one light, at dusk after rain |
| hands | An older hand and a younger hand resting side by side on a wooden table |
| corridor | The open walkway of an apartment block, slippers outside a door |
| chair-ticket | A waiting-room chair holding folded glasses and a queue number ticket |

## Rules (from the goal directive)

- No AI-generated faces anywhere. Places, hands, objects only.
- No image without explicit dimensions — layout shift is a defect.
- Hero/above-fold images load eager; everything else lazy.
- Every image ships AVIF + WebP + JPEG at 1x/2x with an inline blur
  placeholder (LQIP) so nothing pops or shifts.

## Pipeline

`pnpm build:images` → for each slot: `<slot>-<w>.avif/.webp/.jpg` at the
display width and 2× it, plus a 24px WebP inlined as base64 LQIP. The
generated manifest records widths, intrinsic ratio and LQIP; `<Photo>`
(src/components/Photo.tsx) is the only way images are placed.
