import mongoose from "mongoose";

const StoreVendorsSchema = new mongoose.Schema({
    companyName: String,
    gstNo: String,
    contactPerson: String,
    contactNo1: String,
    contactNo2: String,
    address: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("StoreVendors", StoreVendorsSchema);
