import type { Session } from 'better-auth/types';

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  bio?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedSession extends Omit<Session, 'user'> {
  user: ExtendedUser;
}

export function isExtendedSession(session: Session | null): session is ExtendedSession {
  return session !== null && 'role' in (session.user as Record<string, unknown>);
}
