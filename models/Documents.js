// Model for storing PDF documents (inventory + uploads) per workspace/user
// PDF binary is stored as Buffer in pdf_data field

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    workspace_id: {
        type: String,
        required: true,
        index: true,
    },
    user_id: {
        type: String,
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['inventory', 'document'],
        required: true,
    },
    file_name: {
        type: String,
        required: true,
    },
    // Binary PDF stored directly in MongoDB
    pdf_data: {
        type: Buffer,
        required: true,
    },
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    },
}, { timestamps: false });

// ─── Inventory Row Model ──────────────────────────────────────
// Each property listing is a separate document in the inventory collection
const inventoryRowSchema = new mongoose.Schema({
    workspace_id: {
        type: String,
        required: true,
        index: true,
    },
    user_id: {
        type: String,
        default: '',
    },
    property_type: { type: String, default: '' },
    area: { type: String, default: '' },
    size: { type: String, default: '' },
    price: { type: String, default: '' },
    description: { type: String, default: '' },
    owner_name: { type: String, default: '' },
    owner_phone: { type: String, default: '' },
}, { timestamps: true });

export const InventoryRow = mongoose.models.InventoryRow || mongoose.model('InventoryRow', inventoryRowSchema);
export default mongoose.models.Document || mongoose.model('Document', documentSchema);
