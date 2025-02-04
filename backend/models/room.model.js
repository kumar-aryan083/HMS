import mongoose from "mongoose";

const BedSchema = new mongoose.Schema({
  bedName: { type: String },
  isOccupied: { type: Boolean, default: false },
});

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
    enum: ['Private Room', 'Shared Room', 'ICU', 'General Room'],
  },
  wingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wing',
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  capacity: [Number],
  beds: [BedSchema],
  user: String,
  userEmail: String,
  userRole: String,
});

// Middleware to check room availability before admitting a patient
roomSchema.methods.isAvailable = function() {
  return this.currentOccupancy < this.capacity;
};

export default mongoose.model('Room', roomSchema);
