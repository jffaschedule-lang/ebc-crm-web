import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { tokensFor, THEME_META, ThemeName } from '../theme/tokens';
import { useBreakpoint, isMobile, isDesktop } from '../hooks/useBreakpoint';
import { Card } from '../components/ui/Card';
import { AlertBar } from '../components/ui/AlertBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MIN_TAP_TARGET } from '../theme/spacing';
import { GearIcon, UsersIcon, BellIcon, ShieldIcon, MapIcon, SunIcon, MoonIcon, CheckCircleIcon } from '../components/ui/Icon';
import { useMyRole } from '../hooks/useMyRole';
import { SystemSettingsTab } from './settings/SystemSettingsTab';
import { UserRolesTab } from './settings/UserRolesTab';
import { NotificationsTab } from './settings/NotificationsTab';
import { DutyBoardConfigTab } from './settings/DutyBoardConfigTab';
import { DistrictsTab } from './settings/DistrictsTab';

const THEME_ORDER: ThemeName[] = ['dark', 'light'];

type TabId = 'system' | 'roles' | 'notifications' | 'duty-config' | 'districts';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

const TABS: TabDef[] = [
  { id: 'system', label: 'System Settings', icon: GearIcon },
  { id: 'roles', label: 'User Roles', icon: UsersIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'duty-config', label: 'Duty Board Config', icon: ShieldIcon },
  { id: 'districts', label: 'Districts & Companies', icon: MapIcon },
];

export default function Settings() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const desktop = isDesktop(bp);
  const { isAdmin, isSupervisorOrAdmin, isLoading: roleLoading } = useMyRole();

  const [tab, setTab] = useState<TabId>('system');

  if (roleLoading) {
    return <LoadingSpinner t={t} size={32} />;
  }

  if (!isSupervisorOrAdmin) {
    return (
      <AlertBar t={t} type="warn">
        Settings requires the supervisor or admin role. Ask your admin if you need access to something here.
      </AlertBar>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960 }}>
      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 4 }}>Theme</h3>
        <p style={{ fontSize: 12, color: t.textMuted, marginTop: 0, marginBottom: 14 }}>
          Light or dark — pick what's easiest on your eyes right now. Your choice is saved to this device.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 12,
            maxWidth: mobile ? undefined : 480,
          }}
        >
          {THEME_ORDER.map((name) => {
            const meta = THEME_META[name];
            const tokens = tokensFor(name);
            const selected = theme === name;
            const ModeIcon = name === 'dark' ? MoonIcon : SunIcon;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTheme(name)}
                aria-pressed={selected}
                style={{
                  textAlign: 'left',
                  minHeight: MIN_TAP_TARGET,
                  padding: 14,
                  borderRadius: 10,
                  border: `2px solid ${selected ? t.pA : t.border}`,
                  background: tokens.bg,
                  cursor: 'pointer',
                  boxShadow: selected ? `0 0 0 3px ${t.pA}33` : 'none',
                  transition: 'border-color 120ms ease, box-shadow 120ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[tokens.ok, tokens.train, tokens.info, tokens.crit].map((c, i) => (
                      <span key={`${c}-${i}`} style={{ width: 16, height: 16, borderRadius: '50%', background: c, display: 'inline-block' }} />
                    ))}
                  </div>
                  <ModeIcon size={16} style={{ color: tokens.textMuted }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 650, color: tokens.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {meta.label}
                  {selected && <CheckCircleIcon size={14} style={{ color: t.pA }} />}
                </div>
                <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>{meta.description}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {mobile ? (
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as TabId)}
          style={{
            padding: '10px 12px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {TABS.map((tb) => (
            <option key={tb.id} value={tb.id}>{tb.label}</option>
          ))}
        </select>
      ) : (
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${t.border}`, flexWrap: 'wrap' }}>
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id)}
                aria-pressed={active}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  minHeight: MIN_TAP_TARGET,
                  border: 'none',
                  borderBottom: `2px solid ${active ? t.pA : 'transparent'}`,
                  background: 'transparent',
                  color: active ? t.text : t.textMuted,
                  fontWeight: active ? 650 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {desktop && <Icon size={15} />}
                {tb.label}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'system' && <SystemSettingsTab t={t} bp={bp} isAdmin={isAdmin} />}
      {tab === 'roles' && <UserRolesTab t={t} bp={bp} isAdmin={isAdmin} roleLoading={roleLoading} />}
      {tab === 'notifications' && <NotificationsTab t={t} bp={bp} isAdmin={isAdmin} />}
      {tab === 'duty-config' && <DutyBoardConfigTab t={t} bp={bp} isAdmin={isAdmin} />}
      {tab === 'districts' && <DistrictsTab t={t} bp={bp} />}
    </div>
  );
}
