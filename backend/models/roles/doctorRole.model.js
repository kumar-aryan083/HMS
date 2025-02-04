import mongoose from "mongoose";

const DoctorRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "doctor",
  },
}, { timestamps: true });

export default mongoose.model("DoctorRole", DoctorRoleSchema);
