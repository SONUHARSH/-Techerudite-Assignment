

import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import dotenv from 'dotenv';

dotenv.config();

// Send verification email function
const sendVerificationEmail = async (user) => {
  const verificationToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const verificationUrl = `${process.env.APP_URL}/api/auth/verify/${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Verify your email" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Email Verification',
    html: `<p>Click the link to verify your email: <a href="${verificationUrl}">Verify Email</a></p>`,
  });
};

// Common register function for admin and customer
const register = async (req, res, role) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw new ApiError(400, 'Email is already registered');
    }

    const newUser = await User.create({ firstName, lastName, email, password, role, isVerified: false });
    await sendVerificationEmail(newUser);

    res.status(201).json(new ApiResponse(201, { userId: newUser.id }, 'Registration successful. Please verify your email.'));
  } catch (error) {
    res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
};

// Admin login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.isVerified) {
      throw new ApiError(403, 'Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (user.role !== 'admin') {
      throw new ApiError(403, 'You are not allowed to login from here');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json(new ApiResponse(200, { token }, 'Login successful'));
  } catch (error) {
    res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
};

// Verify email function
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, null, 'Invalid or expired token'));
  }
};

export { register, login, verifyEmail };
