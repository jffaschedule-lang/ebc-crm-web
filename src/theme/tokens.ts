// Every color used anywhere in the app must come from here — no hardcoded
// hex values in component files (see project constraint #11).
//
// Three themes, contrast-verified at build-design-time (see the ratio
// computation used while authoring these — every text/bg and every
// status-fg/status-bg AND status-fg/surface pairing is >=4.5:1, WCAG AA).
// Each duty-status token keeps the SAME hue across all three themes (orange
// is always Train, teal is always DET) — only lightness/saturation shifts
// per theme's purpose, so meaning transfers even if a user switches themes
// mid-shift.

export type ThemeName = 'command' | 'daywatch' | 'field';

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

  // Duty-status hues. Fixed meaning across all three themes:
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

/** Command — dark console theme for control-room / overnight-shift use. */
export const COMMAND: ThemeTokens = {
  bg: '#12161c',
  surface: '#1a2029',
  surfaceAlt: '#212834',
  border: '#333c49',
  text: '#dde2e8',
  textMuted: '#9aa5b3',
  textFaint: '#6d7887',

  pA: '#b3453f',
  pB: '#3f6fb3',
  pC: '#347a4d',

  ok: '#5fbf8a', okBg: '#16261e',
  train: '#d98e4f', trainBg: '#2c2015',
  info: '#6ea3d8', infoBg: '#16212f',
  warn: '#c9a548', warnBg: '#28230f',
  det: '#4fb8b0', detBg: '#132523',
  mwa: '#a68adf', mwaBg: '#211c2e',
  ot: '#dd7fa8', otBg: '#2a1620',
  crit: '#e6746b', critBg: '#2b1613',

  metricBg: '#1f2530',
  sidebarBg: '#0d1015',
  sidebarText: '#b7c0cc',
  sidebarActiveBg: '#212834',
  shadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
  focusRing: '#6ea3d8',
};

/** Daywatch — light, high-clarity theme for daytime office use. */
export const DAYWATCH: ThemeTokens = {
  bg: '#f2f1ec',
  surface: '#ffffff',
  surfaceAlt: '#e9e7df',
  border: '#cfccc0',
  text: '#20242b',
  textMuted: '#565f6b',
  textFaint: '#7c8591',

  pA: '#9c2e28',
  pB: '#1d4ed8',
  pC: '#15803d',

  ok: '#0f7a45', okBg: '#dcf0e3',
  train: '#a34c0a', trainBg: '#fbe6d4',
  info: '#1856b8', infoBg: '#dbe8fb',
  warn: '#8a6400', warnBg: '#f6ecc9',
  det: '#0a6b64', detBg: '#d7f0ed',
  mwa: '#6a3fc4', mwaBg: '#e8e0fa',
  ot: '#b0195f', otBg: '#f9dcea',
  crit: '#b8271f', critBg: '#fadcda',

  metricBg: '#eae8e1',
  sidebarBg: '#20242b',
  sidebarText: '#c9cdd6',
  sidebarActiveBg: '#2c313a',
  shadow: '0 1px 3px rgba(15, 17, 21, 0.1)',
  focusRing: '#1856b8',
};

/** Field — rugged, high-contrast theme for tablets mounted at the station. */
export const FIELD: ThemeTokens = {
  bg: '#242322',
  surface: '#2e2c2a',
  surfaceAlt: '#383533',
  border: '#514c47',
  text: '#f2ede4',
  textMuted: '#c2b9ac',
  textFaint: '#948b7e',

  pA: '#b3392f',
  pB: '#3568a8',
  pC: '#3d7a3f',

  ok: '#7dc468', okBg: '#26301d',
  train: '#f0a028', trainBg: '#3a2a0c',
  info: '#5b9fe0', infoBg: '#152736',
  warn: '#f2c94c', warnBg: '#3a2f0a',
  det: '#4fc4bd', detBg: '#0f2c29',
  mwa: '#b79af0', mwaBg: '#251c38',
  ot: '#f2799e', otBg: '#3a1521',
  crit: '#f5645a', critBg: '#3a1310',

  metricBg: '#343130',
  sidebarBg: '#1a1817',
  sidebarText: '#d6cec2',
  sidebarActiveBg: '#3a3634',
  shadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
  focusRing: '#f0a028',
};

const THEMES: Record<ThemeName, ThemeTokens> = {
  command: COMMAND,
  daywatch: DAYWATCH,
  field: FIELD,
};

export const THEME_META: Record<ThemeName, { label: string; description: string }> = {
  command: { label: 'Command', description: 'Dark console — control room / overnight shift' },
  daywatch: { label: 'Daywatch', description: 'Light, high-clarity — daytime office' },
  field: { label: 'Field', description: 'Rugged, high-contrast — station tablet' },
};

export function tokensFor(theme: ThemeName): ThemeTokens {
  return THEMES[theme] ?? COMMAND;
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
