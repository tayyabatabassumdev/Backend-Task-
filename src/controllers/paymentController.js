import Order from '../models/Order.js';
import {
  createStripePaymentIntent,
  constructStripeEvent,
  confirmStripePaymentIntent,
  handlePaymentSucceeded,
  handlePaymentProcessing,
  handlePaymentFailed,
  handlePaymentCancelled,
} from '../services/stripeService.js';

export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    if (order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be paid. Status: ${order.status}`,
      });
    }

    const paymentIntent = await createStripePaymentIntent(order, req.user.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.totalAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  let event;

  try {
    event = constructStripeEvent(req);
  } catch (error) {
    console.error('Webhook Signature Error:', error.message);
    return res.status(400).send('Webhook verification failed');
  }

  const intent = event.data.object;

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(intent);
      break;

    case 'payment_intent.processing':
      await handlePaymentProcessing(intent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(intent);
      break;

    case 'payment_intent.canceled':
      await handlePaymentCancelled(intent);
      break;

    default:
      console.log('Ignored:', event.type);
  }

  res.json({ received: true });
};

export const confirmPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res
        .status(400)
        .json({ success: false, message: 'paymentIntentId required' });
    }

    const intent = await confirmStripePaymentIntent(paymentIntentId);

    res.json({
      success: true,
      status: intent.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
