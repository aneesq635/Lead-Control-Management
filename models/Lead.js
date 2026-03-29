import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    workspace_id: {
      type: String,
      required: true,
      index: true,
    },
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    name:{
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    lead_data: {
      type: Object,
      default: {},
    },
    lead_score: {
      type: Number,
      default: 0,
    },
    lead_status: {
      type: String,
      default: "new",
    },
    needs_human_followup: {
      type: Boolean,
      default: false,
    },
    next_action: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
