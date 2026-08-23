const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    productId: { type: String, required: true }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: { type: String, default: 'Stripe' },
  stripeSessionId: { type: String },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  totalPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
