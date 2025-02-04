import mongoose from "mongoose";

const StoreCategorySchema = new mongoose.Schema({
  name: String,
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("StoreCategory", StoreCategorySchema);
