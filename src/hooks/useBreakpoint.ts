import { useEffect, useState } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

function computeBreakpoint(width: number): Breakpoint {
  if (width < 375) return 'xs';
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    computeBreakpoint(typeof window !== 'undefined' ? window.innerWidth : 1280)
  );

  useEffect(() => {
    function handleResize() {
      setBp(computeBreakpoint(window.innerWidth));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
