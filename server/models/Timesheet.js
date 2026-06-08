import mongoose from 'mongoose';

const timesheetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date }, 
  totalHours: { type: Number }, 
  approvalStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  managerNotes: { type: String }
}, { timestamps: true });

timesheetSchema.index({ userId: 1, startTime: -1 });
timesheetSchema.index({ jobId: 1 });

export default mongoose.model('Timesheet', timesheetSchema);