import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    departmentName: String,
    name: String,
    phoneNumber: String,
    email: String,
    address: String,
    adhaar: String,
    pan: String,
    bank: String,
    salary: Number,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Staff", StaffSchema);