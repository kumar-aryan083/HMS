import mongoose from 'mongoose';

const wingSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
        type: String,
    },
    rooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }],
    user: String,
    userEmail: String,
    userRole: String,
  });
  
  export default mongoose.model('Wing', wingSchema);
  