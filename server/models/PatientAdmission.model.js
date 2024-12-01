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
    dischargeSummary: {
      dischargeDate: { type: Date },
      statusAtDischarge: { type: String, enum: ['Recovered', 'Referred', 'Deceased', 'Other'] },
      dischargeNotes: { type: String },
      finalDiagnosis: { type: String },
      procedures: [{ type: String }], // Array for multiple procedures
      medications: [{ type: String }], // Array for discharge medications
      followUpInstructions: { type: String },
      dischargingDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
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
    },
    allergies: {
      type: String, 
      default: '' 
    },
    physicalExamination: {
      findings: { type: String },
      vitalSigns: {
        bloodPressure: { type: String },
        heartRate: { type: String },
        temperature: { type: String },
        respiratoryRate: { type: String },
        oxygenSaturation: { type: String },
        bmi: {type: String}
      },
      updatedAt: { type: Date, default: Date.now }
    },
    investigations: {
      labTests: [{ type: String }], // Array for lab tests
      imaging: [{ type: String }],  // Array for imaging tests (e.g., X-ray, CT)
      updatedAt: { type: Date, default: Date.now }
    },
    chiefComplaints: {
      complaints: [{ type: String }],
      updatedAt: { type: Date, default: Date.now }
    },
    chemoNotes: {
      cycles: { type: Number },
      regimen: { type: String },
      sideEffects: { type: String },
      updatedAt: { type: Date, default: Date.now }
    },
    visitNotes: {
      notes: [{ type: String }],
      updatedAt: { type: Date, default: Date.now }
    },
    obsGynae: {
      pregnancyHistory: { type: String },
      menstrualHistory: { type: String },
      updatedAt: { type: Date, default: Date.now }
    },
  });
  
  export default mongoose.model('PatientAdmission', patientAdmissionSchema);
  