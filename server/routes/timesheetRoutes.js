import express from 'express';
import Timesheet from '../models/Timesheet.js';

const router = express.Router();

// POST: Clock In
router.post('/clock-in', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const newTimesheet = new Timesheet({
      userId,
      jobId,
      startTime: new Date(),
      organizationId: req.user.organizationId
    });

    const savedTimesheet = await newTimesheet.save();
    res.status(201).json(savedTimesheet);
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ error: 'Failed to clock in', details: error.message });
  }
});

// PUT: Clock Out
router.put('/clock-out/:id', async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const currentEndTime = new Date();

    const activeShift = await Timesheet.findById(timesheetId);
    if (!activeShift) return res.status(404).json({ error: 'Timesheet session not found' });
    if (activeShift.endTime) return res.status(400).json({ error: 'Already clocked out of this shift' });

    const diffInMs = currentEndTime - activeShift.startTime;
    const calculatedHours = (diffInMs / (1000 * 60 * 60)).toFixed(2); 

    activeShift.endTime = currentEndTime;
    activeShift.totalHours = parseFloat(calculatedHours);
    
    const updatedTimesheet = await activeShift.save();
    res.status(200).json(updatedTimesheet);
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ error: 'Failed to clock out', details: error.message });
  }
});

// GET: Fetch all Timesheets
router.get('/', async (req, res) => {
  try {
    const allTimesheets = await Timesheet.find({ organizationId: req.user.organizationId })
      .populate('userId', 'firstName lastName email')
      .populate('jobId', 'title');
    res.status(200).json(allTimesheets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timesheets', details: error.message });
  }
});

export default router;