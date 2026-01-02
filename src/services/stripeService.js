import Stripe from 'stripe';
import Order from '../models/Order.js';
import { sendEmail } from './emailService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (order, userId) => {
  return await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
    metadata: {
      orderId: order._id.toString(),
      userId,
    },
  });
};

export const constructStripeEvent = (req) => {
  const sig = req.headers['stripe-signature'];
  return stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

export const confirmStripePaymentIntent = async (paymentIntentId) => {
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: 'pm_card_visa',
  });
};

export const handlePaymentSucceeded = async (intent) => {
  const orderId = intent.metadata.orderId;

  const order = await Order.findById(orderId).populate('userId');
  if (!order) return;

  order.status = 'confirmed';
  order.stripePaymentId = intent.id;
  await order.save();

  await sendEmail(
    order.userId.email,
    'Payment Successful',
    `Your payment of $${intent.amount / 100} was successful.\nOrder ID: ${orderId}`
  );
};

export const handlePaymentProcessing = async (intent) => {
  await Order.findByIdAndUpdate(intent.metadata.orderId, {
    status: 'processing',
  });
};

export const handlePaymentFailed = async (intent) => {
  await Order.findByIdAndUpdate(intent.metadata.orderId, {
    status: 'failed',
  });
};

export const handlePaymentCancelled = async (intent) => {
  await Order.findByIdAndUpdate(intent.metadata.orderId, {
    status: 'cancelled',
  });
};
