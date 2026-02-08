import mongoose, { Schema, Document } from 'mongoose';

export interface IRefundChat extends Document {
  refundRequestId: mongoose.Types.ObjectId;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  message: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

const refundChatSchema = new Schema<IRefundChat>(
  {
    refundRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RefundRequest',
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Create indexes for efficient queries
refundChatSchema.index({ refundRequestId: 1, createdAt: -1 });
refundChatSchema.index({ senderEmail: 1 });

export const RefundChat = mongoose.models.RefundChat || 
  mongoose.model<IRefundChat>('RefundChat', refundChatSchema);
