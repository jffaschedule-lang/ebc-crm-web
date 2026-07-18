// Strict 4px spacing grid. Every gap/padding value in the app should come
// from here rather than an ad-hoc pixel number.
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

/** Minimum tap-target size (WCAG 2.5.5 / iOS HIG), used on mobile controls. */
export const MIN_TAP_TARGET = 44;
