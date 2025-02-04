import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
    name: String,
    description: String,
    city: String,
    creditPeriod: String,
    kraPin: String,
    dda: String,
    contactAddress: String,
    additionalContact: String,
    email: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    isLedgerRequired: Boolean,
    gstNumber: String,
    panNumber: String,
    name: String,
    companyName: String,
    contactNo: String,
    user: String,
    userEmail: String,
    userRole: String,
  });
  
export default mongoose.model('Supplier', SupplierSchema);