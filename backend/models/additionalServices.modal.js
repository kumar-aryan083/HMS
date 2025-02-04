import mongoose from "mongoose";

const AdditionalServicesSchema = new mongoose.Schema({
    name: String,
    generalFees: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("AdditionalServices", AdditionalServicesSchema);