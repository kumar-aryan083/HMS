import mongoose from "mongoose";

const item = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreItem",
  },
  code: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreCategory",
  },
  name: String,
  categoryName: String,
  discount: String,
  charge: String,
  finalPrice: String,
  quantity: String,
});

const paymentInfo = new mongoose.Schema({
  paymentType: String,
  paymentAmount: Number,
  remainingDues: String,
  transactionId: String,
  date: { type: Date, default: Date.now },
});

const StoreVendorBillSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoreVendors",
    },
    vendorName: String,
    purchaseOrderNumber: String,
    date: {
        type: Date,
        default: Date.now,
    },
    items: [item],
    paymentInfo: paymentInfo,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("StoreVendorBill", StoreVendorBillSchema);
