import { cookies } from 'next/headers';
import { readLockouts, writeLockouts, LockoutState } from './mockDb';

export interface Agent {
  id: string;
  email: string;
  nama: string;
  role: 'admin' | 'superadmin';
}

const MOCK_AGENTS: Agent[] = [
  { id: 'agent-1', email: 'superadmin@primeproperty.com', nama: 'Ahmad Syarif (Superadmin)', role: 'superadmin' },
  { id: 'agent-2', email: 'admin@primeproperty.com', nama: 'Budi Hartono (Admin)', role: 'admin' }
];

const MOCK_PASSWORDS: Record<string, string> = {
  'superadmin@primeproperty.com': 'super123',
  'admin@primeproperty.com': 'admin123'
};

const SESSION_COOKIE_NAME = 'prime_property_session';

export async function loginAgent(email: string, password: string): Promise<{ success: boolean; error?: string; agent?: Agent }> {
  const normalizedEmail = email.toLowerCase();
  const lockouts = await readLockouts();
  const state: LockoutState = lockouts[normalizedEmail] || { failedAttempts: 0, lockedUntil: null };

  // Check lockout status
  if (state.lockedUntil) {
    const lockTime = new Date(state.lockedUntil).getTime();
    const now = Date.now();
    if (now < lockTime) {
      const minutesLeft = Math.ceil((lockTime - now) / 60000);
      return {
        success: false,
        error: `Akun terkunci. Silakan coba lagi dalam ${minutesLeft} menit.`
      };
    } else {
      state.lockedUntil = null;
      state.failedAttempts = 0;
      lockouts[normalizedEmail] = state;
      await writeLockouts(lockouts);
    }
  }

  const agent = MOCK_AGENTS.find(a => a.email.toLowerCase() === normalizedEmail);
  const correctPassword = MOCK_PASSWORDS[normalizedEmail];

  if (!agent || correctPassword !== password) {
    state.failedAttempts += 1;
    if (state.failedAttempts >= 5) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      state.lockedUntil = lockedUntil;
      lockouts[normalizedEmail] = state;
      await writeLockouts(lockouts);
      return {
        success: false,
        error: 'Terlalu banyak percobaan masuk yang gagal. Akun Anda dikunci selama 15 menit.'
      };
    } else {
      lockouts[normalizedEmail] = state;
      await writeLockouts(lockouts);
      const sisa = 5 - state.failedAttempts;
      return {
        success: false,
        error: `Email atau password salah. Sisa percobaan login: ${sisa} kali.`
      };
    }
  }

  // Login success - Reset lockout state
  state.failedAttempts = 0;
  state.lockedUntil = null;
  lockouts[normalizedEmail] = state;
  await writeLockouts(lockouts);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(agent), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60,
    path: '/'
  });

  return { success: true, agent };
}

export async function getAuthenticatedAgent(): Promise<Agent | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session || !session.value) return null;
  try {
    return JSON.parse(session.value) as Agent;
  } catch (e) {
    return null;
  }
}

export async function logoutAgent() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
  });
}

export async function enforceSuperadmin(): Promise<Agent> {
  const agent = await getAuthenticatedAgent();
  if (!agent) {
    throw new Error('UNAUTHORIZED_SESSION');
  }
  if (agent.role !== 'superadmin') {
    throw new Error('FORBIDDEN_MUTATION');
  }
  return agent;
}
