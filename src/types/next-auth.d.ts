import type { GetServerSidePropsContext, NextApiRequest } from 'next';
import type { NextRequest } from 'next/server';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }

  interface GetTokenParams<R extends boolean = false> {
    req: GetServerSidePropsContext['req'] | NextRequest | NextApiRequest;
    secureCookie?: boolean;
    cookieName?: string;
    raw?: R;
    secret?: string;
    decode?: (...args: unknown[]) => Promise<unknown>;
    logger?: Console;
  }

  function getToken<R extends boolean = false>(
    params: GetTokenParams<R>,
  ): Promise<R extends true ? string : JWT | null>;
}
