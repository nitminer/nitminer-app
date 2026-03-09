import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: String,
  adminId: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true });

// Create index for efficient querying
ChatMessageSchema.index({ sessionId: 1, timestamp: 1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
