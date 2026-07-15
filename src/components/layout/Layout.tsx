import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { useAppStore } from '../../store/useAppStore';
import { useBreakpoint, isMobile } from '../../hooks/useBreakpoint';
import { tokensFor } from '../../theme/tokens';

export function Layout() {
  const theme = useAppStore((s) => s.theme);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const bp = useBreakpoint();
  const t = tokensFor(theme);
  const mobile = isMobile(bp);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg }}>
      <Sidebar />
      {mobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 35 }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ flex: 1, padding: mobile ? '16px 12px 72px' : '20px 24px', minWidth: 0 }}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
