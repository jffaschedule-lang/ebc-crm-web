import { ReactNode, useEffect } from 'react';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint, isMobile } from '../../hooks/useBreakpoint';
import { MIN_TAP_TARGET } from '../../theme/spacing';
import { XIcon } from './Icon';

interface ModalProps {
  t: ThemeTokens;
  bp: Breakpoint;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Desktop: centered popup, max-width 500px. Mobile (xs/sm): full-screen
 * bottom sheet. Both read from the same theme tokens as the rest of the app.
 */
export function Modal({ t, bp, title, onClose, children }: ModalProps) {
  const mobile = isMobile(bp);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: mobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          background: t.surface,
          border: mobile ? 'none' : `1px solid ${t.border}`,
          borderRadius: mobile ? '14px 14px 0 0' : 10,
          boxShadow: t.shadow,
          width: '100%',
          maxWidth: mobile ? '100%' : 500,
          maxHeight: mobile ? '92vh' : '88vh',
          height: mobile ? '92vh' : undefined,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${t.border}`,
            position: 'sticky',
            top: 0,
            background: t.surface,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 650, color: t.text, margin: 0 }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: MIN_TAP_TARGET,
              height: MIN_TAP_TARGET,
              margin: -10,
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              color: t.textMuted,
              cursor: 'pointer',
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
