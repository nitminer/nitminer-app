import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  freeTrialsEnabled: boolean;
  pricing: {
    sixMonths: number;
    twelveMonths: number;
  };
  updatedAt: Date;
}

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    freeTrialsEnabled: {
      type: Boolean,
      default: true,
    },
    pricing: {
      sixMonths: {
        type: Number,
        default: 1000, // ₹10.00
      },
      twelveMonths: {
        type: Number,
        default: 1500, // ₹15.00
      },
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSettings =
  mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
