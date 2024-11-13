import mongoose from "mongoose";

const visitingDoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
    enum: ["ENT", "Physician", "Cardiology", "Gynecology", "General Surgery", "Neurology", "Psychiatry"],
  },
  wingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wing",
  },
  visitFees: {
    type: Number, 
    required: true
 },
});

export default mongoose.model("VisitingDoctor", visitingDoctorSchema);
