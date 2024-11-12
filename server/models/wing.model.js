import mongoose from 'mongoose';

const wingSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
        type: String,
        required: true
    },
    rooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }],
  });
  
  export default mongoose.model('Wing', wingSchema);
  