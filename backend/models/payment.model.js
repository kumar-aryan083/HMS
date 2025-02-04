import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  opdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OPD',
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },
  purpose: {
    type: String,
    enum: ['Doctor Fee', 'Test Fee', 'Medication', 'Procedure', 'Other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  mode: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Insurance', 'UPI'],
    required: true,
  },
  transactionId: {
    type: String,
  },
  notes: {
    type: String,
  },
  user: String,
  userEmail: String,
  userRole: String,
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
