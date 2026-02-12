import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from './db';
import * as schema from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day,
    customSession: async ({
      session,
      user,
    }: {
      session: Record<string, unknown>;
      user: Record<string, unknown>;
    }) => {
      return {
        ...session,
        user: {
          ...session.user,
          role: user.role as string,
          bio: user.bio as string | null,
          avatarUrl: user.avatarUrl as string | null,
        },
      };
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'reader',
      },
      bio: {
        type: 'string',
        required: false,
      },
      avatarUrl: {
        type: 'string',
        required: false,
      },
    },
  },
});
