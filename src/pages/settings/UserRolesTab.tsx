import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint, isMobile } from '../../hooks/useBreakpoint';
import { apiGet } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import {
  useAdminRoles,
  useAdminUsers,
  useAssignRole,
  useBootstrapStatus,
  useCreateStaffAccount,
  useRemoveRole,
  useRemoveStaffAccount,
  useSetupFirstAdmin,
  useStaffAccounts,
} from '../../hooks/useAdmin';
import { AppRole, Employee, RoleAssignment, StaffAccount } from '../../types/domain';
import { Card } from '../../components/ui/Card';
import { AlertBar } from '../../components/ui/AlertBar';
import { LoadingSpinner, InlineSpinner } from '../../components/ui/LoadingSpinner';
import { RTable, RTableColumn } from '../../components/ui/RTable';
import { EyeIcon, EyeOffIcon } from '../../components/ui/Icon';
import { MIN_TAP_TARGET } from '../../theme/spacing';

interface TabProps {
  t: ThemeTokens;
  bp: Breakpoint;
  isAdmin: boolean;
  roleLoading: boolean;
}

const ROLE_OPTIONS: AppRole[] = ['admin', 'supervisor', 'member'];

const ROLE_INFO: Record<AppRole, { label: string; description: string }> = {
  member: { label: 'Member', description: 'View only, submit own leave requests' },
  supervisor: { label: 'Supervisor', description: 'Approve leave, close shifts, view audit' },
  admin: { label: 'Admin', description: 'Full access including this settings panel' },
};

export function UserRolesTab({ t, bp, isAdmin, roleLoading }: TabProps) {
  const mobile = isMobile(bp);
  const { user } = useAuth();
  const { data: bootstrap, isLoading: bootstrapLoading } = useBootstrapStatus();
  const setupFirstAdmin = useSetupFirstAdmin();

  const [prefillEmail, setPrefillEmail] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
  };

  if (roleLoading || bootstrapLoading) {
    return <LoadingSpinner t={t} />;
  }

  const showBootstrapNotice = bootstrap ? !bootstrap.adminExists : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 650, color: t.text, margin: 0 }}>User &amp; Role Management</h2>
      </div>

      {showBootstrapNotice && (
        <Card t={t} style={{ background: t.infoBg, border: `1px solid ${t.info}` }}>
          <p style={{ fontSize: 13, color: t.text, margin: 0, marginBottom: 10 }}>
            No admin configured yet. Click &quot;Make Me Admin&quot; to set up your account as admin.
          </p>
          {setupFirstAdmin.isError && (
            <AlertBar t={t} type="crit">
              {(setupFirstAdmin.error as { error?: { message?: string } })?.error?.message ?? 'Failed to set up admin account.'}
            </AlertBar>
          )}
          {setupFirstAdmin.isSuccess ? (
            <p style={{ fontSize: 13, color: t.ok, margin: 0 }}>
              Admin account configured! You can now access all settings. Reload the page to see the full panel.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => user?.email && setupFirstAdmin.mutate(user.email)}
              disabled={setupFirstAdmin.isPending || !user?.email}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                minHeight: MIN_TAP_TARGET,
                borderRadius: 6,
                border: 'none',
                background: t.pA,
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: setupFirstAdmin.isPending ? 'default' : 'pointer',
                opacity: setupFirstAdmin.isPending ? 0.7 : 1,
              }}
            >
              {setupFirstAdmin.isPending && <InlineSpinner />}
              Make Me Admin
            </button>
          )}
        </Card>
      )}

      {!isAdmin && (
        <AlertBar t={t} type="warn">
          User &amp; Role Management requires the admin role. Ask your admin to assign it to you above, or in person.
        </AlertBar>
      )}

      {isAdmin && (
        <>
          <CreateStaffAccountSection t={t} bp={bp} />
          <StaffAccountsSection t={t} bp={bp} />

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 650, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Advanced
            </h3>
            <p style={{ fontSize: 12, color: t.textFaint, marginTop: 0 }}>
              For accounts created outside this panel, or granting an additional role on top of an existing one.
            </p>
          </div>
          <AuthUsersSection t={t} bp={bp} onAssignRole={setPrefillEmail} />
          <RoleAssignmentsSection t={t} bp={bp} />
          <AssignRoleSection t={t} bp={bp} prefillEmail={prefillEmail} inputStyle={inputStyle} />
        </>
      )}
    </div>
  );
}

