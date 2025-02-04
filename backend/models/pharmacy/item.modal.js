import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
    salesCategory: String,
    name: String,
    code: String,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    itemType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemType",
    },
    uom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UOM",
    },
    genericName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GenericName",
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isInternationalBrand: Boolean,
    ccCharge: Number,
    isNarcotic: Boolean,
    reOrderQuantity: Number,
    minStockQuantity: Number,
    dosage: String,
    budgetedQuantity: Number,
    isVATApplicable: Boolean,
    categoryOne: {
        type: String,
        enum: ["Category A", "Category B", "Category C"],
    },
    categoryTwo: {
        type: String,
        enum: ["Category V", "Category E", "Category D"],
    },
    purchaseRate: Number,
    salesRate: Number,
    purchaseDiscount: Number,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Item", ItemSchema);
