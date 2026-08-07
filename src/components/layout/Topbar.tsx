import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { tokensFor } from '../../theme/tokens';
import { NAV_ITEMS } from '../../config/nav';

export function Topbar() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const location = useLocation();

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
    </header>
  );
}
