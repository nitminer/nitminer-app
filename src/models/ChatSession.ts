import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    index: true,
  },
  userName: String,
  userEmail: String,
  status: {
    type: String,
    enum: ['waiting', 'active', 'closed'],
    default: 'waiting',
  },
  assignedAdmin: String,
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
  messageCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
