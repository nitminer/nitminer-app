import mongoose from 'mongoose';

const internshipPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  internshipTitle: {
    type: String,
    default: "AI + ML Internship Program"
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    default: 10000,
  },
  discountApplied: {
    type: String,
    default: "50%"
  },
  paymentId: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: "Success"
  },
  receiptUrl: {
    type: String,
  },
  startDate: {
    type: Date,
    default: new Date("2026-05-01"),
  },
  endDate: {
    type: Date,
    default: new Date("2026-06-30"),
  }
}, { timestamps: true });

export const InternshipPayment = mongoose.models.InternshipPayment || mongoose.model("InternshipPayment", internshipPaymentSchema);