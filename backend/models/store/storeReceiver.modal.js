import mongoose from "mongoose";

const StoreReceiverSchema = new mongoose.Schema({
    name: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    },
    phone: String,
    code: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("StoreReceiver", StoreReceiverSchema);
