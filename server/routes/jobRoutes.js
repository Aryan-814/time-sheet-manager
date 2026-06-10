import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();

// POST: Create a new Job
router.post('/', async (req, res) => {
  try {
    const { title, description, managerId, coordinates } = req.body;

    const newJob = new Job({
      title,
      description,
      managerId, 
      location: {
        type: 'Point',
        coordinates: coordinates 
      }
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

// GET: Fetch all Jobs
router.get('/', async (req, res) => {
  try {
    const allJobs = await Job.find({}).populate('managerId', 'firstName lastName email');
    res.status(200).json(allJobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

export default router;