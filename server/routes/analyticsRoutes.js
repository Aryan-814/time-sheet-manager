import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import Timesheet from '../models/Timesheet.js';

const router = express.Router();

// GET: Weekly Overtime Report
router.get('/overtime', protect, async (req, res) => {
  try {
    //  the date for the start of the current week 
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const pipeline = [
      // Filter for THIS company, week, and only COMPLETED shifts
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
          startTime: { $gte: startOfWeek },
          endTime: { $exists: true } 
        }
      },
      //Group all timesheets together by the Employee (userId) and sum their hours
      {
        $group: {
          _id: '$userId',
          totalWeeklyHours: { $sum: '$totalHours' }
        }
      },
      // Join the User collection to get their actual name
      {
        $lookup: {
          from: 'users', 
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDetails'
        }
      },
      { $unwind: '$employeeDetails' },
      // Format the final output and calculate their "Status"
      {
        $project: {
          _id: 1,
          firstName: '$employeeDetails.firstName',
          lastName: '$employeeDetails.lastName',
          totalWeeklyHours: { $round: ['$totalWeeklyHours', 2] },
          status: {
            $switch: {
              branches: [
                { case: { $gte: ['$totalWeeklyHours', 40] }, then: 'Overtime Risk' },
                { case: { $gte: ['$totalWeeklyHours', 35] }, then: 'Approaching Overtime' }
              ],
              default: 'Standard'
            }
          }
        }
      },
      { $sort: { totalWeeklyHours: -1 } }
    ];

    const report = await Timesheet.aggregate(pipeline);
    res.status(200).json(report);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics report' });
  }
});

export default router;