import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { tokensFor } from '../../theme/tokens';
import { useBreakpoint, isMobile } from '../../hooks/useBreakpoint';
import { NAV_ITEMS } from '../../config/nav';
import { SearchIcon } from '../ui/Icon';

export function Topbar() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const location = useLocation();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  const current = NAV_ITEMS.find((n) => (n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)));

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
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 17, fontWeight: 650, color: t.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {current?.label ?? 'EBC Workforce CRM'}
        </h1>
        <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>EBC / JPFD Workforce CRM</p>
      </div>

      {!mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <SearchIcon
              size={14}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.textFaint }}
            />
            <input
              type="search"
              placeholder="Search…"
              aria-label="Search"
              style={{
                padding: '7px 10px 7px 30px',
                borderRadius: 6,
                border: `1px solid ${t.border}`,
                background: t.surfaceAlt,
                color: t.text,
                fontSize: 13,
                width: 200,
              }}
            />
          </div>
          <button
            type="button"
            style={{
              padding: '7px 12px',
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            New Record
          </button>
        </div>
      )}
    </header>
  );
}
