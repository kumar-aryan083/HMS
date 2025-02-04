import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  description: String,
  contactAddress: String,
  email: String,
  isActive: {
    type: Boolean,
    default: false,
    user: String,
    userEmail: String,
    userRole: String,
  },
});

export default mongoose.model("Company", companySchema);
