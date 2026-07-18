import {
  ShieldIcon,
  UsersIcon,
  RefreshIcon,
  ClipboardIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  DollarIcon,
  ChartIcon,
  AlarmIcon,
  LockIcon,
  SearchIcon,
  GearIcon,
} from '../components/ui/Icon';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Duty Board', path: '/', icon: ShieldIcon },
  { label: 'Roster', path: '/roster', icon: UsersIcon },
  { label: 'Rotation', path: '/rotation', icon: RefreshIcon },
  { label: 'Duty Ledger', path: '/duty-ledger', icon: ClipboardIcon },
  { label: 'New Leave Request', path: '/leave/new', icon: PlusIcon },
  { label: 'Leave Records', path: '/leave', icon: CalendarIcon },
  { label: 'Timesheet', path: '/timesheet', icon: ClockIcon },
  { label: 'Payroll', path: '/payroll', icon: DollarIcon },
  { label: 'Workforce Report', path: '/workforce', icon: ChartIcon },
  { label: 'Overtime', path: '/overtime', icon: AlarmIcon },
  { label: 'Shift Close', path: '/shift-close', icon: LockIcon },
  { label: 'Audit', path: '/audit', icon: SearchIcon },
  { label: 'Settings', path: '/settings', icon: GearIcon },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Duty Board', path: '/', icon: ShieldIcon },
  { label: 'Roster', path: '/roster', icon: UsersIcon },
  { label: 'Leave', path: '/leave', icon: CalendarIcon },
  { label: 'Payroll', path: '/payroll', icon: DollarIcon },
];
