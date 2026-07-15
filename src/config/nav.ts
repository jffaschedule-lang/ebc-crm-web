export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Duty Board', path: '/', icon: '🛡' },
  { label: 'Roster', path: '/roster', icon: '👥' },
  { label: 'Rotation', path: '/rotation', icon: '🔄' },
  { label: 'Duty Ledger', path: '/duty-ledger', icon: '📋' },
  { label: 'New Leave Request', path: '/leave/new', icon: '➕' },
  { label: 'Leave Records', path: '/leave', icon: '🗓' },
  { label: 'Timesheet', path: '/timesheet', icon: '⏱' },
  { label: 'Payroll', path: '/payroll', icon: '💵' },
  { label: 'Workforce Report', path: '/workforce', icon: '📊' },
  { label: 'Overtime', path: '/overtime', icon: '⏰' },
  { label: 'Shift Close', path: '/shift-close', icon: '🔒' },
  { label: 'Audit', path: '/audit', icon: '🕵' },
  { label: 'Settings', path: '/settings', icon: '⚙' },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Duty Board', path: '/', icon: '🛡' },
  { label: 'Roster', path: '/roster', icon: '👥' },
  { label: 'Leave', path: '/leave', icon: '🗓' },
  { label: 'Payroll', path: '/payroll', icon: '💵' },
  { label: 'Audit', path: '/audit', icon: '🕵' },
];