function AuthUsersSection({ t, bp, onAssignRole }: { t: ThemeTokens; bp: Breakpoint; onAssignRole: (email: string) => void }) {
  const { data, isLoading, error } = useAdminUsers(true);
  const rows = data ?? [];

  const cols: RTableColumn<(typeof rows)[number]>[] = [
    { key: 'email', header: 'Email', render: (u) => u.email ?? '—' },
    { key: 'created', header: 'Created', render: (u) => new Date(u.created_at).toLocaleDateString(), hideAt: ['md'] },
    {
      key: 'last_sign_in',
      header: 'Last Sign In',
      render: (u) => (u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'),
      hideAt: ['md', 'lg'],
    },
    {
      key: 'action',
      header: 'Action',
      render: (u) => (
        <button
          type="button"
          onClick={() => u.email && onAssignRole(u.email)}
          disabled={!u.email}
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            fontSize: 12,
            cursor: u.email ? 'pointer' : 'default',
          }}
        >
          Assign Role
        </button>
      ),
    },
  ];

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Supabase Auth Users</h3>
      {isLoading && <LoadingSpinner t={t} />}
      {error && <AlertBar t={t} type="crit">Couldn't load auth users.</AlertBar>}
      {!isLoading && !error && (
        <RTable t={t} bp={bp} cols={cols} rows={rows} rowKey={(u) => u.id} emptyMessage="No auth users found." />
      )}
    </Card>
  );
}

function RoleAssignmentsSection({ t, bp }: { t: ThemeTokens; bp: Breakpoint }) {
  const { data, isLoading, error } = useAdminRoles(true);
  const removeRole = useRemoveRole();
  const rows = data ?? [];
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const cols: RTableColumn<RoleAssignment>[] = [
    {
      key: 'name',
      header: 'Employee Name',
      render: (r) => (r.employees ? `${r.employees.last_name}, ${r.employees.first_name}` : '—'),
    },
    { key: 'emp_number', header: 'Employee #', render: (r) => r.employees?.emp_number ?? '—', hideAt: ['md'], numeric: true },
    { key: 'email', header: 'Email', render: (r) => r.employees?.email ?? '—', hideAt: ['md', 'lg'] },
    { key: 'role', header: 'Role', render: (r) => r.role },
    { key: 'assigned', header: 'Assigned', render: (r) => new Date(r.assigned_at).toLocaleDateString(), hideAt: ['md'] },
    {
      key: 'action',
      header: 'Action',
      render: (r) => {
        const pending = removeRole.isPending && removeRole.variables === r.id;
        return (
          <button
            type="button"
            onClick={() =>
              removeRole.mutate(r.id, {
                onSuccess: () =>
                  setSuccessMsg(`Removed ${r.role} from ${r.employees ? `${r.employees.last_name}, ${r.employees.first_name}` : 'employee'}.`),
              })
            }
            disabled={pending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              border: 'none',
              background: t.crit,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: pending ? 'default' : 'pointer',
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending && <InlineSpinner size={11} />}
            Remove Role
          </button>
        );
      },
    },
  ];

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Current Role Assignments</h3>
      {isLoading && <LoadingSpinner t={t} />}
      {error && <AlertBar t={t} type="crit">Couldn't load role assignments.</AlertBar>}
      {removeRole.isError && (
        <AlertBar t={t} type="crit">
          {(removeRole.error as { error?: { message?: string } })?.error?.message ?? 'Failed to remove role.'}
        </AlertBar>
      )}
      {successMsg && <AlertBar t={t} type="ok">{successMsg}</AlertBar>}
      {!isLoading && !error && (
        <RTable t={t} bp={bp} cols={cols} rows={rows} rowKey={(r) => r.id} emptyMessage="No roles assigned yet." />
      )}
    </Card>
  );
}

