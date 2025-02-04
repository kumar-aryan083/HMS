import mongoose from "mongoose";

const RackSchema = new mongoose.Schema({
    store: String,
    rackNo: String,
    parentRack: String,
    description: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Rack", RackSchema);
