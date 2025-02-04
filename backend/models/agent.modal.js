import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema(
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
    role: {
      type: String,
      required: true,
      default: "agent",
    },
    expenses: [
      {
        type: {
          type: String,
          enum: ["TA", "DA", "HRA", "Bonus", "Referral", "Other"],
          required: true,
          default: "Referral",
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

export default mongoose.model("Agent", AgentSchema);
