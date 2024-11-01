import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
    name: String,
    code: String, // Optional unique identifier for each test
    description: String,
    price: Number, // Optional, if pricing is involved
  });
  
export default mongoose.model('Test', TestSchema);
  