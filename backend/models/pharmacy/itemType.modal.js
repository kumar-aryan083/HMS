import mongoose from "mongoose";

const ItemType = new mongoose.Schema({
  type: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  categoryName: String,
  description: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("ItemType", ItemType);
