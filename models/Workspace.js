import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
  {
    workspace_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    company_name: {
      type: String,
      required: true,
      trim: true,
    },
    whatsapp_access_token: {
      type: String,
      default: "",
    },
    whatsapp_phone_number_id: {
      type: String,
      default: "",
    },
    whatsapp_verify_token: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Workspace ||
  mongoose.model("Workspace", WorkspaceSchema);