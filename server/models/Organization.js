import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  allowedIP: { type: String, default: '' }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Organization', organizationSchema);