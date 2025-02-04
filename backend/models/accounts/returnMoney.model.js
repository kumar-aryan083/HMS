import mongoose from "mongoose";

const ReturnMoneySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    patientName: String,
    amount: Number,
    remarks: String,
    returnDate: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("returnMoney", ReturnMoneySchema);
