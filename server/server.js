import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', protect, jobRoutes);
app.use('/api/timesheets', protect, timesheetRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/analytics', protect, analyticsRoutes);

app.get('/api/status', (req, res) => {
  res.json({ message: 'Timesheet API is up and running with modular routes!' });
});

const portNumber = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    app.listen(portNumber, () => {
      console.log(`Server is running on port ${portNumber}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });