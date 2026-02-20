export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  subscription: SubscriptionTier;
  totalConversions: number;
}

export type SubscriptionTier = 'free' | 'estandar' | 'pro';

/** Mirrors the backend UserRole enum: User = 0, Admin = 1 */
export enum UserRole {
  User = 0,
  Admin = 1,
}

/** Mirrors the backend UserSubscription enum: Free = 0, Estandar = 1, Pro = 2 */
export enum UserSubscription {
  Free = 0,
  Estandar = 1,
  Pro = 2,
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  subscription: string;
  totalConversions: number;
}

/** Shape returned by POST /api/Auth/login and POST /api/Auth/register */
export interface LoginResponse {
  user: UserDto;
  token: string;
}

/** Shape returned by GET /api/Auth/{id} */
export type GetUserResponse = UserDto;
