import mongoose from "mongoose";

const TaxSchema = new mongoose.Schema({
  name: String,
  percentage: String,
  description: String,
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("TAX", TaxSchema);
