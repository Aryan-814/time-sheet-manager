import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Staff', 'Manager', 'Admin'], 
    default: 'Staff' 
  },
  hourlyRate: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  }
}, { 
  timestamps: true 
});

export default mongoose.model('User', userSchema);