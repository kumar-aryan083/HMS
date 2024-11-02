import mongoose from 'mongoose';

const opdSchema = new mongoose.Schema({
  opdId: {
    type: Number,
    unique: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  appointment: {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    consultationType: {
      type: String,
      enum: ['New Consultation', 'Follow-up'],
      required: true,
    },
    reasonForVisit: String,
  },
  treatment: {
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        assignedDate: { type: Date, default: Date.now },
        isPrevious: { type: Boolean, default: false },
      },
    ],
    allergies: [
      {
        name: { type: String, required: true },
        severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], required: true },
        notes: { type: String },
        dateReported: { type: Date, default: Date.now },
      }
    ],
    assignedTests: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId, // ID of the test assigned
          ref: 'Test', // Reference to the Test model
        },
        assignedDate: { type: Date, default: Date.now }, // Date when the test was assigned
        status: { type: String, enum: ['Pending', 'Completed', 'In Progress'], default: 'Pending' }, // Status of the test
        results: String, // Optional: Results field for storing the outcome
      }
    ],    
    followUpDate: String,
    instructions: String
  },
  administrativeDetails: {
    status: {
        type: String,
        enum: ['open', 'close']
    },
    consultationFee: Number,
    paymentMode: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Insurance', 'UPI'],
    },
    billingInformation: String,
    transactionId: String
  },
  assessment: {
    type: String,
    default: "",
  },
  paymentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  ],
}, { timestamps: true });

// Auto-incrementing hook
opdSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Find the highest opdId in the collection and increment by 1
      const lastOpd = await this.constructor.findOne().sort({ opdId: -1 });
      this.opdId = lastOpd ? lastOpd.opdId + 1 : 1; // Start from 1 if no records exist
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model('OPD', opdSchema);
