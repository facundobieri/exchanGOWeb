import { SubscriptionTier } from './user.model';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  tokens: number | null; // null = unlimited
  price: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    tokens: 10,
    price: '$0',
    features: [
      '10 exchange tokens',
      'Basic currency pairs',
      'Standard support',
    ],
  },
  {
    tier: 'trial',
    name: 'Trial',
    tokens: 100,
    price: '$9.99',
    features: [
      '100 exchange tokens',
      'All currency pairs',
      'Priority support',
      'Exchange history',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    tokens: null,
    price: '$29.99',
    features: [
      'Unlimited tokens',
      'All currency pairs',
      'Premium support',
      'Exchange history',
      'Real-time rates',
      'API access',
    ],
  },
];
