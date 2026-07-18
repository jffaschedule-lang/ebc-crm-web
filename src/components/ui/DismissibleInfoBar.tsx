import { useState } from 'react';
import { ThemeTokens } from '../../theme/tokens';
import { XIcon, AlertCircleIcon } from './Icon';

interface DismissibleInfoBarProps {
  t: ThemeTokens;
  /** sessionStorage key — shared across pages so dismissing on one hides it everywhere this session. */
  storageKey: string;
  children: string;
}

function wasDismissed(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Shows once per browser session; dismissing writes to sessionStorage so it stays gone until the tab closes. */
export function DismissibleInfoBar({ t, storageKey, children }: DismissibleInfoBarProps) {
  const [dismissed, setDismissed] = useState(() => wasDismissed(storageKey));

  if (dismissed) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // sessionStorage unavailable (private mode, etc.) — dismiss for this render only.
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        borderLeft: `4px solid ${t.info}`,
        background: t.infoBg,
        color: t.text,
        borderRadius: 6,
        padding: '10px 14px',
        fontSize: 13,
        lineHeight: 1.5,
        marginBottom: 16,
      }}
    >
      <AlertCircleIcon size={16} style={{ color: t.info, flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1 }}>{children}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          flexShrink: 0,
          background: 'transparent',
          border: 'none',
          borderRadius: 6,
          color: t.textMuted,
          cursor: 'pointer',
        }}
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}
