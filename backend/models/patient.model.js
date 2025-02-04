import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    uhid: {
      type: Number,
      unique: true,
    },
    patientName: {
      type: String,
    },
    email: {
      type: String,
    },
    patientType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientType",
      default: null,
    },
    paymentType: { type: String },
    departmentDesignation: {
      type: String,
    },
    crnNumber: {
      type: String,
    },
    tpaCorporate: {
      type: String,
    },
    ummidCard: {
      type: String,
    },
    railwayType: {
      type: String,
    },
    gender: {
      type: String,
    },
    aadhar: {
      type: Number,
    },
    mobile: {
      type: String,
      unique: true,
      required: true
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    firstAddress: {
      type: String,
    },
    secondAddress: {
      type: String,
    },
    state: {
      type: String,
    },
    district: {
      type: String,
    },
    country: {
      type: String,
    },
    pincode: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    doctor: {
      type: String,
    },
    patientImg: {
      type: String,
    },
    age: {
      type: Number, 
    },
    birthday: {
      type: Date, 
    },
    insuranceProvider: {
      type: String,
    },
    insuranceName: {
      type: String,
    },
    cardNumber: {
      type: String,
    },
    insuranceNumber: {
      type: String,
    },
    facilityCode: {
      type: String,
    },
    initialBalance: {
      type: Number,
    },
    guarantorName: {
      type: String,
    },
    guarantorMobile: {
      type: Number,
    },
    guarantorRelationship: {
      type: String,
    },
    gurantorGender: {
      type: String,
    },
    salutation: {
      type: String,
    },
    maritalStatus: {
      type: String,
    },
    occupation: {
      type: String,
    },
    emgContact: {
      type: Number,
    },
    user: String,
    userEmail: String,
    userRole: String,
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
