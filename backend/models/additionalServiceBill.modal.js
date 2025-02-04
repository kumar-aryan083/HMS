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
    ref: "AdditionalServices",
  },
  itemName: String,
  charge: Number,
  quantity: Number,
  totalCharge: Number,
  discount: Number,
  total: Number,
  itemDate: {
    type: Date,
    default: Date.now,
  },
});

const paymentInfo = new mongoose.Schema({
  paymentType: String,
  paymentAmount: Number,
  transactionId: String,
  date: { type: Date, default: Date.now },
});

const AdditionalServiceBill = new mongoose.Schema({
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

export default mongoose.model("AdditionalServiceBillSchema", AdditionalServiceBill);
