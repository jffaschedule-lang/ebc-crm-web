import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

type MockSession = { access_token: string; user: { id: string; email: string } } | null;

const authState: { session: MockSession } = { session: null };
const authListeners: Array<(event: string, session: MockSession) => void> = [];

function broadcastAuthChange(event: string) {
  authListeners.forEach((cb) => cb(event, authState.session));
}

vi.mock('../../src/lib/supabaseClient', () => {
  return {
    supabase: {
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      })),
      removeChannel: vi.fn(),
      auth: {
        getSession: vi.fn(async () => ({ data: { session: authState.session } })),
        onAuthStateChange: vi.fn((cb: (event: string, session: MockSession) => void) => {
          authListeners.push(cb);
          cb('INITIAL', authState.session);
          return {
            data: {
              subscription: {
                unsubscribe: vi.fn(() => {
                  const idx = authListeners.indexOf(cb);
                  if (idx >= 0) authListeners.splice(idx, 1);
                }),
              },
            },
          };
        }),
        signInWithPassword: vi.fn(async ({ email, password }: { email: string; password: string }) => {
          if (email === 'dispatch@ebc-fire.org' && password === 'correct-password') {
            authState.session = { access_token: 'valid-token', user: { id: 'u1', email } };
            broadcastAuthChange('SIGNED_IN');
            return { error: null };
          }
          return { error: { message: 'Invalid login credentials' } };
        }),
        refreshSession: vi.fn(async () => {
          authState.session = { access_token: 'refreshed-token', user: { id: 'u1', email: 'dispatch@ebc-fire.org' } };
          broadcastAuthChange('TOKEN_REFRESHED');
          return { data: { session: authState.session }, error: null };
        }),
        signOut: vi.fn(async () => {
          authState.session = null;
          broadcastAuthChange('SIGNED_OUT');
        }),
      },
    },
  };
});

async function renderApp(initialPath: string) {
  const { default: App } = await import('../../src/App');
  const { AuthProvider } = await import('../../src/auth/AuthProvider');
  const queryClient = new QueryClient();

  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        AuthProvider,
        null,
        React.createElement(MemoryRouter, { initialEntries: [initialPath] }, React.createElement(App))
      )
    )
  );
}

describe('auth flow', () => {
  beforeEach(() => {
    authState.session = null;
    authListeners.length = 0;
    vi.resetModules();
  });

  it('redirects an unauthenticated visitor from a protected route to /login', async () => {
    await renderApp('/');
    await waitFor(() => {
      expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
    });
  });

  it('logs in with valid credentials and lands on the protected area', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    await renderApp('/login');

    await screen.findByText(/sign in to continue/i);
    await user.type(screen.getByLabelText(/email/i), 'dispatch@ebc-fire.org');
    await user.type(screen.getByLabelText(/password/i), 'correct-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.queryByText(/sign in to continue/i)).not.toBeInTheDocument();
    });
  });

  it('shows a server error message for invalid credentials and stays on /login', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    await renderApp('/login');

    await screen.findByText(/sign in to continue/i);
    await user.type(screen.getByLabelText(/email/i), 'dispatch@ebc-fire.org');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });
});
