import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  token: { type: String, required: true, unique: true },
  role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model('Invitation', invitationSchema);