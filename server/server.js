import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import User from './models/User.js';
import Job from './models/Job.js';
import Timesheet from './models/Timesheet.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port_number = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    
    app.listen(port_number, () => {
      console.log(`Server is running on port ${port_number}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

app.get('/api/status', (req, res) => {
  res.json({ message: 'Timesheet API is up and running with camelCase models!' });
});

// POST: Create a new User
app.post('/api/users', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, hourlyRate } = req.body;

    const new_user = new User({
      firstName,
      lastName,
      email,
      password, 
      role,
      hourlyRate
    });

    const saved_user = await new_user.save();
    res.status(201).json(saved_user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// POST: Create a new Job
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, description, managerId, coordinates } = req.body;

    const new_job = new Job({
      title,
      description,
      managerId, 
      location: {
        type: 'Point',
        coordinates: coordinates 
      }
    });

    const saved_job = await new_job.save();
    res.status(201).json(saved_job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

// GET: Fetch all Users
app.get('/api/users', async (req, res) => {
  try {
    const all_users = await User.find({});
    res.status(200).json(all_users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});
