import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint } from '../../hooks/useBreakpoint';
import { apiGet } from '../../api/client';
import { Employee } from '../../types/domain';
import { useLeaveSlots, useSubmitLeave } from '../../hooks/useLeaveSlots';
import { SlotBar } from '../ui/SlotBar';
import { StatusChip } from '../ui/StatusChip';

const LEAVE_TYPES = ['AL', 'EAL', 'SL', 'ISSL', 'FODI', 'ADM', 'AWOL', 'FL', 'CT', 'CL', 'DET', 'MWA'] as const;

const schema = z.object({
  employee_id: z.string().uuid('Select an employee'),
  leave_type: z.enum(LEAVE_TYPES),
  shift_date: z.string().min(1, 'Shift date is required'),
  span_start: z.string().min(1),
  span_end: z.string().min(1),
  reason: z.string().optional(),
  sl_illness: z.boolean().optional(),
  sl_medical: z.boolean().optional(),
  sl_dental: z.boolean().optional(),
  sl_optical: z.boolean().optional(),
  sl_death: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface LeaveRequestFormProps {
  t: ThemeTokens;
  bp: Breakpoint;
}

export function LeaveRequestForm({ t }: LeaveRequestFormProps) {
  const { data: employees } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => apiGet<Employee[]>('/api/employees', { limit: 200 }),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { leave_type: 'AL' },
  });

  const employeeId = watch('employee_id');
  const leaveType = watch('leave_type');
  const shiftDate = watch('shift_date');

  const employee = employees?.find((e) => e.id === employeeId);
  const platoon = employee?.platoon ?? '';

  const { data: slotLedger } = useLeaveSlots(platoon, shiftDate ?? '');
  const submitLeave = useSubmitLeave();

  const onSubmit = async (values: FormValues) => {
    await submitLeave.mutateAsync(values);
    reset();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: t.textMuted, display: 'block', marginBottom: 4 };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Employee</label>
        <select {...register('employee_id')} style={inputStyle}>
          <option value="">Select…</option>
          {employees?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.last_name}, {e.first_name} (#{e.emp_number})
            </option>
          ))}
        </select>
        {errors.employee_id && <p style={{ color: t.crit, fontSize: 12 }}>{errors.employee_id.message}</p>}
      </div>

      <div>
        <label style={labelStyle}>Leave Type</label>
        <select {...register('leave_type')} style={inputStyle}>
          {LEAVE_TYPES.map((lt) => (
            <option key={lt} value={lt}>
              {lt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Shift Date</label>
        <input type="date" {...register('shift_date')} style={inputStyle} />
        {errors.shift_date && <p style={{ color: t.crit, fontSize: 12 }}>{errors.shift_date.message}</p>}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Span Start</label>
          <input type="time" {...register('span_start')} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Span End</label>
          <input type="time" {...register('span_end')} style={inputStyle} />
        </div>
      </div>

      {leaveType === 'SL' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: t.text }}>
          {(['sl_illness', 'sl_medical', 'sl_dental', 'sl_optical', 'sl_death'] as const).map((field) => (
            <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" {...register(field)} />
              {field.replace('sl_', '')}
            </label>
          ))}
        </div>
      )}

      <div>
        <label style={labelStyle}>Reason</label>
        <textarea {...register('reason')} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {leaveType === 'AL' && platoon && shiftDate && (
        <div>
          <label style={labelStyle}>
            AL Slots — Platoon {platoon} — {slotLedger?.peak_concurrent ?? 0}/{slotLedger?.max_slots ?? 12} occupied
          </label>
          <SlotBar t={t} occupied={slotLedger?.peak_concurrent ?? 0} maxSlots={slotLedger?.max_slots ?? 12} pendingFit />
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <StatusChip t={t} status={employeeId ? 'Granted' : 'PendingApproval'} />
        <span style={{ fontSize: 11, color: t.textFaint }}>
          {employeeId ? 'Employee selected' : 'Select an employee to continue'}
        </span>
      </div>

      {submitLeave.isError && (
        <p style={{ color: t.crit, fontSize: 13 }}>
          {(submitLeave.error as { error?: { message?: string } })?.error?.message ?? 'Failed to submit request'}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || submitLeave.isPending}
        style={{
          padding: '10px 14px',
          borderRadius: 6,
          border: 'none',
          background: t.pA,
          color: '#fff',
          fontWeight: 600,
          cursor: submitLeave.isPending ? 'default' : 'pointer',
          opacity: submitLeave.isPending ? 0.7 : 1,
        }}
      >
        {submitLeave.isPending ? 'Submitting…' : 'Submit Leave Request'}
      </button>
    </form>
  );
}
