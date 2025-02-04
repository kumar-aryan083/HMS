import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    head: String,
    date: {
        type: Date,
        default: Date.now,
    },
    time: {
        type: String,
        default: new Date().toLocaleTimeString(),
    },
    amount: String,
    paymentMode: String,
    details: String,
    expenseNo: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Expense", ExpenseSchema);
