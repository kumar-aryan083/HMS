import mongoose from "mongoose";

const patientAdmissionSchema = new mongoose.Schema({
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    dischargeDate: {
      type: Date
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    wingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wing',
      required: true
    },
    reasonForAdmission: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Admitted', 'Discharged'],
      default: 'Admitted'
    },
    nursingRate: {
      type: Number
    }
  });
  
  export default mongoose.model('PatientAdmission', patientAdmissionSchema);
  