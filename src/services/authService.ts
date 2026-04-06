import { v4 as uuidv4 } from 'uuid';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { getItem, setItem, removeItem } from '../utils/storageUtils';
import type { User, AuthSession } from '../types';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

function hashPassword(password: string): string {
  // Simple deterministic hash for demo purposes (not secure for production)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + password.length.toString(16);
}

function generateToken(): string {
  return uuidv4() + '-' + Date.now().toString(36);
}

function getStoredUsers(): StoredUser[] {
  return getItem<StoredUser[]>(LOCAL_STORAGE_KEYS.AUTH_USERS) ?? [];
}

function saveStoredUsers(users: StoredUser[]): void {
  setItem<StoredUser[]>(LOCAL_STORAGE_KEYS.AUTH_USERS, users);
}

export function signup(name: string, email: string, password: string): AuthSession {
  if (!name || name.trim().length < 2 || name.trim().length > 64) {
    throw new Error('Name must be between 2 and 64 characters.');
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || password.length < 6 || password.length > 64) {
    throw new Error('Password must be between 6 and 64 characters.');
  }

  if (/\s/.test(password)) {
    throw new Error('Password must not contain whitespace.');
  }

  const users = getStoredUsers();
  const existingUser = users.find((u) => u.email === trimmedEmail);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const now = new Date().toISOString();
  const newUser: StoredUser = {
    id: uuidv4(),
    email: trimmedEmail,
    name: name.trim(),
    passwordHash: hashPassword(password),
    createdAt: now,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const user: User = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: newUser.createdAt,
  };

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const session: AuthSession = {
    user,
    token: generateToken(),
    expiresAt,
  };

  setItem<AuthSession>(LOCAL_STORAGE_KEYS.AUTH_SESSION, session);
  return session;
}

export function login(email: string, password: string): AuthSession {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    throw new Error('Email is required.');
  }

  if (!password) {
    throw new Error('Password is required.');
  }

  const users = getStoredUsers();
  const storedUser = users.find((u) => u.email === trimmedEmail);

  if (!storedUser) {
    throw new Error('Invalid email or password.');
  }

  if (storedUser.passwordHash !== hashPassword(password)) {
    throw new Error('Invalid email or password.');
  }

  const user: User = {
    id: storedUser.id,
    email: storedUser.email,
    name: storedUser.name,
    createdAt: storedUser.createdAt,
  };

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const session: AuthSession = {
    user,
    token: generateToken(),
    expiresAt,
  };

  setItem<AuthSession>(LOCAL_STORAGE_KEYS.AUTH_SESSION, session);
  return session;
}

export function logout(): void {
  removeItem(LOCAL_STORAGE_KEYS.AUTH_SESSION);
}

export function getCurrentSession(): AuthSession | null {
  const session = getItem<AuthSession>(LOCAL_STORAGE_KEYS.AUTH_SESSION);
  if (!session) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  if (now >= expiresAt) {
    removeItem(LOCAL_STORAGE_KEYS.AUTH_SESSION);
    return null;
  }

  return session;
}