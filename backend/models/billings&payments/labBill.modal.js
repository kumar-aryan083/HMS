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

const paymentInfo = new mongoose.Schema({
  paymentType: String,
  paymentAmount: Number,
  remainingDues: String,
  transactionId: String,
  date: { type: Date, default: Date.now },
});

const LabBillSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  patientName: String,
  grandTotals: grandTotal,
  item: [item],
  date: { type: Date, default: Date.now },
  time: String,
  paymentInfo: paymentInfo,
  billNumber: Number,
  prescribedByName: String,
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  user: String,
  userEmail: String,
  userRole: String,
  finalDiscountBy: String,
  finalDiscountById: String,
});

export default mongoose.model("LabBill", LabBillSchema);
