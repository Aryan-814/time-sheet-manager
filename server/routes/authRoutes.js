import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import crypto from 'crypto';
import { protect } from '../middleware/authMiddleware.js';
import Invitation from '../models/Invitation.js';

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

// POST: Manager Generates an Invitation Link
router.post('/invite', protect, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Not authorized to send invitations' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const newInvite = new Invitation({
      email,
      organizationId: req.user.organizationId,
      token,
      role: role || 'Staff',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
    });

    await newInvite.save();

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join?token=${token}`;

    res.status(201).json({ message: 'Invitation created', inviteLink });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});


// POST: Employee Registers Using the Magic Link (UNPROTECTED ROUTE)
router.post('/register-employee', async (req, res) => {
  try {
    const { token, firstName, lastName, password } = req.body;

    // Find the invitation in the database using the token from the URL
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }

    // Check if the token has expired
    if (invitation.expiresAt < new Date()) {
      await Invitation.deleteOne({ _id: invitation._id }); // Clean up old token
      return res.status(400).json({ error: 'This invitation has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the User
    const newUser = new User({
      firstName,
      lastName,
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      hourlyRate: 0, 
      organizationId: invitation.organizationId 
    });

    const savedUser = await newUser.save();

    // Delete the invitation so it cannot be used again
    await Invitation.deleteOne({ _id: invitation._id });

    //  Generate their JWT 
    const jwtToken = jwt.sign(
      { 
        userId: savedUser._id, 
        role: savedUser.role, 
        organizationId: savedUser.organizationId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token: jwtToken, user: { firstName, lastName, role: savedUser.role } });
  } catch (error) {
    console.error('Employee registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

export default router;