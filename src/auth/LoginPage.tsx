import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './useAuth';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { MIN_TAP_TARGET } from '../theme/spacing';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setServerError(error);
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.sidebarBg,
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          width: 360,
          maxWidth: '90vw',
          background: t.surface,
          borderRadius: 10,
          padding: 32,
          boxShadow: t.shadow,
          border: `1px solid ${t.border}`,
        }}
      >
        <div style={{ borderTop: `4px solid ${t.pA}`, marginTop: -32, marginLeft: -32, marginRight: -32, marginBottom: 24 }} />
        <h1 style={{ color: t.text, fontSize: 20, marginBottom: 4 }}>EBC Workforce CRM</h1>
        <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 24 }}>Sign in to continue</p>

        <label htmlFor="login-email" style={{ display: 'block', fontSize: 12, color: t.textMuted, marginBottom: 4 }}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          {...register('email')}
          style={{
            width: '100%',
            padding: '10px 12px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            marginBottom: 4,
            fontSize: 14,
          }}
        />
        {errors.email && (
          <p style={{ color: t.crit, fontSize: 12, marginBottom: 12 }}>{errors.email.message}</p>
        )}

        <label htmlFor="login-password" style={{ display: 'block', fontSize: 12, color: t.textMuted, marginTop: 12, marginBottom: 4 }}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          style={{
            width: '100%',
            padding: '10px 12px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            marginBottom: 4,
            fontSize: 14,
          }}
        />
        {errors.password && (
          <p style={{ color: t.crit, fontSize: 12, marginBottom: 12 }}>{errors.password.message}</p>
        )}

        {serverError && (
          <p style={{ color: t.crit, fontSize: 13, marginTop: 12 }}>{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '10px 12px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 6,
            border: 'none',
            background: t.pA,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: isSubmitting ? 'default' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
