import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
} from '../controllers/orderController.js';
const router = express.Router();
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/all', authMiddleware, adminMiddleware,getAllOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;