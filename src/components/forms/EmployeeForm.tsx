import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint, isMobile } from '../../hooks/useBreakpoint';
import { MIN_TAP_TARGET } from '../../theme/spacing';
import { useCompanies } from '../../hooks/useCompanies';
import { useCreateEmployee, useUpdateEmployee, EmployeeInput } from '../../hooks/useEmployees';
import { Employee, Rank, RANK_SENIORITY } from '../../types/domain';
import { InlineSpinner } from '../ui/LoadingSpinner';

// RANK_SENIORITY is `readonly Rank[]`, not a literal tuple — z.enum needs a
// tuple type, hence the assertion (values are still validated at runtime).
const RANKS = RANK_SENIORITY as unknown as [Rank, ...Rank[]];

const schema = z.object({
  emp_number: z.coerce.number({ invalid_type_error: 'Employee number is required' }).int('Must be a whole number').positive('Must be a positive number'),
  last_name: z.string().min(1, 'Last name is required'),
  first_name: z.string().min(1, 'First name is required'),
  middle_initial: z
    .string()
    .max(1, 'Middle initial must be a single character')
    .optional()
    .or(z.literal('')),
  rank: z.enum(RANKS),
  platoon: z.enum(['A', 'B', 'C']),
  company_code: z.string().min(1, 'Select a company'),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']),
  supervisor: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EmployeeFormProps {
  t: ThemeTokens;
  bp: Breakpoint;
  employee?: Employee;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

export function EmployeeForm({ t, bp, employee, onSuccess, onCancel }: EmployeeFormProps) {
  const mobile = isMobile(bp);
  const isEdit = Boolean(employee);
  const { data: companies } = useCompanies();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const mutation = isEdit ? updateEmployee : createEmployee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: employee
      ? {
          emp_number: employee.emp_number,
          last_name: employee.last_name,
          first_name: employee.first_name,
          middle_initial: employee.middle_initial ?? '',
          rank: employee.rank,
          platoon: employee.platoon,
          company_code: employee.company_code,
          email: employee.email ?? '',
          status: employee.status,
          supervisor: employee.supervisor,
        }
      : {
          rank: 'FF',
          platoon: 'A',
          company_code: '',
          status: 'Active',
          supervisor: false,
        },
  });

  const onSubmit = async (values: FormValues) => {
    const payload: EmployeeInput = {
      emp_number: values.emp_number,
      last_name: values.last_name,
      first_name: values.first_name,
      middle_initial: values.middle_initial || null,
      rank: values.rank,
      platoon: values.platoon,
      company_code: values.company_code,
      email: values.email || null,
      status: values.status,
      supervisor: values.supervisor,
    };

    if (isEdit && employee) {
      // Only send fields that actually changed.
      const changes: Partial<EmployeeInput> = {};
      (Object.keys(payload) as (keyof EmployeeInput)[]).forEach((key) => {
        const original = employee[key as keyof Employee];
        if (payload[key] !== original) {
          (changes as Record<string, unknown>)[key] = payload[key];
        }
      });
      await updateEmployee.mutateAsync({ id: employee.id, changes });
      onSuccess('Employee updated successfully');
    } else {
      await createEmployee.mutateAsync(payload);
      onSuccess('Employee added successfully');
    }
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
  const errorStyle: React.CSSProperties = { color: t.crit, fontSize: 12, marginTop: 2 };
  const row: React.CSSProperties = { display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 14 : 10 };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Employee Number *</label>
        <input type="number" {...register('emp_number')} style={inputStyle} />
        {errors.emp_number && <p style={errorStyle}>{errors.emp_number.message}</p>}
      </div>

      <div style={row}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Last Name *</label>
          <input type="text" {...register('last_name')} style={inputStyle} />
          {errors.last_name && <p style={errorStyle}>{errors.last_name.message}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>First Name *</label>
          <input type="text" {...register('first_name')} style={inputStyle} />
          {errors.first_name && <p style={errorStyle}>{errors.first_name.message}</p>}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Middle Initial</label>
        <input type="text" maxLength={1} {...register('middle_initial')} style={{ ...inputStyle, width: mobile ? '100%' : 80 }} />
        {errors.middle_initial && <p style={errorStyle}>{errors.middle_initial.message}</p>}
      </div>

      <div style={row}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Rank *</label>
          <select {...register('rank')} style={inputStyle}>
            {RANK_SENIORITY.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Platoon *</label>
          <select {...register('platoon')} style={inputStyle}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Company Code *</label>
        <select {...register('company_code')} style={inputStyle}>
          <option value="">Select…</option>
          {companies?.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.station}
            </option>
          ))}
        </select>
        {errors.company_code && <p style={errorStyle}>{errors.company_code.message}</p>}
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input type="email" {...register('email')} style={inputStyle} />
        {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
      </div>

      <div style={row}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <select {...register('status')} style={inputStyle}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: mobile ? 0 : 2 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: t.text, minHeight: mobile ? MIN_TAP_TARGET : undefined }}>
            <input type="checkbox" {...register('supervisor')} style={{ width: 18, height: 18 }} />
            Supervisor
          </label>
        </div>
      </div>

      {mutation.isError && (
        <p style={{ color: t.crit, fontSize: 13 }}>
          {(mutation.error as { error?: { message?: string } })?.error?.message ?? 'Something went wrong. Please try again.'}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          style={{
            flex: 1,
            padding: '10px 14px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          style={{
            flex: 1,
            display: 'flex',
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
            cursor: mutation.isPending ? 'default' : 'pointer',
            opacity: mutation.isPending ? 0.7 : 1,
          }}
        >
          {mutation.isPending && <InlineSpinner />}
          {mutation.isPending ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}
