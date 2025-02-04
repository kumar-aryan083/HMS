import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true  
    }, 
    sequence_value: { 
        type: Number, 
        required: true,
        default: 100000
     },
     user: String,
     userEmail: String,
     userRole: String,
});

export default mongoose.model('Counter', counterSchema);