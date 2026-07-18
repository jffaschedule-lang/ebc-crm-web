import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useAuth } from '../auth/useAuth';
import { useBootstrapFirstEmployee, useBootstrapStatus, useSetupFirstAdmin } from '../hooks/useAdmin';
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
  const bootstrapEmployee = useBootstrapFirstEmployee();
  const { data: bootstrapStatus } = useBootstrapStatus();
  const [step, setStep] = useState<Step>('welcome');
  const [usedBypass, setUsedBypass] = useState(false);

  const handleBecomeAdmin = () => {
    setStep('admin-result');
    setUsedBypass(false);
    if (user?.email) {
      setupFirstAdmin.mutate(user.email);
    }
  };

  const handleCreateSystemAdmin = () => {
    setUsedBypass(true);
    bootstrapEmployee.mutate(undefined, {
      onSuccess: () => {
        if (user?.email) {
          setupFirstAdmin.mutate(user.email);
        }
      },
    });
  };

  const setupError = setupFirstAdmin.error as { error?: { code?: string; message?: string } } | null;
  const isNoEmployeeError = setupError?.error?.code === 'EMPLOYEE_NOT_FOUND';
  const canOfferBypass = isNoEmployeeError && !usedBypass && bootstrapStatus && !bootstrapStatus.adminExists;
  const bootstrapError = bootstrapEmployee.error as { error?: { message?: string } } | null;

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
  const codeBlockStyle: React.CSSProperties = {
    display: 'block',
    whiteSpace: 'pre-wrap',
    background: t.surfaceAlt,
    border: `1px solid ${t.border}`,
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    fontFamily: 'ui-monospace, SF Mono, Consolas, monospace',
    color: t.text,
    margin: '10px 0',
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
            {(setupFirstAdmin.isPending || bootstrapEmployee.isPending) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <LoadingSpinner t={t} size={28} />
                <p style={{ color: t.textMuted, fontSize: 13 }}>
                  {bootstrapEmployee.isPending ? 'Creating system admin employee record…' : 'Setting up your admin account…'}
                </p>
              </div>
            )}

            {setupFirstAdmin.isSuccess && !setupFirstAdmin.isPending && (
              <>
                <h1 style={{ color: t.text, fontSize: 20, marginTop: 0, marginBottom: 12 }}>
                  {usedBypass ? 'Admin account ready.' : 'Admin account configured!'}
                </h1>
                <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 24 }}>
                  You can now access all settings.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(usedBypass ? '/' : '/settings')}
                  style={primaryButtonStyle}
                >
                  {usedBypass ? 'Go to dashboard' : 'Go to Settings'}
                </button>
              </>
            )}

            {!setupFirstAdmin.isPending && !bootstrapEmployee.isPending && !setupFirstAdmin.isSuccess && (setupFirstAdmin.isError || bootstrapEmployee.isError) && (
              <>
                <h1 style={{ color: t.text, fontSize: 20, marginTop: 0, marginBottom: 12 }}>Couldn't set up admin</h1>

                {bootstrapEmployee.isError && (
                  <AlertBar t={t} type="crit">
                    {bootstrapError?.error?.message ?? 'Something went wrong creating the system admin record.'}
                  </AlertBar>
                )}

                {setupFirstAdmin.isError && isNoEmployeeError ? (
                  <AlertBar t={t} type="crit">
                    <span>
                      Your email ({user?.email}) is not linked to any employee record in the system.
                      <br />
                      <br />
                      To fix this, ask someone with Supabase access to run this SQL:
                      <code style={codeBlockStyle}>
                        {`UPDATE employees\nSET email = '${user?.email}'\nWHERE emp_number = YOUR_EMPLOYEE_NUMBER;`}
                      </code>
                      Then come back and try again.
                    </span>
                  </AlertBar>
                ) : (
                  setupFirstAdmin.isError && (
                    <AlertBar t={t} type="crit">
                      {setupError?.error?.message ?? 'Something went wrong setting up your account.'}
                    </AlertBar>
                  )
                )}

                {canOfferBypass && (
                  <button type="button" onClick={handleCreateSystemAdmin} style={primaryButtonStyle}>
                    Create System Admin Account (First-time setup only)
                  </button>
                )}

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
