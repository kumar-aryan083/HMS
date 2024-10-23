import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    uhid: { 
        type: Number, 
        unique: true 
    },
    patientName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    aadhar: {
        type: Number,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    height: {
        type: Number,
    },
    weight: {
        type: Number,
    },
    firstAddress: {
        type: String
    },
    secondAddress: {
        type: String
    },
    state: {
        type: String
    },
    district: {
        type: String
    },
    country: {
        type: String
    },
    pincode: {
        type: String
    },
    bloodGroup: {
        type: String,
        required: true
    },
    doctor: {
        type: String
    },
    patientImg: {
        type: String
    },
    age: {
        type: Number, // Optional, depending on whether you want it to be required
    },
    birthday: {
        type: Date, // Optional, depending on whether you want it to be required
    },
    insuranceProvider: {
        type: String
    },
    insuranceName: {
        type: String
    },
    cardNumber: {
        type: String
    },
    insuranceNumber: {
        type: String
    },
    facilityCode: {
        type: String
    },
    initialBalance: {
        type: Number
    },
    guarantorName: {
        type: String
    },
    guarantorMobile: {
        type: Number
    },
    guarantorRelationship: {
        type: String
    },
    gurantorGender: {
        type: String
    },
    salutation: {
        type: String
    },
    maritalStatus: {
        type: String
    },
    occupation: {
        type: String
    },
    emgContact: {
        type: Number
    }
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);