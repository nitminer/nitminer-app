import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotation extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  customerName: string;
  planName: string;
  planDuration: string;
  numberOfTools: number;
  estimatedPrice: number;
  additionalRequirements: string;
  status: 'pending' | 'quotation_sent' | 'accepted' | 'rejected';
  quotationPdfUrl?: string;
  quotationFileName?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const quotationSchema = new Schema<IQuotation>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    planDuration: {
      type: String,
      required: true,
    },
    numberOfTools: {
      type: Number,
      required: true,
      min: 1,
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalRequirements: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'quotation_sent', 'accepted', 'rejected'],
      default: 'pending',
    },
    quotationPdfUrl: {
      type: String,
      default: null,
    },
    quotationFileName: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quotationSchema.index({ userId: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ createdAt: -1 });
quotationSchema.index({ userEmail: 1, status: 1 });

export const Quotation =
  mongoose.models.Quotation ||
  mongoose.model<IQuotation>('Quotation', quotationSchema);
