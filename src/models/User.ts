import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: 'user' | 'admin';
  trialCount: number;
  isPremium: boolean;
  subscriptionExpiry: Date | null;
  subscription?: {
    plan: '1_month' | '6_months' | '12_months';
    status: 'active' | 'expired' | 'cancelled';
    startDate: Date;
    endDate: Date;
    paymentId: mongoose.Types.ObjectId;
  };
  settings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    theme: string;
    language: string;
    timezone: string;
    twoFactorAuth: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values for non-Google users
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    trialCount: {
      type: Number,
      default: 5,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['1_month', '6_months', '12_months'],
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active',
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: false,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ['dark', 'light', 'auto'],
        default: 'dark',
      },
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ isPremium: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
