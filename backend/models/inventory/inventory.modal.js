import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
    equipment: [],
    name: String,
    rate: String,
    quantity: Number,
    vendor: String,
    date: Date,
    gstNo: String,
    purchasedBy: String,
    department: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Inventory", InventorySchema);
