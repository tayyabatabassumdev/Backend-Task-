import mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: 'Pakistan',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      selectedVariants: [
        {
          type: {
            type: String,
          },
          value: {
            type: String,
          },
          variantPrice: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: addressSchema,
    required: true,
  },
  billingAddress: {
    type: addressSchema,
    required: false,
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard',
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  estimatedDeliveryDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'failed',
      'cancelled',
    ],
    default: 'pending',
  },
  timeline: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      message: String,
    },
  ],
  stripePaymentId: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
export default mongoose.model('Order', orderSchema);
