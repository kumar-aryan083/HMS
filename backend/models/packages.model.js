import mongoose from "mongoose";

const patientType = new mongoose.Schema({
  patientType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientType",
  },
  patientTypeName: { type: String },
  generalFees: {
    type: Number,
  },
});

const packageSchema = new mongoose.Schema({
  name: { type: String },
  // generalFees: {
  //   type: Number,
  // },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: false,
    default: null
  },
  departmentName: String,
  patientTypes: [patientType],
  railwayCategory: { type: String },
  railwayCode: { type: String },
  nabhPrice: { type: Number },
  nonNabhPrice: { type: Number },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("Package", packageSchema);
