import mongoose from "mongoose";

const LookUpSchema = new mongoose.Schema({
    moduleName: String,
    lookupName: String,
    description: String,
    lookUpData: [String],
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("LookUp", LookUpSchema);
