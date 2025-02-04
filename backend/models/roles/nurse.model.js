import mongoose from "mongoose";

const NurseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    role: {
      type: String,
      required: true,
      default: "nurse",
    },
    attendance: [
      {
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: ["Present", "Absent", "Leave"],
          default: "Present",
        },
        note: { type: String },
      },
    ],
    expenses: [
      {
        type: {
          type: String,
          enum: ["TA", "DA", "HRA", "Referral", "Bonus", "Other"],
          required: true,
        },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String },
        expenseNumber: { type: Number },
      },
    ],
    adhaarNumber: { type: String },
    panNumber: { type: String },
    dateOfBirth: { type: Date },
    accNumber: { type: String },
    ifscCode: { type: String },
    accHolderName: { type: String },
    salary: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Nurse", NurseSchema);
