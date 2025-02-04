import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  appointmentDate: {
    type: Date,
  },
  appointmentTime: {
    from: { type: String },
    to: { type: String },
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  notes: {
    type: String,
  },
  user: String,
  userEmail: String,
  userRole: String,
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
