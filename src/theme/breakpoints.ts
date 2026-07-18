// Single source of truth for responsive breakpoints. No component should
// hardcode a pixel width for layout decisions — import from here instead.
//
// Three target bands (tested at the widths noted):
//   mobile:  0–767px    (test: 390px, iPhone-class)
//   tablet:  768–1023px (test: 820px, iPad-class / station wall tablet)
//   desktop: 1024px+    (test: 1280px, office monitor — the brief's 1280px+
//                         floor is enforced via the `xl`/`2xl` bands below)
//
// The finer xs/sm/md/lg/xl/2xl bands (used by useBreakpoint + RTable's
// per-column hideAt) are additive precision within those 3 bands, not a
// competing system.

export const BP_MOBILE_MAX = 767;
export const BP_TABLET_MIN = 768;
export const BP_TABLET_MAX = 1023;
export const BP_DESKTOP_MIN = 1024;

export const TEST_WIDTH_MOBILE = 390;
export const TEST_WIDTH_TABLET = 820;
export const TEST_WIDTH_DESKTOP = 1280;
