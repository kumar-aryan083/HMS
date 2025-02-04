import mongoose from "mongoose";

const DispensarySchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ["Insurance", "Normal"],
  },
  description: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  printInvoice: {
    type: Boolean,
    default: false,
  },
  seperateInvoice: {
    type: Boolean,
    default: false,
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("Dispensary", DispensarySchema);
