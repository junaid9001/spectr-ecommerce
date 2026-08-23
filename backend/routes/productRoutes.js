const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

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

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product by id string (e.g. "1")
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

// [ADMIN] Create a new product
router.post('/', verifyAdmin, async (req, res) => {
  const { brand, name, price, description, img, category, features } = req.body;

  try {
    // Generate next sequential string ID
    const products = await Product.find({});
    let maxId = 0;
    products.forEach((p) => {
      const numId = parseInt(p.id, 10);
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId;
      }
    });
    const newId = String(maxId + 1);

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
