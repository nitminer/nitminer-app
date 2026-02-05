import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionManagement extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  deviceId: string;
  deviceFingerprint: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  sessionToken: string;
  isActive: boolean;
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionManagementSchema = new Schema<ISessionManagement>(
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
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceFingerprint: {
      type: String,
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      default: 'Unknown Device',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    ipAddress: {
      type: String,
      default: null,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    loginTime: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    lastActivity: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      // TTL index configured below
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active sessions for a user
sessionManagementSchema.index({ userId: 1, isActive: 1 });
sessionManagementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const SessionManagement =
  mongoose.models.SessionManagement ||
  mongoose.model<ISessionManagement>('SessionManagement', sessionManagementSchema);
