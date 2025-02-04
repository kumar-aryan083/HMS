import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("Category", CategorySchema);