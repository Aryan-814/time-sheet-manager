import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import Timesheet from '../models/Timesheet.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

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

// GET: AI Weekly Summary
router.get('/ai-summary', protect, async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
          startTime: { $gte: startOfWeek },
          endTime: { $exists: true } 
        }
      },
      {
        $group: {
          _id: '$userId',
          totalWeeklyHours: { $sum: '$totalHours' },
          shiftCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users', 
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDetails'
        }
      },
      { $unwind: '$employeeDetails' },
      {
        $project: {
          _id: 0,
          employee: { $concat: ['$employeeDetails.firstName', ' ', '$employeeDetails.lastName'] },
          totalWeeklyHours: { $round: ['$totalWeeklyHours', 2] },
          shiftCount: 1
        }
      }
    ];

    const report = await Timesheet.aggregate(pipeline);

    if (report.length === 0) {
      return res.status(200).json({ summary: "There is no timesheet data for this week yet." });
    }

    const prompt = `You are a helpful AI assistant for a Timesheet Manager application.
Please analyze the following weekly timesheet data for a company and provide a concise, professional 3-sentence summary for the manager.
Highlight any notable trends, such as top performers, average hours, or potential overtime risks.
Do not use markdown formatting like bolding. Keep it simple and easy to read.
Data: ${JSON.stringify(report)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.status(200).json({ summary: response.text });
  } catch (error) {
    console.error('AI Summary error:', error);
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
});

// GET: AI Anomaly & Fraud Detection
router.get('/ai-anomalies', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pipeline = [
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
          startTime: { $gte: sevenDaysAgo }
        }
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'userId',
          foreignField: '_id',
          as: 'employeeDetails'
        }
      },
      { $unwind: '$employeeDetails' },
      {
        $project: {
          _id: 1,
          employee: { $concat: ['$employeeDetails.firstName', ' ', '$employeeDetails.lastName'] },
          startTime: 1,
          endTime: 1,
          totalHours: 1,
          approvalStatus: 1
        }
      },
      { $sort: { startTime: -1 } }
    ];

    const timesheets = await Timesheet.aggregate(pipeline);

    if (timesheets.length === 0) {
      return res.status(200).json({ anomalies: [] });
    }

    const prompt = `You are an AI fraud detection system for a Timesheet Manager application.
Your job is to analyze the following recent timesheets and flag any that look suspicious or anomalous.
Look for:
- Shifts that are extremely long (e.g., > 14 hours)
- Shifts that started or ended at very unusual hours (e.g., between 12 AM and 5 AM)
- Shifts that have no end time and started more than 24 hours ago
- Overlapping shifts for the same employee
- Unusually short shifts (e.g., < 30 minutes)

Respond ONLY with a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. Just output the raw JSON string starting with [ and ending with ].
Each object must have the following keys:
- "timesheetId": The _id of the flagged timesheet.
- "employee": The name of the employee.
- "reason": A short, clear explanation of why it was flagged.
- "severity": "High", "Medium", or "Low".

If no timesheets look suspicious, return an empty array [].

Data: ${JSON.stringify(timesheets)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Clean up potential markdown formatting from the response
    let jsonString = response.text.trim();
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const anomalies = JSON.parse(jsonString);

    res.status(200).json({ anomalies });
  } catch (error) {
    console.error('AI Anomalies error:', error);
    res.status(500).json({ error: 'Failed to detect anomalies', details: error.message });
  }
});

export default router;