import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
    storeItems: [],
    name: String,
    quantity: Number,
    rate: Number,
    purchaseTotal: Number,
    purchaseDate: Date,
    byPerson: String,
    user: String,
    userEmail: String,
    userRole: String,
});

export default mongoose.model("Store", StoreSchema);
