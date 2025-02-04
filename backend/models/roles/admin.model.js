import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
    },
    role: {
      type: String,
      required: true,
      default: "admin",
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

export default mongoose.model("Admin", adminSchema);
