import { vi } from 'vitest';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
};

const sessionState: { user: SessionUser | null } = {
  user: null,
};

export const mockGetServerSession = vi.fn(async () => {
  return sessionState.user ? { user: sessionState.user } : null;
});

vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

export function setSessionUser(user: SessionUser | null) {
  sessionState.user = user;
}

export function getSessionUser() {
  return sessionState.user;
}
