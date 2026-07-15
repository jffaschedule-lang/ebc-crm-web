import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useBreakpoint, isMobile } from '../../hooks/useBreakpoint';
import { usePendingLeaveCount } from '../../hooks/usePendingLeaveCount';
import { tokensFor } from '../../theme/tokens';
import { NAV_ITEMS } from '../../config/nav';
import { useAuth } from '../../auth/useAuth';

const WIDTH_BY_BP: Record<string, number> = {
  xs: 240,
  sm: 240,
  md: 200,
  lg: 210,
  xl: 220,
  '2xl': 240,
};

export function Sidebar() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const bp = useBreakpoint();
  const t = tokensFor(theme);
  const pendingCount = usePendingLeaveCount();
  const { user, signOut } = useAuth();

  const mobile = isMobile(bp);
  const width = WIDTH_BY_BP[bp] ?? 220;

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        background: t.sidebarBg,
        color: t.sidebarText,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: mobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: 40,
        transform: mobile && !drawerOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.2s ease',
      }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${t.pA}, ${t.warn})` }} />

      <div style={{ padding: '16px 14px', borderBottom: `1px solid ${t.sidebarActiveBg}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🚒</span>
          <strong style={{ fontSize: 14, color: '#fff' }}>EBC Workforce CRM</strong>
        </div>
        <div style={{ fontSize: 10, color: t.textFaint, marginTop: 4, letterSpacing: 0.5 }}>
          PROTOTYPE · DUMMY DATA
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => mobile && setDrawerOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '9px 16px',
              fontSize: 13,
              textDecoration: 'none',
              color: isActive ? '#fff' : t.sidebarText,
              background: isActive ? t.sidebarActiveBg : 'transparent',
              borderLeft: `3px solid ${isActive ? t.pA : 'transparent'}`,
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </span>
            {item.path === '/leave' && pendingCount > 0 && (
              <span
                style={{
                  background: t.pA,
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 10,
                  padding: '1px 6px',
                }}
              >
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 14, borderTop: `1px solid ${t.sidebarActiveBg}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: t.pA,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {(user?.email ?? '?').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email ?? 'Not signed in'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: 6,
              border: `1px solid ${t.sidebarActiveBg}`,
              background: 'transparent',
              color: t.sidebarText,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: 6,
              border: `1px solid ${t.sidebarActiveBg}`,
              background: 'transparent',
              color: t.sidebarText,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
