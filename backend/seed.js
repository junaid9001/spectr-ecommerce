const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

// Load environment config
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
  try {
    await connectDB();

    console.log('Reading db.json for products...');
    const rawData = fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8');
    const data = JSON.parse(rawData);

    // 1. Seed products
    console.log('Seeding products...');
    await Product.deleteMany();
    await Product.insertMany(data.products);
    console.log(`Seeded ${data.products.length} products successfully.`);

    // Fetch seeded products to create realistic orders referencing actual database items
    const products = await Product.find({});
    if (products.length === 0) {
      console.log('No products found to map orders.');
      process.exit(1);
    }

    // Helper to pick random products
    const getRandomProduct = () => products[Math.floor(Math.random() * products.length)];

    // 2. Define mock users with realistic order histories
    const mockUsers = [
      {
        username: "admin",
        email: "a@a",
        password: "admin123",
        isAdmin: true,
        ordersCount: 2
      },
      {
        username: "Junaid",
        email: "junaid@gmail.com",
        password: "junaid123",
        isAdmin: false,
        ordersCount: 4
      },
      {
        username: "Sara Connor",
        email: "sara@gmail.com",
        password: "user123",
        isAdmin: false,
        ordersCount: 3
      },
      {
        username: "Alex Mercer",
        email: "alex@gmail.com",
        password: "user123",
        isAdmin: false,
        ordersCount: 2
      },
      {
        username: "Ria Sen",
        email: "ria@gmail.com",
        password: "user123",
        isAdmin: false,
        ordersCount: 3
      }
    ];

    // Seed Users manually to trigger pre('save') password hashing
    console.log('Seeding users & generating order history...');
    await User.deleteMany();

    for (const u of mockUsers) {
      const userOrders = [];

      for (let i = 0; i < u.ordersCount; i++) {
        const prod = getRandomProduct();
        userOrders.push({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          img: prod.img,
          brand: prod.brand || "SPECTR",
          category: prod.category || "Sunglasses",
          quantity: Math.floor(Math.random() * 2) + 1,
          status: ["PAID // PROCESSING", "SHIPPED", "DELIVERED"][Math.floor(Math.random() * 3)]
        });
      }

      const user = new User({
        username: u.username,
        email: u.email,
        password: u.password,
        isAdmin: u.isAdmin,
        cart: [],
        wishlist: [],
        orders: userOrders
      });

      await user.save();
    }

    console.log(`Seeded ${mockUsers.length} users with dynamic order metrics successfully.`);
    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
