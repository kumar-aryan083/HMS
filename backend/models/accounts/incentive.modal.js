import mongoose from "mongoose";

const IncentiveSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Doctor", "Referral"],
  },
  doctorName: String,
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  head: String,
  date: {
    type: Date,
    default: Date.now,
  },
  time: {
    type: String,
    default: new Date().toLocaleTimeString(),
  },
  amount: String,
  mode: String,
  details: String,
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("Incentive", IncentiveSchema);
