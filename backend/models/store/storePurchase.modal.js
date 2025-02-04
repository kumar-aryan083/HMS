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
  quantity: String,
});

const StorePurchaseSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreVendor",
    },
    vendorName: String,
    address: String,
    phone: String,
    purchaseNo: String,
    items: [item],
    user: String,
    userEmail: String,
    userRole: String,
  },
  { timestamps: true }
);

export default mongoose.model("StorePurchaseOrder", StorePurchaseSchema);
