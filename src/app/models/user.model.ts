export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  subscription: SubscriptionTier;
  tokens: number;
}

export type SubscriptionTier = 'free' | 'trial' | 'pro';
