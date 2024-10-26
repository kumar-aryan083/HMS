import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
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
  },
  qualifications: {
    type: [String],
    required: true,
  },
  experienceYears: {
    type: Number,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  availableDays: {
    type: [String],
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  availableTime: {
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  appointments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  }],
},{timestamps: true});

export default mongoose.model('Doctor', doctorSchema);
