// Small hand-built stroke-icon set — deliberately not an emoji or an
// external icon-library import. Instrument-panel feel: consistent stroke
// weight, no fill, currentColor so every icon is automatically theme-aware
// without a single hardcoded hex value.

interface IconProps {
  size?: number;
  style?: React.CSSProperties;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function ShieldIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}

export function UsersIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4.4 4.5 2.4 4.5 5.8" />
    </svg>
  );
}

export function RefreshIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M20 11a8 8 0 10-2.3 5.7" />
      <path d="M20 6v5h-5" />
    </svg>
  );
}

export function ClipboardIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M8.5 11h7M8.5 15h7" />
    </svg>
  );
}

export function PlusIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CalendarIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  );
}

export function ClockIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function DollarIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M12 2.5v19" />
      <path d="M16.5 6.8c0-1.6-2-2.8-4.5-2.8s-4.5 1.2-4.5 3c0 4 9 2 9 6 0 1.8-2 3-4.5 3s-4.5-1.2-4.5-2.8" />
    </svg>
  );
}

export function ChartIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2.5 20.5h19" />
    </svg>
  );
}

export function AlarmIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.3 1.6" />
      <path d="M5 4l-2 2M19 4l2 2" />
    </svg>
  );
}

export function LockIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 018 0V11" />
    </svg>
  );
}

export function SearchIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.7-4.7" />
    </svg>
  );
}

export function GearIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M17.7 17.7l-1.4-1.4M7.7 7.7L6.3 6.3" />
    </svg>
  );
}

export function MoreIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PaletteIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M12 3a9 8.5 0 100 17c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a4 4 0 004-4c0-4-3.6-7.2-8-7.2z" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.3" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AlertTriangleIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M12 4.2L21 19H3L12 4.2z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17" r="0.15" fill="currentColor" />
    </svg>
  );
}

export function AlertCircleIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.15" fill="currentColor" />
    </svg>
  );
}

export function LogOutIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...base(size)} style={style} aria-hidden>
      <path d="M9 20H5a1 1 0 01-1-1V5a1 1 0 011-1h4" />
      <path d="M15.5 16.5L20 12l-4.5-4.5M9.5 12H20" />
    </svg>
  );
}
