

import express from 'express';
import { register, login, verifyEmail } from '../controllers/userController';

const router = express.Router();

// Customer Registration
router.post('/register/customer', (req, res) => register(req, res, 'customer'));

// Admin Registration
router.post('/register/admin', (req, res) => register(req, res, 'admin'));

// Admin Login
router.post('/login/admin', login);

// Email Verification
router.get('/verify/:token', verifyEmail);

export default router;
