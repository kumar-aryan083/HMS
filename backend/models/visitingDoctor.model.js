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

const visitingDoctorSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  specialization: {
    type: String,
  },
  wingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wing",
  },
  // generalFees: {
  //   type: Number,
  // },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null, 
    required: false
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

export default mongoose.model("VisitingDoctor", visitingDoctorSchema);
