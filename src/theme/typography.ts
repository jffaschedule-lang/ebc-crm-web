// Two-face type system: one UI sans for everything, one tabular-numeral
// monospace for anything that is a number a supervisor needs to scan down a
// column (hours, employee IDs, dates, currency). No decorative display face —
// this is glanced at between calls, not browsed.

export const FONT_UI =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FONT_MONO =
  'ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Consolas, monospace';

/** Apply to any cell/value that is a number, code, or date meant to align in a column. */
export const tabularNumStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontVariantNumeric: 'tabular-nums',
};

export const type = {
  display: { fontSize: 22, fontWeight: 700, lineHeight: 1.2 },
  pageTitle: { fontSize: 17, fontWeight: 650, lineHeight: 1.3 },
  heading: { fontSize: 14, fontWeight: 650, lineHeight: 1.35 },
  body: { fontSize: 13, fontWeight: 400, lineHeight: 1.5 },
  label: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
  chip: { fontSize: 11, fontWeight: 600, lineHeight: 1.3 },
} as const;
