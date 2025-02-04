import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  labCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabCategory"
  },
  generalFees: {
    type: Number,
  },
  patientType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientType",
  },
  patientTypeName: { type: String },
  railwayCategory: { type: String },
  railwayCode: { type: String },
  nabhPrice: { type: Number },
  nonNabhPrice: { type: Number },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("LabTest", labTestSchema);
