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
  medicalHistory: {
    allergies: String,
    chronicConditions: String,
    pastSurgeries: String,
    currentMedications: String,
    familyMedicalHistory: String,
  },
  treatment: {
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    testsRequired: [String],
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