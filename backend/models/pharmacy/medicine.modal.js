import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  name: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  description: String,
  batchNumber: String,
  expiryDate: String,
  pricePerUnit: String,
  categoryName: String,
  stockQuantity: String,
  supplierID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },
  supplierName: String,
  companyName: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  uom: String,
  uomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UOM",
  },
  itemType: String,
  itemTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ItemType",
  },
  itemCategory: {
    type: String,
    default: "Pharmacy",
  },
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("Medicine", MedicineSchema);
