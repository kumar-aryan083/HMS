import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
    name: String,
    code: String,
    address: String,
    contactNumber: String,
    email: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Vendor", VendorSchema);
