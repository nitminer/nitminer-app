// Authentication types
export type UserRole = 'user' | 'admin';

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isPremium: boolean;
  trialCount: number;
  subscriptionExpiry: Date | null;
}

export type PaymentPlan = '6_months' | '12_months';

export interface Payment {
  _id: string;
  userId: string;
  plan: PaymentPlan;
  amount: number;
  paymentMethod: string;
  paymentId: string;
  invoiceUrl?: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageLog {
  _id: string;
  userId: string;
  toolName: string;
  input: string;
  output: string;
  executionTime: number;
  timestamp: Date;
}

export interface SystemSettings {
  _id?: string;
  freeTrialsEnabled: boolean;
  pricing: {
    sixMonths: number;
    twelveMonths: number;
  };
  updatedAt?: Date;
}
