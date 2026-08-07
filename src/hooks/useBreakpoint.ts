import { useEffect, useState } from 'react';
import { BP_DESKTOP_MIN, BP_TABLET_MIN } from '../theme/breakpoints';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Real CSS media queries — the single source of truth for both this hook
// and the matching @media rules in src/index.css (keep the two in sync if
// you ever change a boundary). window.matchMedia() is backed directly by
// the browser's CSS engine, the exact same code path a stylesheet's
// `@media` rule uses — so this hook reacts to genuine viewport changes
// (including devtools device-mode and OS-level display scaling) instead of
// polling window.innerWidth on every resize event.
//
// We still need this as a JS hook — not pure CSS — because some
// breakpoint changes swap which React component renders (an RTable becomes
// a MobileList, a tab strip becomes a <select>). CSS alone can restyle an
// element but can't change what's mounted; matchMedia is the standard way
// libraries like MUI/Chakra bridge that gap.
const QUERIES: Record<Breakpoint, string> = {
  xs: '(max-width: 374px)',
  sm: '(min-width: 375px) and (max-width: 639px)',
  md: `(min-width: 640px) and (max-width: ${BP_TABLET_MIN - 1}px)`,
  lg: `(min-width: ${BP_TABLET_MIN}px) and (max-width: ${BP_DESKTOP_MIN - 1}px)`,
  xl: `(min-width: ${BP_DESKTOP_MIN}px) and (max-width: 1279px)`,
  '2xl': '(min-width: 1280px)',
};

const ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

function computeBreakpoint(): Breakpoint {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return '2xl';
  for (const bp of ORDER) {
    if (window.matchMedia(QUERIES[bp]).matches) return bp;
  }
  return '2xl';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(computeBreakpoint);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const lists = ORDER.map((key) => window.matchMedia(QUERIES[key]));
    const handleChange = () => setBp(computeBreakpoint());
    lists.forEach((mql) => mql.addEventListener('change', handleChange));
    // Re-sync on mount in case the viewport changed between the initial
    // render and this effect running.
    handleChange();
    return () => {
      lists.forEach((mql) => mql.removeEventListener('change', handleChange));
    };
  }, []);

  return bp;
}

export function isMobile(bp: Breakpoint): boolean {
  return bp === 'xs' || bp === 'sm';
}

export function isTablet(bp: Breakpoint): boolean {
  return bp === 'md' || bp === 'lg';
}

export function isDesktop(bp: Breakpoint): boolean {
  return bp === 'xl' || bp === '2xl';
}
