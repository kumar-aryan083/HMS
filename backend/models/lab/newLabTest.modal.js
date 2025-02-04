import mongoose from "mongoose";

const patientType = new mongoose.Schema({
  patientType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientType",
  },
  patientTypeName: { type: String },
  generalFees: {
    type: Number,
  },
});

const NewLabTest = new mongoose.Schema({
  name: String,
  code: String,
  reportingName: String,
  reportTempName: String,
  reportTemp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabTemplate",
  },
  labCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabCategory",
  },
  labCategoryName: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  departmentName: String,
  // generalFees: {
  //   type: Number,
  // },
  patientTypes: [patientType],
  railwayCategory: { type: String },
  railwayCode: { type: String },
  nabhPrice: { type: String },
  nonNabhPrice: { type: String },
  serviceDept: String,
  displaySequence: Number,
  runNoType: String,
  specimen: String,
  interpretation: String,
  isSmsApplicable: Boolean,
  isLisApplicable: Boolean,
  isValidForReporting: Boolean,
  taxApplicable: Boolean,
  isOutsourcedTest: Boolean,
  hasNegativeResults: Boolean,
  negativeResultText: String,
  defaultOutsourceVendor: String,
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: "Component" }],
  itemCategory: {type: String, default: "lab test"},
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("NewLabTest", NewLabTest);
