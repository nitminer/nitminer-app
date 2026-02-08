import mongoose, { Schema, Document } from 'mongoose';

export interface IRefundRequest extends Document {
  userId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  refundAmount?: number;
  refundTransactionId?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const refundRequestSchema = new Schema<IRefundRequest>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    refundTransactionId: {
      type: String,
      default: null,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
refundRequestSchema.index({ userId: 1 });
refundRequestSchema.index({ paymentId: 1 });
refundRequestSchema.index({ status: 1 });
refundRequestSchema.index({ createdAt: -1 });
refundRequestSchema.index({ userId: 1, status: 1 });

export const RefundRequest =
  mongoose.models.RefundRequest ||
  mongoose.model<IRefundRequest>('RefundRequest', refundRequestSchema);