function AssignRoleSection({
  t,
  bp,
  prefillEmail,
  inputStyle,
}: {
  t: ThemeTokens;
  bp: Breakpoint;
  prefillEmail: string;
  inputStyle: React.CSSProperties;
}) {
  const mobile = isMobile(bp);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<AppRole>('member');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const assignRole = useAssignRole();

  useEffect(() => {
    if (prefillEmail) {
      setQuery(prefillEmail);
      setSelected(null);
      setOpen(true);
    }
  }, [prefillEmail]);

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const { data: employees } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => apiGet<Employee[]>('/api/employees', { limit: 200 }),
  });

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return (employees ?? [])
      .filter(
        (e) =>
          `${e.last_name} ${e.first_name}`.toLowerCase().includes(q) ||
          String(e.emp_number).includes(q) ||
          (e.email ?? '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [employees, query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    assignRole.mutate(
      { employee_id: selected.id, role },
      {
        onSuccess: () => {
          setSuccessMsg(`Assigned ${role} to ${selected.last_name}, ${selected.first_name}.`);
          setSelected(null);
          setQuery('');
          setRole('member');
        },
      }
    );
  };

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Assign New Role</h3>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: 12, color: t.textMuted, display: 'block', marginBottom: 4 }}>Employee</label>
          <input
            type="text"
            placeholder="Search by name, employee #, or email…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            style={inputStyle}
          />
          {open && matches.length > 0 && !selected && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 5,
                marginTop: 4,
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                boxShadow: t.shadow,
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {matches.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    setSelected(emp);
                    setQuery(`${emp.last_name}, ${emp.first_name} (#${emp.emp_number})`);
                    setOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    border: 'none',
                    borderBottom: `1px solid ${t.border}`,
                    background: 'transparent',
                    color: t.text,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {emp.last_name}, {emp.first_name} · #{emp.emp_number}
                  {emp.email ? ` · ${emp.email}` : ''}
                </button>
              ))}
            </div>
          )}
          {query.trim() && matches.length === 0 && !selected && (
            <p style={{ fontSize: 12, color: t.textFaint, marginTop: 4 }}>No matching employee on the roster.</p>
          )}
        </div>

        <div>
          <label style={{ fontSize: 12, color: t.textMuted, display: 'block', marginBottom: 4 }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as AppRole)} style={inputStyle}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {assignRole.isError && (
          <AlertBar t={t} type="crit">
            {(assignRole.error as { error?: { message?: string } })?.error?.message ?? 'Failed to assign role.'}
          </AlertBar>
        )}
        {successMsg && <AlertBar t={t} type="ok">{successMsg}</AlertBar>}

        <button
          type="submit"
          disabled={!selected || assignRole.isPending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 14px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 6,
            border: 'none',
            background: t.pA,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: !selected || assignRole.isPending ? 'default' : 'pointer',
            opacity: !selected || assignRole.isPending ? 0.6 : 1,
            width: mobile ? '100%' : 200,
          }}
        >
          {assignRole.isPending && <InlineSpinner />}
          {assignRole.isPending ? 'Assigning…' : 'Assign Role'}
        </button>
      </form>
    </Card>
  );
}

