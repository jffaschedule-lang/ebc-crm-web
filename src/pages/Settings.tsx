import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { tokensFor, THEME_META, ThemeName } from '../theme/tokens';
import { useBreakpoint, isMobile, isDesktop } from '../hooks/useBreakpoint';
import { Card } from '../components/ui/Card';
import { MIN_TAP_TARGET } from '../theme/spacing';
import { GearIcon, UsersIcon, BellIcon, ShieldIcon, MapIcon } from '../components/ui/Icon';
import { useMyRole } from '../hooks/useMyRole';
import { SystemSettingsTab } from './settings/SystemSettingsTab';
import { UserRolesTab } from './settings/UserRolesTab';
import { NotificationsTab } from './settings/NotificationsTab';
import { DutyBoardConfigTab } from './settings/DutyBoardConfigTab';
import { DistrictsTab } from './settings/DistrictsTab';

const THEME_ORDER: ThemeName[] = ['command', 'daywatch', 'field'];

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
  const { isAdmin, isLoading: roleLoading } = useMyRole();

  const [tab, setTab] = useState<TabId>('system');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960 }}>
      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 4 }}>Theme</h3>
        <p style={{ fontSize: 12, color: t.textMuted, marginTop: 0, marginBottom: 14 }}>
          Choose the palette that fits how you're using the app right now. Your choice is saved to this device.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {THEME_ORDER.map((name) => {
            const meta = THEME_META[name];
            const tokens = tokensFor(name);
            const selected = theme === name;
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
                }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[tokens.ok, tokens.train, tokens.info, tokens.crit].map((c) => (
                    <span key={c} style={{ width: 16, height: 16, borderRadius: '50%', background: c, display: 'inline-block' }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 650, color: tokens.text }}>
                  {meta.label} {selected && '✓'}
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

      {tab === 'system' && <SystemSettingsTab t={t} bp={bp} />}
      {tab === 'roles' && <UserRolesTab t={t} bp={bp} isAdmin={isAdmin} roleLoading={roleLoading} />}
      {tab === 'notifications' && <NotificationsTab t={t} bp={bp} />}
      {tab === 'duty-config' && <DutyBoardConfigTab t={t} bp={bp} />}
      {tab === 'districts' && <DistrictsTab t={t} bp={bp} />}
    </div>
  );
}
