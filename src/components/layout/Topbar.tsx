import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useBreakpoint, isDesktop } from '../../hooks/useBreakpoint';
import { tokensFor } from '../../theme/tokens';
import { NAV_ITEMS } from '../../config/nav';

export function Topbar() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const bp = useBreakpoint();
  const t = tokensFor(theme);
  const location = useLocation();

  const current = NAV_ITEMS.find((n) => (n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)));
  const desktop = isDesktop(bp);
  const showHamburger = !desktop;
  const mobile = bp === 'xs' || bp === 'sm';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 20px',
        borderBottom: `1px solid ${t.border}`,
        background: t.surface,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {showHamburger && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            style={{
              border: `1px solid ${t.border}`,
              background: t.surfaceAlt,
              borderRadius: 6,
              padding: '6px 10px',
              cursor: 'pointer',
              color: t.text,
            }}
          >
            ☰
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 15, color: t.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {current?.label ?? 'EBC Workforce CRM'}
          </h1>
          <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>EBC / JPFD Workforce CRM</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!mobile && (
          <input
            type="search"
            placeholder="Search…"
            style={{
              padding: '7px 10px',
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: t.surfaceAlt,
              color: t.text,
              fontSize: 13,
              width: 200,
            }}
          />
        )}
        {!mobile && (
          <button
            type="button"
            style={{
              padding: '7px 12px',
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            New Record
          </button>
        )}
        {mobile && (
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              border: `1px solid ${t.border}`,
              background: t.surfaceAlt,
              borderRadius: 6,
              padding: '6px 10px',
              cursor: 'pointer',
              color: t.text,
            }}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        )}
      </div>
    </header>
  );
}
