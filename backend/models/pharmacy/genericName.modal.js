import mongoose from "mongoose";

const GenericNameSchema = new mongoose.Schema({
    name: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    categoryNumber: String,
    therapeuticCategoryNumber: String,
    counselingNumber: String,
    isActive: {
        type: Boolean,
        default: false,
    },
    user: String,
    userEmail: String,
    userRole: String,
  });
  
export default mongoose.model('GenericName', GenericNameSchema);