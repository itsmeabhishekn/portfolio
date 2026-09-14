import type { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
}

export type RequestWithUser = Request & { user: AuthenticatedUser };
