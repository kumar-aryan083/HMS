import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    genericName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GenericName",
    }
});

const SupplierOrderSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
    },
    orderDate: Date,
    deliveryDays: Number,
    deliveryDate: Date,
    refNo: String,
    invoiceAddress: String,
    deliveryAddress: String,
    contact: String,
    items: [itemSchema],
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("SupplierOrder", SupplierOrderSchema);