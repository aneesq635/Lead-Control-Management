import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  whatsapp_access_token: {
    type: String,
    default: '',
  },
  whatsapp_phone_number_id: {
    type: String,
    default: '',
    index: true,
  },
  whatsapp_verify_token: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
