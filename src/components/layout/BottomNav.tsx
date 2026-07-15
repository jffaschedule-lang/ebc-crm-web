import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useBreakpoint, isMobile } from '../../hooks/useBreakpoint';
import { usePendingLeaveCount } from '../../hooks/usePendingLeaveCount';
import { tokensFor } from '../../theme/tokens';
import { BOTTOM_NAV_ITEMS } from '../../config/nav';

export function BottomNav() {
  const theme = useAppStore((s) => s.theme);
  const bp = useBreakpoint();
  const t = tokensFor(theme);
  const pendingCount = usePendingLeaveCount();

  if (!isMobile(bp)) return null;

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
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '8px 0',
            textDecoration: 'none',
            color: isActive ? t.pA : t.textMuted,
            fontSize: 10,
            position: 'relative',
          })}
        >
          <span style={{ fontSize: 16 }} aria-hidden>
            {item.icon}
          </span>
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
      ))}
    </nav>
  );
}
