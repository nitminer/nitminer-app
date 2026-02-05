import mongoose, { Schema, Document } from 'mongoose';

export interface IUsageLog extends Document {
  userId: mongoose.Types.ObjectId;
  toolName: string;
  input: string;
  output: string;
  executionTime: number; // in ms
  timestamp: Date;
}

const usageLogSchema = new Schema<IUsageLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toolName: {
      type: String,
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    executionTime: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use timestamp field instead
  }
);

// Index for faster queries
usageLogSchema.index({ userId: 1, timestamp: -1 });
usageLogSchema.index({ timestamp: -1 });

export const UsageLog = mongoose.models.UsageLog || mongoose.model<IUsageLog>('UsageLog', usageLogSchema);
