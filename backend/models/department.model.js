import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  location: {
    type: String,
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
  }],
  user: String,
  userEmail: String,
  userRole: String,
},{timestamps: true});

export default mongoose.model('Department', departmentSchema);
