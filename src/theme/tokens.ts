// Every color used anywhere in the app must come from here — no hardcoded
// hex values in component files (see project constraint #11).

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  pA: string; // platoon A / brand red
  pB: string; // platoon B / blue
  pC: string; // platoon C / green
  warn: string;
  warnBg: string;
  crit: string;
  critBg: string;
  ok: string;
  okBg: string;
  info: string;
  infoBg: string;
  metricBg: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  shadow: string;
}

export const LIGHT: ThemeTokens = {
  bg: '#f4f5f7',
  surface: '#ffffff',
  surfaceAlt: '#f8f9fb',
  border: '#e2e4e9',
  text: '#14161a',
  textMuted: '#5b6270',
  textFaint: '#9aa1ad',
  pA: '#b91c1c',
  pB: '#1d4ed8',
  pC: '#15803d',
  warn: '#92650b',
  warnBg: '#fef3c7',
  crit: '#b91c1c',
  critBg: '#fee2e2',
  ok: '#15803d',
  okBg: '#dcfce7',
  info: '#1d4ed8',
  infoBg: '#dbeafe',
  metricBg: '#f1f2f5',
  sidebarBg: '#14161a',
  sidebarText: '#c9cdd6',
  sidebarActiveBg: '#22252c',
  shadow: '0 1px 3px rgba(15, 17, 21, 0.08)',
};

export const DARK: ThemeTokens = {
  bg: '#0f1115',
  surface: '#181b21',
  surfaceAlt: '#1f232b',
  border: '#2b303a',
  text: '#eef0f4',
  textMuted: '#9aa1ad',
  textFaint: '#6b7280',
  pA: '#ef4444',
  pB: '#3b82f6',
  pC: '#22c55e',
  warn: '#facc15',
  warnBg: '#3f320b',
  crit: '#f87171',
  critBg: '#3f1414',
  ok: '#4ade80',
  okBg: '#0f3320',
  info: '#60a5fa',
  infoBg: '#12213f',
  metricBg: '#1f232b',
  sidebarBg: '#0b0c0f',
  sidebarText: '#c9cdd6',
  sidebarActiveBg: '#1a1d24',
  shadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
};

export function tokensFor(theme: 'light' | 'dark'): ThemeTokens {
  return theme === 'dark' ? DARK : LIGHT;
}
