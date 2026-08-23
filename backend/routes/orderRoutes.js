const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Product = require('../models/Product');

// Helper Admin Verification Middleware
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

// @desc    Create Stripe Checkout Session
// @route   POST /api/orders/checkout
router.post('/checkout', async (req, res) => {
  const { userId, cartItems } = req.body;

  try {
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const lineItems = cartItems.map((item) => {
      const imageUrl = item.img 
        ? (item.img.startsWith('http') ? item.img : `${process.env.FRONTEND_URL}${item.img}`)
        : '';

      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
            description: item.brand || 'SPECTR Product',
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/profile?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        userId: userId,
        cartItems: JSON.stringify(cartItems.map(item => ({
          id: item.id || item.productid,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          img: item.img || item.image || ''
        })))
      }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: error.message });
  }
});

// [ADMIN] Get all customer orders across all users
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    let allOrders = [];
    users.forEach((user) => {
      if (user.orders && user.orders.length > 0) {
        user.orders.forEach((order, index) => {
          allOrders.push({
            ...order,
            orderIndex: index, // Unique tracker per user
            userId: user.id || user._id.toString(),
            username: user.username,
            email: user.email
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

// [ADMIN] Get business statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    const productsCount = await Product.countDocuments();

    let totalRevenue = 0;
    let totalOrdersCount = 0;

    users.forEach((user) => {
      if (user.orders && user.orders.length > 0) {
        totalOrdersCount += user.orders.length;
        user.orders.forEach((order) => {
          totalRevenue += order.price * order.quantity;
        });
      }
    });

    res.json({
      totalRevenue,
      totalOrders: totalOrdersCount,
      totalClients: users.length,
      totalProducts: productsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [ADMIN] Update order shipping status
router.patch('/status', verifyAdmin, async (req, res) => {
  const { userId, orderIndex, productName, status } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.orders || user.orders.length === 0) {
      return res.status(400).json({ message: 'User has no orders' });
    }

    // Identify by index or name
    if (orderIndex !== undefined && user.orders[orderIndex]) {
      user.orders[orderIndex] = { ...user.orders[orderIndex], status };
    } else {
      user.orders = user.orders.map((order) => {
        if (order.name === productName) {
          return { ...order, status };
        }
        return order;
      });
    }

    user.markModified('orders');
    await user.save();

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
