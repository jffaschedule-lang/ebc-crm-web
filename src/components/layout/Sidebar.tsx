import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useBreakpoint, isMobile } from '../../hooks/useBreakpoint';
import { usePendingLeaveCount } from '../../hooks/usePendingLeaveCount';
import { tokensFor } from '../../theme/tokens';
import { NAV_ITEMS } from '../../config/nav';
import { useAuth } from '../../auth/useAuth';
import { PaletteIcon, LogOutIcon } from '../ui/Icon';
import { MIN_TAP_TARGET } from '../../theme/spacing';

const WIDTH_BY_BP: Record<string, number> = {
  xs: 260,
  sm: 260,
  md: 208,
  lg: 220,
  xl: 226,
  '2xl': 248,
};

export function Sidebar() {
  const theme = useAppStore((s) => s.theme);
  const cycleTheme = useAppStore((s) => s.cycleTheme);
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
      <div style={{ height: 4, background: `linear-gradient(90deg, ${t.pA}, ${t.train})` }} />

      <div style={{ padding: '16px 14px', borderBottom: `1px solid ${t.sidebarActiveBg}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ fontSize: 14, color: '#fff', letterSpacing: 0.2 }}>EBC Workforce CRM</strong>
        </div>
        <div style={{ fontSize: 10, color: t.textFaint, marginTop: 4, letterSpacing: 0.5 }}>
          PROTOTYPE · DUMMY DATA
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => {
          const ItemIcon = item.icon;
          return (
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
                padding: mobile ? '12px 16px' : '9px 16px',
                minHeight: mobile ? MIN_TAP_TARGET : undefined,
                fontSize: 13,
                textDecoration: 'none',
                color: isActive ? '#fff' : t.sidebarText,
                background: isActive ? t.sidebarActiveBg : 'transparent',
                borderLeft: `3px solid ${isActive ? t.pA : 'transparent'}`,
              })}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ItemIcon size={17} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </span>
              {item.path === '/leave' && pendingCount > 0 && (
                <span
                  style={{
                    background: t.pA,
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '1px 6px',
                    fontFamily: 'ui-monospace, SF Mono, Consolas, monospace',
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
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
              flexShrink: 0,
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
            onClick={cycleTheme}
            aria-label="Cycle theme"
            style={{
              flex: 1,
              minHeight: mobile ? MIN_TAP_TARGET : 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '6px 8px',
              borderRadius: 6,
              border: `1px solid ${t.sidebarActiveBg}`,
              background: 'transparent',
              color: t.sidebarText,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <PaletteIcon size={15} />
            Theme
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Sign out"
            style={{
              flex: 1,
              minHeight: mobile ? MIN_TAP_TARGET : 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '6px 8px',
              borderRadius: 6,
              border: `1px solid ${t.sidebarActiveBg}`,
              background: 'transparent',
              color: t.sidebarText,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <LogOutIcon size={15} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
