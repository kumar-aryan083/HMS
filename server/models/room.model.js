import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomNumber: {
      type: String,
      required: true,
      unique: true
    },
    capacity:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    roomType: {
      type: String,
      enum: ['Private Room', 'Shared Room', 'ICU', 'General Ward'],
      required: true
    },
    charges:{
        type: Number, 
        required: true
    },
    wingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wing',
      required: true
    },
    isOccupied: {
      type: Boolean,
      default: false
    },
  });
  
  export default mongoose.model('Room', roomSchema);
  