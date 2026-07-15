import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { apiPost } from '../../api/client';

const schema = z.object({
  employee_id: z.string().uuid('Select an employee'),
  available_from: z.string().min(1),
  available_through: z.string().min(1),
  target_platoon: z.enum(['A', 'B', 'C']).optional(),
  ot_type: z.string().default('General'),
  excluded_dates: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface OTAvailabilityFormProps {
  t: ThemeTokens;
  employeeId: string;
}

export function OTAvailabilityForm({ t, employeeId }: OTAvailabilityFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employee_id: employeeId, ot_type: 'General' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiPost('/api/overtime/availability', {
        ...values,
        excluded_dates: values.excluded_dates
          ? values.excluded_dates.split(',').map((d) => d.trim()).filter(Boolean)
          : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-availability'] });
      reset();
    },
  });

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
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Available From</label>
          <input type="date" {...register('available_from')} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Through</label>
          <input type="date" {...register('available_through')} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Target Platoon</label>
        <select {...register('target_platoon')} style={inputStyle}>
          <option value="">Any</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>OT Type</label>
        <input {...register('ot_type')} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Excluded Dates (comma-separated)</label>
        <input {...register('excluded_dates')} placeholder="2026-07-04, 2026-12-25" style={inputStyle} />
      </div>

      {errors.employee_id && <p style={{ color: t.crit, fontSize: 12 }}>{errors.employee_id.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        style={{
          padding: '9px 14px',
          borderRadius: 6,
          border: 'none',
          background: t.pA,
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {mutation.isPending ? 'Saving…' : 'Add Availability'}
      </button>
    </form>
  );
}
