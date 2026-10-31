import { betterAuth, APIError } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { createAuthMiddleware } from 'better-auth/api';
import { jwt } from 'better-auth/plugins';
import { getDb } from '../config/db.js';
import { env } from '../config/env.js';

export const auth = betterAuth({
  database: mongodbAdapter(getDb()),
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: (request) => {
    const origin = request?.headers?.get?.('origin') || '';
    const origins = [
      env.CLIENT_ORIGIN,
      'https://studiospace-client-eight.vercel.app',
      'https://studiospace-client.vercel.app',
      'https://studiospace-server-theta.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    if (origin && (origin.endsWith('.vercel.app') || origin.includes('localhost'))) {
      origins.push(origin);
    }
    return origins;
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 100,
    autoSignIn: false // As required: register redirects to login without auto sign-in
  },
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET
          }
        }
      : {})
  },
  plugins: [jwt()],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        const body = ctx.body as any;
        const password = body?.password;

        if (typeof password === 'string') {
          if (password.length < 6) {
            throw new APIError('BAD_REQUEST', {
              message: 'Password must be at least 6 characters long.'
            });
          }
          if (!/[A-Z]/.test(password)) {
            throw new APIError('BAD_REQUEST', {
              message: 'Password must contain at least one uppercase letter.'
            });
          }
          if (!/[a-z]/.test(password)) {
            throw new APIError('BAD_REQUEST', {
              message: 'Password must contain at least one lowercase letter.'
            });
          }
        }
      }
    })
  }
});
