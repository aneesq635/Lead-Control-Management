import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  workspace_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
  },
  last_message_at: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to quickly find a conversation by workspace and phone
conversationSchema.index({ workspace_id: 1, phone: 1 }, { unique: true });

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
