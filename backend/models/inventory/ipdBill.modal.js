import mongoose from "mongoose";

const grandTotal = new mongoose.Schema({
  totalCharge: Number,
  totalDiscount: Number,
  totalDiscounted: Number,
  finalDiscount: Number,
  finalPrice: Number,
});

const item = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
  },
  itemType: String,
  itemName: String,
  charge: Number,
  quantity: Number,
  category: String,
  totalCharge: Number,
  discount: Number,
  total: Number,
  railwayCode: String,
  itemDate: Date,
  itemCategory: String,
  reportNumber: Number,
});

const transactionHistory = new mongoose.Schema({
  paymentType: String,
  paymentAmount: Number,
  remainingDues: String,
  transactionId: String,
  date: { type: Date, default: Date.now },
});

const IpdBillSchema = new mongoose.Schema({
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientAdmission",
  },
  grandTotals: grandTotal,
  item: [item],
  status: {
    type: String,
    default: "unpaid",
    enum: ["paid", "unpaid", "due"],
  },
  date: { type: Date, default: Date.now },
  transactionHistory: [transactionHistory],
  grandRemainingDues: String,
  billNumber: Number,
  user: String,
  userEmail: String,
  userRole: String,
  finalDiscountBy: String,
  finalDiscountById: String,
});

export default mongoose.model("IpdBill", IpdBillSchema);
