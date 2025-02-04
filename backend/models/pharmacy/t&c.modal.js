import mongoose from "mongoose";

const TermsAndConditionSchema = new mongoose.Schema({
  shortName: String,
  text: String,
  type: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("TermsAndCondition", TermsAndConditionSchema);
