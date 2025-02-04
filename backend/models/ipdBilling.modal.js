import mongoose from 'mongoose';

const IpdBillingSchema = new mongoose.Schema({
    type: String,
    user: String,
    userEmail: String,
    userRole: String,    
});

export default mongoose.model('IpdBilling', IpdBillingSchema);