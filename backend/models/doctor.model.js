import mongoose from "mongoose";
import bcrypt from "bcrypt";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    specialization: {
      type: String,
    },
    qualifications: {
      type: [String],
    },
    experienceYears: {
      type: Number,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    fees: { type: Number },
    availableDays: {
      type: [String],
      enum: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ],
    },
    availableTime: {
      from: { type: String },
      to: { type: String },
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    role: {
      type: String,
      default: "doctor",
    },
    user: String,
    userEmail: String,
    userRole: String,
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
        expenseNumber: { type: Number },
        note: { type: String },
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

// Pre-save hook to check password validity
// doctorSchema.pre("save", function (next) {
//   const doctor = this;

//   // Skip validation if the password is not being modified
//   if (!doctor.isModified("password")) {
//     return next();
//   }

//   // Define password validation criteria
//   const password = doctor.password;
//   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

//   if (!passwordRegex.test(password)) {
//     const error = new Error(
//       "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
//     );
//     return next(error);
//   }

//   // Proceed with the next middleware or save operation
//   next();
// });

export default mongoose.model("Doctor", doctorSchema);
