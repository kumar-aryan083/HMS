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
  name: String,
  quantity: Number,
  buyPrice: Number,
  sellPrice: Number,
  batchNumber: String,
  expiry: String,
  companyName: String,
  amount: Number,
});

const paymentSchema = new mongoose.Schema({
  transactionType: String,
  transactionId: String,
  amount: Number,
  remainingDue: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const SupplierBillSchema = new mongoose.Schema({
  supplierID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },
  supplierName: String,
  supplierBillNumber: String,
  billNumber: String,
  billDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: Number,
  totalDue: Number,
  medicines: [medicineSchema],
  // status: {
  //   type: String,
  //   enum: ["paid", "unpaid", "due"],
  //   default: "unpaid",
  // },
  payments: [paymentSchema],
  grandRemainingDue: Number,
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("SupplierBill", SupplierBillSchema);
