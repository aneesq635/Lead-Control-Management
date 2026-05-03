import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  workspace_id: {
    type: String,
    required: true,
    index: true,
  },
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true,
  },
  message_type: {
    type: String,
    default: 'text',
  },
  text: {
    type: String,
    default: '',
  },
  whatsapp_message_id: {
    type: String,
    index: true,
    sparse: true, // Some outgoing might not have WA ID initially or we might not store it if failed
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sender_type: {
    type: String,
    enum: ['customer', 'agent', 'consultant'],
    default: 'customer',
  },
});

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
