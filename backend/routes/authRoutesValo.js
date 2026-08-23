const express = require('express');
const router = express.Router();
const User = require('../models/UserValo');

// @desc    Register a new user
// @route   POST /api/users
router.post('/', async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      isAdmin: isAdmin || false,
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        cart: user.cart,
        wishlist: user.wishlist,
        orders: user.orders
      });
    } else {
      res.status(450).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.password === password) {
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        cart: user.cart,
        wishlist: user.wishlist,
        orders: user.orders
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users or find user by id/email
// @route   GET /api/users
router.get('/', async (req, res) => {
  try {
    const { id, email } = req.query;

    if (id) {
      const user = await User.findById(id);
      return res.json(user ? [user] : []);
    }

    if (email) {
      const user = await User.findOne({ email });
      return res.json(user ? [user] : []);
    }

    const users = await User.find({});
    // Format id correctly for directory mapping
    const formatted = users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      isAdmin: u.isAdmin,
      orders: u.orders
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile, cart, or orders
// @route   PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (req.body.cart !== undefined) {
        user.cart = req.body.cart;
      }
      if (req.body.orders !== undefined) {
        user.orders = req.body.orders;
      }
      if (req.body.wishlist !== undefined) {
        user.wishlist = req.body.wishlist;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin verification middleware
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

// [ADMIN] Toggle User Admin Role
router.patch('/:id/role', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isAdmin = req.body.isAdmin;
      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        orders: updatedUser.orders
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [ADMIN] Delete User
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: req.params.id });
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
