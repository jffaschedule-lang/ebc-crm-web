import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useAuth } from '../auth/useAuth';
import { useSetupFirstAdmin } from '../hooks/useAdmin';
import { AlertBar } from '../components/ui/AlertBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MIN_TAP_TARGET } from '../theme/spacing';

type Step = 'welcome' | 'staff-contact' | 'admin-result';

export default function SetupWizard() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const setupFirstAdmin = useSetupFirstAdmin();
  const [step, setStep] = useState<Step>('welcome');

  const handleBecomeAdmin = () => {
    setStep('admin-result');
    if (user?.email) {
      setupFirstAdmin.mutate(user.email);
    }
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    minHeight: MIN_TAP_TARGET,
    borderRadius: 6,
    border: 'none',
    background: t.pA,
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 10,
  };
  const secondaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    minHeight: MIN_TAP_TARGET,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.sidebarBg,
        padding: 20,
      }}
    >
      <div
        style={{
          width: 460,
          maxWidth: '92vw',
          background: t.surface,
          borderRadius: 10,
          padding: 32,
          boxShadow: t.shadow,
          border: `1px solid ${t.border}`,
        }}
      >
        <div style={{ borderTop: `4px solid ${t.pA}`, marginTop: -32, marginLeft: -32, marginRight: -32, marginBottom: 24 }} />

        {step === 'welcome' && (
          <>
            <h1 style={{ color: t.text, fontSize: 20, marginTop: 0, marginBottom: 12 }}>Welcome to EBC Workforce CRM</h1>
            <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 8 }}>
              Your account is not yet configured with a role.
            </p>
            <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 24 }}>
              If you are the system administrator, click below to set up your account as the first admin.
            </p>
            <button type="button" onClick={handleBecomeAdmin} style={primaryButtonStyle}>
              I am the Admin — Set Up My Account
            </button>
            <button type="button" onClick={() => setStep('staff-contact')} style={secondaryButtonStyle}>
              I am a Staff Member — Contact Admin
            </button>
          </>
        )}

        {step === 'staff-contact' && (
          <>
            <h1 style={{ color: t.text, fontSize: 20, marginTop: 0, marginBottom: 12 }}>Contact Your Admin</h1>
            <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 24 }}>
              Ask your department's system administrator to assign your role from Settings → User Roles. Once
              it's assigned, sign out and back in to pick it up.
            </p>
            <button type="button" onClick={() => setStep('welcome')} style={secondaryButtonStyle}>
              Back
            </button>
            <div style={{ height: 10 }} />
            <button type="button" onClick={() => signOut()} style={secondaryButtonStyle}>
              Sign Out
            </button>
          </>
        )}

        {step === 'admin-result' && (
          <>
            {setupFirstAdmin.isPending && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <LoadingSpinner t={t} size={28} />
                <p style={{ color: t.textMuted, fontSize: 13 }}>Setting up your admin account…</p>
              </div>
            )}

            {setupFirstAdmin.isSuccess && (
              <>
                <h1 style={{ color: t.text, fontSize: 20, marginTop: 0, marginBottom: 12 }}>Admin account configured!</h1>
                <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 24 }}>
                  You can now access all settings.
                </p>
                <button type="button" onClick={() => navigate('/settings')} style={primaryButtonStyle}>
                  Go to Settings
                </button>
              </>
            )}

            {setupFirstAdmin.isError && (
              <>
                <h1 style={{ color: t.text, fontSize: 20, marginTop: 0, marginBottom: 12 }}>Couldn't set up admin</h1>
                <AlertBar t={t} type="crit">
                  {(setupFirstAdmin.error as { error?: { message?: string } })?.error?.message ??
                    'Something went wrong setting up your account.'}
                </AlertBar>
                <button type="button" onClick={() => setStep('welcome')} style={secondaryButtonStyle}>
                  Back
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
