import mongoose from "mongoose";

const labCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("LabCategory", labCategorySchema);
