import mongoose from "mongoose";

const genRange = new mongoose.Schema({
  min: Number,
  max: Number,
});

const testComponent = new mongoose.Schema({
  componentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Component",
  },
  componentName: String,
  result: String,
  referenceValue: genRange,
  unit: String,
});

const labTest = new mongoose.Schema({
  testName: String,
  testCategory: String,
  testDescription: String,
  testPrice: Number,
  testResult: String,
  testDate: Date,
  testStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "in-review", "reported"],
  },
  testComponents: [testComponent],
});

const LabReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  patientName: String,
  billNumber: String,
  reportNumber: String,
  registered: { type: Date, default: Date.now },
  collected: Date,
  reported: Date,
  labTest: labTest,
  reviewNotes: String,
  prescribedByName: String,
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("LabReport", LabReportSchema);
