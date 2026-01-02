import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createPaymentIntent,
  handleWebhook,
  confirmPaymentIntent,
} from '../controllers/paymentController.js';
const router = express.Router();
router.post('/create-payment-intent', authMiddleware, createPaymentIntent);
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);
router.post('/confirm-payment-intent', confirmPaymentIntent);

export default router;