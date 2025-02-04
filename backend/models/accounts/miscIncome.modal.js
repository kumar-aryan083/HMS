import mongoose from "mongoose";

const MiscIncomeSchema = new mongoose.Schema({
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

export default mongoose.model("MiscIncome", MiscIncomeSchema);
