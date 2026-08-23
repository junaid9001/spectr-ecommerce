const express = require('express');
const router = express.Router();
const User = require('../models/UserValo');
const Product = require('../models/ProductValo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper Admin verification middleware
const verifyAdmin = async (req, res, next) => {
  const adminId = req.headers['x-admin-id'] || req.query.adminId;
  if (!adminId) {
    return res.status(401).json({ message: "Admin authorization required" });
  }
  try {
    const user = await User.findById(adminId);
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// @desc    Get Stats for Admin Overview Dashboard
// @route   GET /api/orders_valo/stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    const productsCount = await Product.countDocuments({});

    let totalRevenue = 0;
    let totalOrders = 0;
    const clientSet = new Set();

    users.forEach((user) => {
      if (user.orders && user.orders.length > 0) {
        totalOrders += user.orders.length;
        clientSet.add(user._id.toString());
        user.orders.forEach((order) => {
          totalRevenue += (order.price || 0) * (order.quantity || 1);
        });
      }
    });

    res.json({
      totalRevenue,
      totalOrders,
      totalClients: clientSet.size,
      totalProducts: productsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders across all users (Admin fulfillment view)
// @route   GET /api/orders_valo/all
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    let allOrders = [];

    users.forEach((user) => {
      if (user.orders && user.orders.length > 0) {
        user.orders.forEach((order) => {
          allOrders.push({
            userId: user._id,
            username: user.username,
            email: user.email,
            ...order,
          });
        });
      }
    });

    // Return newest orders first
    res.json(allOrders.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update delivery / fulfillment status of an order
// @route   PATCH /api/orders_valo/status
router.patch('/status', verifyAdmin, async (req, res) => {
  try {
    const { userId, orderIndex, productName, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let orderUpdated = false;

    user.orders = user.orders.map((order, idx) => {
      if (order.orderIndex === orderIndex || order.name === productName) {
        orderUpdated = true;
        return { ...order, status };
      }
      return order;
    });

    if (!orderUpdated) {
      return res.status(404).json({ message: "Order transaction not found under user profile" });
    }

    user.markModified('orders');
    await user.save();

    res.json({ message: "Order status updated successfully", orders: user.orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create Stripe checkout session (For real stripe checkout integration)
// @route   POST /api/orders_valo/checkout
router.post('/checkout', async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: [item.product.image.startsWith('http') ? item.product.image : `${process.env.FRONTEND_URL || 'http://localhost:3000'}${item.product.image}`],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        userId,
        cartItems: JSON.stringify(cartItems.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          img: item.product.image,
          quantity: item.quantity,
        }))),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
