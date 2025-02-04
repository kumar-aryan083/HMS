import mongoose from "mongoose";

const transaction = new mongoose.Schema({
    paymentNumber: String,
    paymentType: String,
    paymentAmount: Number,
    remainingDues: String,
    transactionId: String,
    remarks: String,
    date: { type: Date, default: Date.now },
    time: String,
    user: String,
    userEmail: String,
    userRole: String,
});

const PatientPaymentsModal = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    patientName: String,
    admissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientAdmission",
    },
    transactions: [transaction],
});

export default mongoose.model("PatientPayments", PatientPaymentsModal);
