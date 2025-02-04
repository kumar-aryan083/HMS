import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dept: {
        type: String
    },
    user: String,
    userEmail: String,
    userRole: String,
}, {timestamps: true});

export default mongoose.model("Employee", employeeSchema);