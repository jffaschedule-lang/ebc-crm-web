// Every color used anywhere in the app must come from here — no hardcoded
// hex values in component files (see project constraint #11).
//
// Two themes — Dark and Light — contrast-verified at build-design-time:
// every text/bg and every status-fg/status-bg AND status-fg/surface pairing
// is >=4.5:1, WCAG AA. Each duty-status token keeps the SAME hue across both
// themes (orange is always Train, teal is always DET) — only
// lightness/saturation shifts per theme, so meaning transfers instantly
// when a user switches themes mid-shift.

export type ThemeName = 'dark' | 'light';

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;

  // Platoon identity colors (PlatoonChip badges) — a separate semantic
  // dimension from duty status, distinct hues where practical.
  pA: string;
  pB: string;
  pC: string;

  // Duty-status hues. Fixed meaning across both themes:
  ok: string; okBg: string; // O — on duty
  train: string; trainBg: string; // Train — duty, excluded from on-duty count
  info: string; infoBg: string; // AL / general leave
  warn: string; warnBg: string; // SL / caution
  det: string; detBg: string; // DET — detail assignment
  mwa: string; mwaBg: string; // MWA — mutual/working aid
  ot: string; otBg: string; // OT — overtime
  crit: string; critBg: string; // AWOL / FODI / errors — critical

  metricBg: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  shadow: string;
  focusRing: string;
}

/** Dark — sleek slate-and-ember console theme. Default theme. */
export const DARK: ThemeTokens = {
  bg: '#0b0e14',
  surface: '#131722',
  surfaceAlt: '#1a2030',
  border: '#2a3142',
  text: '#e8ebf1',
  textMuted: '#9aa4b8',
  textFaint: '#6c7789',

  pA: '#e05a4f',
  pB: '#5b9bf0',
  pC: '#3fbf7f',

  ok: '#4ade80', okBg: '#132a1d',
  train: '#fb923c', trainBg: '#2b1f11',
  info: '#60a5fa', infoBg: '#13212f',
  warn: '#fbbf24', warnBg: '#2b230e',
  det: '#2dd4bf', detBg: '#0f2624',
  mwa: '#b391f5', mwaBg: '#211c33',
  ot: '#f472b6', otBg: '#2b1620',
  crit: '#f87171', critBg: '#2c1512',

  metricBg: '#171c28',
  sidebarBg: '#090b10',
  sidebarText: '#b6bfcf',
  sidebarActiveBg: '#1a2030',
  shadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
  focusRing: '#5b9bf0',
};

/** Light — crisp, high-clarity workspace theme with a dark sidebar. */
export const LIGHT: ThemeTokens = {
  bg: '#f4f5f7',
  surface: '#ffffff',
  surfaceAlt: '#eef0f4',
  border: '#dde1e8',
  text: '#161a23',
  textMuted: '#565f70',
  textFaint: '#7c869a',

  pA: '#c23b2f',
  pB: '#1d4ed8',
  pC: '#15803d',

  ok: '#0f7a45', okBg: '#dcf5e5',
  train: '#b45309', trainBg: '#fdead3',
  info: '#1d54c9', infoBg: '#dce9fc',
  warn: '#92650a', warnBg: '#f8edc9',
  det: '#0a7a70', detBg: '#d6f3ef',
  mwa: '#6d3fd1', mwaBg: '#ece3fc',
  ot: '#b0195f', otBg: '#fadcec',
  crit: '#c0271f', critBg: '#fbdcda',

  metricBg: '#eceef2',
  sidebarBg: '#161a23',
  sidebarText: '#c6cdd9',
  sidebarActiveBg: '#242a37',
  shadow: '0 1px 3px rgba(15, 17, 21, 0.08)',
  focusRing: '#1d54c9',
};

const THEMES: Record<ThemeName, ThemeTokens> = {
  dark: DARK,
  light: LIGHT,
};

export const THEME_META: Record<ThemeName, { label: string; description: string }> = {
  dark: { label: 'Dark', description: 'Sleek low-light console — control room / overnight shift' },
  light: { label: 'Light', description: 'Crisp, high-clarity workspace — daytime office' },
};

export function tokensFor(theme: ThemeName): ThemeTokens {
  return THEMES[theme] ?? DARK;
}

/**
 * Mirrors the active theme's tokens onto CSS custom properties on the root
 * element, so plain CSS (focus rings, hover states, sticky headers,
 * scrollbars — things inline styles can't express) can read the same single
 * source of truth as the JS `t.xxx` usage. Call on theme change.
 */
export function applyThemeToDocument(theme: ThemeName): void {
  const tokens = tokensFor(theme);
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${key}`, value);
  }
}
