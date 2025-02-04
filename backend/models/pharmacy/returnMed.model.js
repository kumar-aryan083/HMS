import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: String,
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
  },
  genericName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GenericName",
  },
  quantity: Number,
  buyPrice: Number,
  sellPrice: Number,
  batchNumber: String,
  expiry: String,
  companyName: String,
  amount: Number,
});

const ReturnedMedSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    patientName: String,
    medicines: [medicineSchema],
    returnDate: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("returnMed", ReturnedMedSchema);
