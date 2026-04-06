import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signup, login, logout, getCurrentSession } from './authService';
import { LOCAL_STORAGE_KEYS } from '../constants';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('signup', () => {
    it('creates a new user and returns a session', () => {
      const session = signup('Alice Smith', 'alice@example.com', 'password123');

      expect(session).toBeDefined();
      expect(session.user).toBeDefined();
      expect(session.user.name).toBe('Alice Smith');
      expect(session.user.email).toBe('alice@example.com');
      expect(session.token).toBeTruthy();
      expect(session.expiresAt).toBeTruthy();
    });

    it('stores the user in localStorage', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');

      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USERS);
      expect(stored).not.toBeNull();
      const users = JSON.parse(stored!);
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('alice@example.com');
      expect(users[0].name).toBe('Alice Smith');
    });

    it('stores the session in localStorage', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');

      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_SESSION);
      expect(stored).not.toBeNull();
      const session = JSON.parse(stored!);
      expect(session.user.email).toBe('alice@example.com');
    });

    it('normalizes email to lowercase', () => {
      const session = signup('Alice Smith', 'Alice@Example.COM', 'password123');

      expect(session.user.email).toBe('alice@example.com');
    });

    it('trims whitespace from name', () => {
      const session = signup('  Alice Smith  ', 'alice@example.com', 'password123');

      expect(session.user.name).toBe('Alice Smith');
    });

    it('throws an error when a duplicate email is used', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');

      expect(() => {
        signup('Alice Again', 'alice@example.com', 'differentpassword');
      }).toThrow('An account with this email already exists.');
    });

    it('throws an error when name is too short', () => {
      expect(() => {
        signup('A', 'alice@example.com', 'password123');
      }).toThrow('Name must be between 2 and 64 characters.');
    });

    it('throws an error when name is empty', () => {
      expect(() => {
        signup('', 'alice@example.com', 'password123');
      }).toThrow('Name must be between 2 and 64 characters.');
    });

    it('throws an error when email is invalid', () => {
      expect(() => {
        signup('Alice Smith', 'not-an-email', 'password123');
      }).toThrow('Please enter a valid email address.');
    });

    it('throws an error when password is too short', () => {
      expect(() => {
        signup('Alice Smith', 'alice@example.com', 'abc');
      }).toThrow('Password must be between 6 and 64 characters.');
    });

    it('throws an error when password contains whitespace', () => {
      expect(() => {
        signup('Alice Smith', 'alice@example.com', 'pass word');
      }).toThrow('Password must not contain whitespace.');
    });

    it('sets session expiry approximately 7 days in the future', () => {
      const before = Date.now();
      const session = signup('Alice Smith', 'alice@example.com', 'password123');
      const after = Date.now();

      const expiresAt = new Date(session.expiresAt).getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
      expect(expiresAt).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      signup('Alice Smith', 'alice@example.com', 'password123');
      logout();
    });

    it('returns a session for valid credentials', () => {
      const session = login('alice@example.com', 'password123');

      expect(session).toBeDefined();
      expect(session.user.email).toBe('alice@example.com');
      expect(session.user.name).toBe('Alice Smith');
      expect(session.token).toBeTruthy();
    });

    it('stores the session in localStorage on successful login', () => {
      login('alice@example.com', 'password123');

      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_SESSION);
      expect(stored).not.toBeNull();
      const session = JSON.parse(stored!);
      expect(session.user.email).toBe('alice@example.com');
    });

    it('normalizes email to lowercase during login', () => {
      const session = login('Alice@Example.COM', 'password123');

      expect(session.user.email).toBe('alice@example.com');
    });

    it('throws an error for an unknown email', () => {
      expect(() => {
        login('unknown@example.com', 'password123');
      }).toThrow('Invalid email or password.');
    });

    it('throws an error for a wrong password', () => {
      expect(() => {
        login('alice@example.com', 'wrongpassword');
      }).toThrow('Invalid email or password.');
    });

    it('throws an error when email is empty', () => {
      expect(() => {
        login('', 'password123');
      }).toThrow('Email is required.');
    });

    it('throws an error when password is empty', () => {
      expect(() => {
        login('alice@example.com', '');
      }).toThrow('Password is required.');
    });

    it('sets session expiry approximately 7 days in the future', () => {
      const before = Date.now();
      const session = login('alice@example.com', 'password123');
      const after = Date.now();

      const expiresAt = new Date(session.expiresAt).getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
      expect(expiresAt).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
    });
  });

  describe('logout', () => {
    it('removes the session from localStorage', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');
      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_SESSION)).not.toBeNull();

      logout();

      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_SESSION)).toBeNull();
    });

    it('does not throw when there is no active session', () => {
      expect(() => {
        logout();
      }).not.toThrow();
    });
  });

  describe('getCurrentSession', () => {
    it('returns null when no session exists', () => {
      const session = getCurrentSession();

      expect(session).toBeNull();
    });

    it('returns the current session after login', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');
      logout();
      login('alice@example.com', 'password123');

      const session = getCurrentSession();

      expect(session).not.toBeNull();
      expect(session!.user.email).toBe('alice@example.com');
    });

    it('returns null after logout', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');
      logout();

      const session = getCurrentSession();

      expect(session).toBeNull();
    });

    it('returns null and clears storage when session is expired', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');

      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_SESSION);
      const session = JSON.parse(stored!);
      session.expiresAt = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

      const result = getCurrentSession();

      expect(result).toBeNull();
      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_SESSION)).toBeNull();
    });

    it('returns the session when it is not yet expired', () => {
      signup('Alice Smith', 'alice@example.com', 'password123');

      const result = getCurrentSession();

      expect(result).not.toBeNull();
      expect(result!.user.email).toBe('alice@example.com');
    });

    it('returns null when localStorage contains malformed session data', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_SESSION, 'not-valid-json{{{');

      const result = getCurrentSession();

      expect(result).toBeNull();
    });
  });
});