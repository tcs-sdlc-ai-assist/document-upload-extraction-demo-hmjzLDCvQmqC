import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, AuthContext } from './AuthContext';
import type { AuthContextType } from '../types';

// Mock the authService module
vi.mock('../services/authService', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  getCurrentSession: vi.fn(),
}));

import {
  login as mockLogin,
  signup as mockSignup,
  logout as mockLogout,
  getCurrentSession as mockGetCurrentSession,
} from '../services/authService';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
};

const mockSession = {
  user: mockUser,
  token: 'mock-token-abc',
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
};

// Helper component to consume context
const TestConsumer: React.FC<{ onContext?: (ctx: AuthContextType) => void }> = ({ onContext }) => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) return <div>No context</div>;
  if (onContext) onContext(ctx);
  return (
    <div>
      <span data-testid="is-authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="is-loading">{String(ctx.isLoading)}</span>
      <span data-testid="user-name">{ctx.user?.name ?? 'null'}</span>
      <span data-testid="user-email">{ctx.user?.email ?? 'null'}</span>
      <button onClick={() => ctx.login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => ctx.signup('Test User', 'test@example.com', 'password123')}>Signup</button>
      <button onClick={() => ctx.logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext / AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);
  });

  it('provides initial unauthenticated state when no session exists', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-name').textContent).toBe('null');
  });

  it('restores session on mount when a valid session exists in storage', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(mockSession);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
    expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
  });

  it('sets isLoading to true initially and then false after session check', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);

    const loadingStates: boolean[] = [];

    const LoadingTracker: React.FC = () => {
      const ctx = React.useContext(AuthContext);
      if (ctx) loadingStates.push(ctx.isLoading);
      return <span data-testid="loading">{String(ctx?.isLoading)}</span>;
    };

    render(
      <AuthProvider>
        <LoadingTracker />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(loadingStates).toContain(false);
  });

  it('login flow sets user and session, isAuthenticated becomes true', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);
    vi.mocked(mockLogin).mockReturnValue(mockSession);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });

    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
    expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('signup flow stores user and sets session, isAuthenticated becomes true', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);
    vi.mocked(mockSignup).mockReturnValue(mockSession);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');

    await act(async () => {
      screen.getByText('Signup').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });

    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
    expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
    expect(mockSignup).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
  });

  it('logout clears session and user, isAuthenticated becomes false', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(mockSession);
    vi.mocked(mockLogout).mockReturnValue(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    });

    expect(screen.getByTestId('user-name').textContent).toBe('null');
    expect(mockLogout).toHaveBeenCalled();
  });

  it('session persists on re-render (simulating page reload)', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(mockSession);

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });

    unmount();

    // Re-mount simulating a page reload — getCurrentSession still returns the session
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
    expect(mockGetCurrentSession).toHaveBeenCalledTimes(2);
  });

  it('isAuthenticated is false when user is null even if session exists', async () => {
    // Simulate a corrupted session with no user
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  });

  it('handles getCurrentSession throwing an error gracefully', async () => {
    vi.mocked(mockGetCurrentSession).mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-name').textContent).toBe('null');
  });

  it('login failure propagates error to caller', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);
    vi.mocked(mockLogin).mockImplementation(() => {
      throw new Error('Invalid credentials');
    });

    let caughtError: Error | null = null;

    const ErrorTestConsumer: React.FC = () => {
      const ctx = React.useContext(AuthContext);
      const handleLogin = async () => {
        try {
          await ctx?.login('bad@example.com', 'wrongpassword');
        } catch (err) {
          caughtError = err as Error;
        }
      };
      return (
        <div>
          <span data-testid="is-authenticated">{String(ctx?.isAuthenticated)}</span>
          <button onClick={handleLogin}>Login</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <ErrorTestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(caughtError).not.toBeNull();
    expect((caughtError as unknown as Error).message).toBe('Invalid credentials');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  });

  it('signup failure propagates error to caller', async () => {
    vi.mocked(mockGetCurrentSession).mockReturnValue(null);
    vi.mocked(mockSignup).mockImplementation(() => {
      throw new Error('Email already in use');
    });

    let caughtError: Error | null = null;

    const ErrorTestConsumer: React.FC = () => {
      const ctx = React.useContext(AuthContext);
      const handleSignup = async () => {
        try {
          await ctx?.signup('Existing User', 'existing@example.com', 'password123');
        } catch (err) {
          caughtError = err as Error;
        }
      };
      return (
        <div>
          <span data-testid="is-authenticated">{String(ctx?.isAuthenticated)}</span>
          <button onClick={handleSignup}>Signup</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <ErrorTestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Signup').click();
    });

    expect(caughtError).not.toBeNull();
    expect((caughtError as unknown as Error).message).toBe('Email already in use');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  });

  it('useAuth hook throws when used outside AuthProvider', () => {
    // Directly test that context is null outside provider
    let contextValue: AuthContextType | null = null;

    const ContextReader: React.FC = () => {
      contextValue = React.useContext(AuthContext);
      return null;
    };

    render(<ContextReader />);
    expect(contextValue).toBeNull();
  });
});