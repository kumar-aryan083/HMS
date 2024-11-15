import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
  },
  roomType: {
    type: String,
    enum: ['Private Room', 'Shared Room', 'ICU', 'General Ward'],
    required: true
  },
  charges: {
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
  currentOccupancy: {
    type: Number,
    default: 0
  },
  capacity: {
    type: Number,
    required: true
  }
});

// Middleware to check room availability before admitting a patient
roomSchema.methods.isAvailable = function() {
  return this.currentOccupancy < this.capacity;
};

export default mongoose.model('Room', roomSchema);
