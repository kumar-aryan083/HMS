import mongoose from "mongoose";

const StoreItemSchema = new mongoose.Schema({
  code: String,
  name: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreCategory",
  },
  categoryName: String,
  rate: String,
  gst: String,
  mrp: String,
  buffer: String,
  stockQuantity: String,
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("StoreItem", StoreItemSchema);
