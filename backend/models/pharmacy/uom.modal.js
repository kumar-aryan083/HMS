import mongoose from "mongoose";

const UOMSchema = new mongoose.Schema({
  uom: String,
  description: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("UOM", UOMSchema);
