import mongoose from "mongoose";

const patientTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("PatientType", patientTypeSchema);
