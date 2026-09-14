export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
}

export abstract class CurrentUserService {
  abstract getCurrentUser(): Promise<AuthenticatedUser>;
}
