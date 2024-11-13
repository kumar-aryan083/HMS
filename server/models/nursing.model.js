import mongoose from "mongoose";

const nursingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"]
  },
  perUnitPrice: {
    type: Number,
    required: true
  }
});

export default mongoose.model("Nursing", nursingSchema);
