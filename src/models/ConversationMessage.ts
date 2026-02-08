import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  message: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

const conversationMessageSchema = new Schema<IConversationMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
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
conversationMessageSchema.index({ conversationId: 1, createdAt: -1 });
conversationMessageSchema.index({ senderEmail: 1 });

export const ConversationMessage = mongoose.models.ConversationMessage || 
  mongoose.model<IConversationMessage>('ConversationMessage', conversationMessageSchema);
