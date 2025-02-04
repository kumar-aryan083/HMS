import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: String,
    userEmail: String,
    userRole: String,
}, {timestamps: true});

export default mongoose.model("Medication", medicationSchema);