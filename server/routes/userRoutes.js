import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST: Create a new User
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, hourlyRate, organizationId } = req.body;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password, 
      role,
      hourlyRate,
      organizationId
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// GET: Fetch all Users
router.get('/', async (req, res) => {
  try {
    const allUsers = await User.find({ organizationId: req.user.organizationId});
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

export default router;