import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  headOfDepartment: {
    type: String,
  },
  servicesOffered: {
    type: [String], 
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }]
},{timestamps: true});

export default mongoose.model('Department', departmentSchema);
