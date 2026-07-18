import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useBreakpoint, isMobile } from '../../hooks/useBreakpoint';
import { usePendingLeaveCount } from '../../hooks/usePendingLeaveCount';
import { tokensFor } from '../../theme/tokens';
import { BOTTOM_NAV_ITEMS } from '../../config/nav';
import { MoreIcon } from '../ui/Icon';
import { MIN_TAP_TARGET } from '../../theme/spacing';

export function BottomNav() {
  const theme = useAppStore((s) => s.theme);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const bp = useBreakpoint();
  const t = tokensFor(theme);
  const pendingCount = usePendingLeaveCount();

  if (!isMobile(bp)) return null;

  const itemStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: MIN_TAP_TARGET,
    padding: '6px 0',
    textDecoration: 'none',
    border: 'none',
    background: 'none',
    fontSize: 10,
    position: 'relative',
    cursor: 'pointer',
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        background: t.surface,
        borderTop: `1px solid ${t.border}`,
        zIndex: 30,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const ItemIcon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              ...itemStyle,
              color: isActive ? t.pA : t.textMuted,
            })}
          >
            <ItemIcon size={19} />
            <span>{item.label}</span>
            {item.path === '/leave' && pendingCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: '28%',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: t.pA,
                }}
              />
            )}
          </NavLink>
        );
      })}
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        aria-label="More"
        aria-expanded={drawerOpen}
        style={{ ...itemStyle, color: drawerOpen ? t.pA : t.textMuted }}
      >
        <MoreIcon size={19} />
        <span>More</span>
      </button>
    </nav>
  );
}
