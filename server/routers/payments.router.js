import express from 'express';
import { getAllPayments } from '../controllers/payment.controller.js'; // Assuming you have a controller for handling payment-related logic
import { verifyToken } from '../verifyToken.js';

const router = express.Router();

// Route for fetching all payments
router.get('/payments',verifyToken, getAllPayments);

export default router;
