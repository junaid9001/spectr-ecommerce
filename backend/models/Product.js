const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Keep text ID for frontend compatibility
  name: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  imga: { type: String },
  brand: { type: String },
  category: { type: String },
  description: { type: String },
  features: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
