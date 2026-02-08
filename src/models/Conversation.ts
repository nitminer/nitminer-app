import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  adminId?: string;
  subject: string;
  status: 'open' | 'closed';
  lastMessage: string;
  lastMessageAt: Date;
  messageCount: number;
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
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
    adminId: {
      type: String,
      default: null,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: () => new Date(),
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    unreadByAdmin: {
      type: Number,
      default: 0,
    },
    unreadByUser: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create index on userEmail for faster queries
conversationSchema.index({ userEmail: 1, createdAt: -1 });

export const Conversation = mongoose.models.Conversation || 
  mongoose.model<IConversation>('Conversation', conversationSchema);
