import mongoose from "mongoose";

const genRange = new mongoose.Schema({
  min: Number,
  max: Number,
});

const range = new mongoose.Schema({
  string: String,
  genRange: genRange,
  maleRange: genRange,
  femaleRange: genRange,
  childRange: genRange,
});

const ComponentSchema = new mongoose.Schema({
  name: String,
  unit: String,
  valueType: String,
  controlType: String,
  valueLookUpName: String,
  rangeDescription: range,
  method: String,
  valueLookUp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LookUp",
  },
  displayName: String,
  valuePrecision: Number,
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("Component", ComponentSchema);
