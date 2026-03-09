import mongoose, { Schema, Document } from 'mongoose';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  sessionId?: string;
  lastLogin: Date;
  lastActive: Date;
  lastActivityAction: string; // 'page_view', 'api_call', 'tool_execution', etc.
  lastActivityPage?: string;
  activityCount: number; // Total activities in current session
  ipAddress?: string;
  userAgent?: string;
  isOnline: boolean;
  inactivityMinutes: number; // Minutes since last activity
  sessionDuration: number; // Total session duration in minutes
  device?: string;
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  activities: Array<{
    action: string;
    page?: string;
    timestamp: Date;
    details?: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    lastLogin: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
    lastActive: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
    lastActivityAction: {
      type: String,
      default: 'login',
      enum: ['login', 'logout', 'page_view', 'api_call', 'tool_execution', 'file_upload', 'file_download', 'chat', 'settings_change', 'other'],
    },
    lastActivityPage: {
      type: String,
      default: null,
    },
    activityCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: true,
      index: true,
    },
    inactivityMinutes: {
      type: Number,
      default: 0,
    },
    sessionDuration: {
      type: Number,
      default: 0,
    },
    device: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    location: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    activities: [
      {
        action: {
          type: String,
          required: true,
        },
        page: String,
        timestamp: {
          type: Date,
          default: () => new Date(),
        },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userActivitySchema.index({ userId: 1, lastActive: -1 });
userActivitySchema.index({ email: 1, lastLogin: -1 });
userActivitySchema.index({ isOnline: 1, lastActive: -1 });
userActivitySchema.index({ createdAt: -1 });

export const UserActivity =
  mongoose.models.UserActivity ||
  mongoose.model<IUserActivity>('UserActivity', userActivitySchema);
