const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Stripe Webhook Endpoint (MUST be defined before express.json() is loaded to receive raw body)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('./models/User');

app.post(['/api/stripe/webhook', '/stripe/webhook'], express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const cartItems = JSON.parse(session.metadata.cartItems);

    try {
      console.log(`Payment success for session ${session.id}. Updating orders for user: ${userId}`);
      
      const user = await User.findById(userId);
      if (user) {
        // Map cartItems to user orders format
        const newOrders = cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          img: item.img,
          quantity: item.quantity
        }));

        // Append to existing orders and clear cart
        user.orders = [...(user.orders || []), ...newOrders];
        user.cart = [];

        await user.save();
        console.log(`Cleared cart and saved ${newOrders.length} orders for user.`);
      } else {
        console.error(`User ${userId} not found for updating orders.`);
      }
    } catch (dbErr) {
      console.error('Error updating user orders in webhook:', dbErr);
      return res.status(500).json({ error: dbErr.message });
    }
  }

  res.json({ received: true });
});

// Load JSON parsing & middleware for remaining endpoints
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Mount Routes (Supports both clean /api prefix and direct / compatibility paths)
app.use('/api/users', authRoutes);
app.use('/users', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
