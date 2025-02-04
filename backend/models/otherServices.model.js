import mongoose from "mongoose";

const patientType = new mongoose.Schema({
  patientType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientType",
  },
  patientTypeName: { type: String },
  generalFees: {
    type: String,
  },
});

const OtherServicesSchema = new mongoose.Schema({
    name: String,
    pricePerUnit: String,
    patientTypes: [patientType],
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("OtherServices", OtherServicesSchema);