import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, billingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough quantity for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        productName: product.name,
      });
    }

    let existingOrder = await Order.findOne({
      userId: req.user.id,
      status: 'pending',
    });

    let orderMessage = '';
    let order;

    if (existingOrder) {
      for (const newProduct of validatedProducts) {
        const existingProduct = existingOrder.products.find(
          (p) => p.productId.toString() === newProduct.productId
        );

        if (existingProduct) {
          existingProduct.quantity += newProduct.quantity;
        } else {
          existingOrder.products.push({
            productId: newProduct.productId,
            quantity: newProduct.quantity,
            price: newProduct.price,
          });
        }
      }

      let newTotal = 0;
      for (const product of existingOrder.products) {
        newTotal += product.price * product.quantity;
      }

      existingOrder.totalAmount = newTotal;

      if (!existingOrder.shippingAddress) {
        existingOrder.shippingAddress = shippingAddress;
      }

      if (billingAddress && !existingOrder.billingAddress) {
        existingOrder.billingAddress = billingAddress;
      }

      order = await existingOrder.save();
      orderMessage = 'Products added to existing pending order';
    } else {
      order = new Order({
        userId: req.user.id,
        products: validatedProducts,
        totalAmount,
        shippingAddress,
        billingAddress,
        status: 'pending',
      });

      await order.save();
      orderMessage = 'Order created successfully';
    }

    const user = await User.findById(req.user.id);

    const productList = validatedProducts
      .map(
        (p) =>
          `- ${p.productName}: ${p.quantity} x $${p.price} = $${(
            p.quantity * p.price
          ).toFixed(2)}`
      )
      .join('\n');

    await sendEmail(
      user.email,
      'Order Created / Updated',
      `${orderMessage}!\n\nOrder ID: ${order._id}\n\nProducts:\n${productList}\n\nTotal Amount: $${order.totalAmount.toFixed(
        2
      )}\n\nNext: Proceed to payment`
    );

    res.status(existingOrder ? 200 : 201).json({
      success: true,
      message: orderMessage,
      data: {
        orderId: order._id,
        userId: order.userId,
        products: order.products,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('products.productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId')
      .populate('products.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      order.userId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};
