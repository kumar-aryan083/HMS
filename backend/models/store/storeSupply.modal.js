import mongoose from "mongoose";

const item = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreItem",
  },
  name: String,
  code: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreCategory",
  },
  categoryName: String,
  quantity: String,
  rate: String,
  gst: String,
  mrp: String,
});

const StoreSupplySchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreReceiver",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreDepartment",
    },
    departmentName: String,
    phone: String,
    voucherNo: String,
    items: [item],
    status: {
      type: String,
      default: "due",
      enum: ["received", "due"],
    },
    user: String,
    userEmail: String,
    userRole: String,
  },
  { timestamps: true }
);

export default mongoose.model("StoreSupply", StoreSupplySchema);
