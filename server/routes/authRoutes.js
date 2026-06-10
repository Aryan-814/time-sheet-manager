import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const router = express.Router();

// POST: Register a new Company & Admin
router.post('/register-company', async (req, res) => {
  try {
    //Find if it exists
    const { companyName, firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // create a new one
    const newOrg = new Organization({ name: companyName });
    const savedOrg = await newOrg.save();

     //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create the admin user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'Admin',
      hourlyRate: 0, 
      organizationId: savedOrg._id
    });
    
    const savedUser = await newUser.save();

    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        role: savedUser.role, 
        organizationId: savedOrg._id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } 
    );

    res.status(201).json({ token, user: { firstName, lastName, role: savedUser.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST: Login User
router.post('/login', async (req, res) => {
  try {
    //Find the user
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role, 
        organizationId: user.organizationId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, user: { firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

export default router;