import mongoose from "mongoose";

const ChargesSchema = new mongoose.Schema({
    sNo: Number,
    treatment: String,
    nonNabh: Number,
    nonNabh10: Number,
    nabh: Number,
    nabh10: Number,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Charges", ChargesSchema);
