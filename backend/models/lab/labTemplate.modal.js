import mongoose from "mongoose";

const LabTemplateSchema = new mongoose.Schema({
    name: String,
    shortName: String,
    description: String,
    templateType: String,
    columnSettings: [String],
    headerText: String,
    isDefault: Boolean,
    footerText: String,
    displaySequence: Number,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("LabTemplate", LabTemplateSchema);
