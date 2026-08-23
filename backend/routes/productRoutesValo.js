const express = require('express');
const router = express.Router();
const Product = require('../models/ProductValo');
const User = require('../models/UserValo');

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

// @desc    Get all products
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get product by id
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [ADMIN] Create a product
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { brand, name, price, description, img, category, features } = req.body;

    const count = await Product.countDocuments({});
    const newId = `product-valo-${count + 1 + Math.floor(Math.random() * 1000)}`;

    const product = new Product({
      id: newId,
      brand,
      name,
      price: Number(price),
      description,
      img,
      category,
      features: typeof features === 'string' ? features.split(',').map(f => f.trim()) : features
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// [ADMIN] Update a product
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      const fields = ['brand', 'name', 'price', 'description', 'img', 'category', 'features'];
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'price') {
            product.price = Number(req.body.price);
          } else if (field === 'features') {
            product.features = typeof req.body.features === 'string'
              ? req.body.features.split(',').map(f => f.trim())
              : req.body.features;
          } else {
            product[field] = req.body[field];
          }
        }
      });

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [ADMIN] Delete a product
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      await Product.deleteOne({ id: req.params.id });
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
