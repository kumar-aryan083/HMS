import mongoose from "mongoose";

const MapGovItem = new mongoose.Schema({
  reportItemName: String,
  testName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabTest",
  },
  isComponentBased: Boolean,
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("MapGov", MapGovItem);
