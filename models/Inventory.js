import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    workspace_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      default: "auto",
    },
    property_type: {
      type: String,
    },
    area: {
      type: String,
    },
    size: {
      type: String,
    },
    price: {
      type: String,
    },
    description: {
      type: String,
      default: null,
    },
    owner_name: {
      type: String,
    },
    owner_phone: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema, "inventory");