function CreateStaffAccountSection({ t, bp }: { t: ThemeTokens; bp: Breakpoint }) {
  const mobile = isMobile(bp);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AppRole>('member');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const createStaffAccount = useCreateStaffAccount();

  const { data: employees } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => apiGet<Employee[]>('/api/employees', { limit: 200 }),
  });

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return (employees ?? [])
      .filter((e) => `${e.last_name} ${e.first_name}`.toLowerCase().includes(q) || String(e.emp_number).includes(q))
      .slice(0, 8);
  }, [employees, query]);

  const describeEmployee = (e: Employee) =>
    `${e.last_name}, ${e.first_name}${e.middle_initial ? ` ${e.middle_initial}.` : ''} — ${e.rank} · ${e.platoon} Platoon · ${e.company_code} #${e.emp_number}`;

  const resetForm = () => {
    setQuery('');
    setSelected(null);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRole('member');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    createStaffAccount.mutate(
      { email, password, emp_number: selected.emp_number, role },
      {
        onSuccess: (result) => {
          setSuccessMsg(`Account created for ${result.name}. They can now login with ${result.email}.`);
          resetForm();
        },
      }
    );
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: t.textMuted, display: 'block', marginBottom: 4 };

  return (
    <Card t={t} style={{ border: `1px solid ${t.pA}` }}>
      <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Create Staff Login Account</h3>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <label style={labelStyle}>Employee</label>
          <input
            type="text"
            placeholder="Type emp number or last name to search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            style={inputStyle}
          />
          {open && matches.length > 0 && !selected && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 5,
                marginTop: 4,
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                boxShadow: t.shadow,
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {matches.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    setSelected(emp);
                    setQuery(describeEmployee(emp));
                    setOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    border: 'none',
                    borderBottom: `1px solid ${t.border}`,
                    background: 'transparent',
                    color: t.text,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {describeEmployee(emp)}
                </button>
              ))}
            </div>
          )}
          {query.trim() && matches.length === 0 && !selected && (
            <p style={{ fontSize: 12, color: t.textFaint, marginTop: 4 }}>No matching employee on the roster.</p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Email address</label>
          <input
            type="email"
            required
            placeholder="firstname.lastname@ebc-fire.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Temporary password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                background: 'transparent',
                border: 'none',
                color: t.textMuted,
                cursor: 'pointer',
              }}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: t.textFaint, marginTop: 4 }}>Staff member should change this after first login.</p>
        </div>

        <div>
          <label style={labelStyle}>Role</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {ROLE_OPTIONS.map((r) => {
              const info = ROLE_INFO[r];
              return (
                <label
                  key={r}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${role === r ? t.pA : t.border}`,
                    background: role === r ? t.surfaceAlt : 'transparent',
                    cursor: 'pointer',
                    minHeight: mobile ? MIN_TAP_TARGET : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="staff-role"
                    checked={role === r}
                    onChange={() => setRole(r)}
                    style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text, display: 'block' }}>{info.label}</span>
                    <span style={{ fontSize: 11, color: t.textMuted }}>{info.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {createStaffAccount.isError && (
          <AlertBar t={t} type="crit">
            {(createStaffAccount.error as { error?: { message?: string } })?.error?.message ?? 'Failed to create account.'}
          </AlertBar>
        )}
        {successMsg && <AlertBar t={t} type="ok">{successMsg}</AlertBar>}

        <button
          type="submit"
          disabled={!selected || !email || password.length < 8 || createStaffAccount.isPending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 14px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 6,
            border: 'none',
            background: t.pA,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: !selected || !email || password.length < 8 || createStaffAccount.isPending ? 'default' : 'pointer',
            opacity: !selected || !email || password.length < 8 || createStaffAccount.isPending ? 0.6 : 1,
            width: mobile ? '100%' : 200,
          }}
        >
          {createStaffAccount.isPending && <InlineSpinner />}
          {createStaffAccount.isPending ? 'Creating…' : 'Create Account'}
        </button>
      </form>
    </Card>
  );
}

function StaffAccountsSection({ t, bp }: { t: ThemeTokens; bp: Breakpoint }) {
  const mobile = isMobile(bp);
  const { data, isLoading, error } = useStaffAccounts(true);
  const removeStaffAccount = useRemoveStaffAccount();
  const [confirming, setConfirming] = useState<number | null>(null);
  const rows = data ?? [];

  const cols: RTableColumn<StaffAccount>[] = [
    { key: 'name', header: 'Employee', render: (r) => r.name },
    { key: 'emp_number', header: 'Emp #', render: (r) => r.emp_number, hideAt: ['md'], numeric: true },
    { key: 'email', header: 'Email', render: (r) => r.email, hideAt: ['md', 'lg'] },
    { key: 'role', header: 'Role', render: (r) => r.role },
    {
      key: 'last_sign_in',
      header: 'Last Login',
      render: (r) => (r.last_sign_in ? new Date(r.last_sign_in).toLocaleDateString() : 'Never'),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => {
        const pending = removeStaffAccount.isPending && removeStaffAccount.variables === r.emp_number;
        if (confirming === r.emp_number) {
          return (
            <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'stretch' : 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: t.text }}>Remove login access for {r.name}?</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => removeStaffAccount.mutate(r.emp_number, { onSuccess: () => setConfirming(null) })}
                  disabled={pending}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    minHeight: mobile ? MIN_TAP_TARGET : undefined,
                    borderRadius: 6,
                    border: 'none',
                    background: t.crit,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: pending ? 'default' : 'pointer',
                    opacity: pending ? 0.7 : 1,
                  }}
                >
                  {pending && <InlineSpinner size={11} />}
                  Yes, remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  disabled={pending}
                  style={{
                    padding: '5px 10px',
                    minHeight: mobile ? MIN_TAP_TARGET : undefined,
                    borderRadius: 6,
                    border: `1px solid ${t.border}`,
                    background: t.surfaceAlt,
                    color: t.text,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        }
        return (
          <button
            type="button"
            onClick={() => setConfirming(r.emp_number)}
            style={{
              padding: '5px 10px',
              minHeight: mobile ? MIN_TAP_TARGET : undefined,
              borderRadius: 6,
              border: 'none',
              background: t.crit,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        );
      },
    },
  ];

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 15, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Current Staff Accounts</h3>
      {isLoading && <LoadingSpinner t={t} />}
      {error && <AlertBar t={t} type="crit">Couldn't load staff accounts.</AlertBar>}
      {removeStaffAccount.isError && (
        <AlertBar t={t} type="crit">
          {(removeStaffAccount.error as { error?: { message?: string } })?.error?.message ?? 'Failed to remove staff account.'}
        </AlertBar>
      )}
      {!isLoading && !error && (
        <RTable
          t={t}
          bp={bp}
          cols={cols}
          rows={rows}
          rowKey={(r) => String(r.emp_number)}
          emptyMessage="No staff accounts created yet. Use the form above to give team members login access."
        />
      )}
    </Card>
  );
}
