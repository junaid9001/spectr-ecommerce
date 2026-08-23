const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/ProductValo');
const User = require('./models/UserValo');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const mockSkincare = [
  {
    id: "serum",
    name: "Hydrating Face Serum",
    category: "Serums",
    price: 48,
    image: "/products/serum.jpg",
    description: "A deep hydrating serum enriched with multi-weight hyaluronic acid and organic sea buckthorn extract to lock in moisture and plump skin cells.",
    features: ["Hyaluronic Acid", "Sea Buckthorn Extract", "Glycerin"]
  },
  {
    id: "cream",
    name: "Restorative Barrier Cream",
    category: "Creams",
    price: 64,
    image: "/products/cream.jpg",
    description: "A rich restorative cream designed to heal and lock in the skin barrier with essential ceramides, squalane, and organic birch sap.",
    features: ["Birch Sap", "Squalane", "Ceramide NP", "Panthenol"]
  },
  {
    id: "cleanser",
    name: "Gentle Gel Cleanser",
    category: "Cleansers",
    price: 36,
    image: "/products/cleanser.jpg",
    description: "A pH-balanced foaming gel cleanser that sweeps away impurities, makeup, and excess oil without stripping the skin's natural moisture barrier.",
    features: ["Lauryl Glucoside", "Cocamidopropyl Betaine", "Aloe Vera"]
  },
  {
    id: "oil",
    name: "Balancing Botanical Oil",
    category: "Oils",
    price: 58,
    image: "/products/oil.jpg",
    description: "A lightweight, cold-pressed botanical oil blend designed to balance sebum production, soothe redness, and restore skin elasticity.",
    features: ["Jojoba Seed Oil", "Rosehip Fruit Oil", "Squalane"]
  },
  {
    id: "tonic",
    name: "Rosewater Hydrating Tonic",
    category: "Cleansers",
    price: 32,
    image: "/products/tonic.jpg",
    description: "A refreshing mist infused with organic Bulgarian rosewater and alpine herb extracts to soothe, tone, and prep the skin for serums.",
    features: ["Rosewater", "Glycerin", "Centella Asiatica"]
  },
  {
    id: "mask",
    name: "Clarifying Clay Mask",
    category: "Creams",
    price: 42,
    image: "/products/mask.jpg",
    description: "A mineral-rich kaolin clay mask designed to draw out impurities, refine pore appearance, and gently exfoliate the skin for a smooth complexion.",
    features: ["Kaolin Clay", "Bentonite", "Charcoal", "Salicylic Acid"]
  },
  {
    id: "balm",
    name: "Nourishing Lip Balm",
    category: "Creams",
    price: 18,
    image: "/products/balm.jpg",
    description: "A soothing lip balm formulated with organic shea butter and cloudberry seed oil to nourish, repair, and protect dry lips from cold weather.",
    features: ["Shea Butter", "Beeswax", "Cloudberry Seed Oil"]
  },
  {
    id: "essence",
    name: "Fermented Treatment Essence",
    category: "Serums",
    price: 72,
    image: "/products/essence.jpg",
    description: "A highly concentrated essence featuring 90% fermented yeast extract to speed up cellular renewal, brighten dark spots, and smooth texture.",
    features: ["Yeast Extract", "Niacinamide", "Adenosine"]
  },
  {
    id: "peel",
    name: "AHA/BHA Exfoliating Peel",
    category: "Serums",
    price: 52,
    image: "/products/peel.jpg",
    description: "A powerful weekly peeling solution with 10% AHA and 2% BHA to dissolve dead skin cells, clear congestion, and reveal radiant skin.",
    features: ["Glycolic Acid", "Salicylic Acid", "Lactic Acid"]
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // 1. Seed products_valo
    console.log('Seeding Valo Skin catalog products...');
    await Product.deleteMany();
    
    const formattedProducts = mockSkincare.map(p => ({
      id: p.id,
      brand: "VALO SKIN",
      name: p.name,
      price: p.price,
      description: p.description,
      img: p.image,
      category: p.category,
      features: p.features
    }));

    await Product.insertMany(formattedProducts);
    console.log(`Seeded ${mockSkincare.length} skincare products.`);

    const products = await Product.find({});

    // 2. Define mock users with realistic Valo orders
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
        username: "Ria Sen",
        email: "ria@gmail.com",
        password: "user123",
        isAdmin: false,
        ordersCount: 2
      }
    ];

    console.log('Seeding users and generating skincare orders...');
    await User.deleteMany();

    for (const u of mockUsers) {
      const userOrders = [];

      for (let i = 0; i < u.ordersCount; i++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        userOrders.push({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          img: prod.img,
          brand: "VALO SKIN",
          category: prod.category,
          quantity: Math.floor(Math.random() * 2) + 1,
          status: ["PAID // PROCESSING", "SHIPPED", "DELIVERED"][Math.floor(Math.random() * 3)],
          orderIndex: i
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

    console.log(`Seeded ${mockUsers.length} Valo users successfully.`);
    console.log('Valo Skin Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Valo Seeding error:', error);
    process.exit(1);
  }
};

seedData();
