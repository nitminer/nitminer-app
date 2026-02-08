import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail: string;
  customerName?: string; // Customer name for receipt
  planName: string; // 'pro', 'agency', 'startup', etc.
  planDuration: '1_month' | '6_months' | '12_months'; // Plan duration mapping
  amount: number;
  paymentMethod: 'razorpay' | 'card' | 'upi';
  paymentId?: string; // Only set after payment verification
  orderId?: string;
  invoiceUrl?: string;
  status: 'success' | 'pending' | 'failed';
  failureReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    customerName: {
      type: String,
      default: null,
    },
    planName: {
      type: String,
      required: true,
    },
    planDuration: {
      type: String,
      enum: ['1_month', '6_months', '12_months'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'card', 'upi'],
      required: true,
    },
    paymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'pending',
    },
    failureReason: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
