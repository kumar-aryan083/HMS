import mongoose from "mongoose";

const InvoiceHeaderSchema = new mongoose.Schema({
  hospitalName: String,
  address: String,
  telephone: String,
  email: String,
  kraPin: String,
  dda: String,
  headerDescription: String,
  isActive: Boolean,
  logoImage: String,
  user: String,
  userEmail: String,
  userRole: String,
});

export default mongoose.model("InvoiceHeader", InvoiceHeaderSchema);
