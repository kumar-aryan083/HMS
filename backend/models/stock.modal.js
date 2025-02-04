import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
    code: String,
    productName: String,
    unit: String,
    currentStock: String,
    availableStock: String,
    salesDeal:  String,
    salesFree: String,
    purcDeal: String,
    purcFree:  String,
    costPrice: String,
    mrp: String,
    purchasePrice: String,
    salesPrice: String,
    company: String,
    manufacturer: String,
    recDate: String,
    batch: String,
    mfg: String,
    exp: String,
    supplier: String,
    invNo: String,
    invDate: String,
    rackNo: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Stock", StockSchema);
