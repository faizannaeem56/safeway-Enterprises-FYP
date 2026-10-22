/**
 * ============================================================================
 * FILE: backend/seed.js
 * PURPOSE: Populates MongoDB with initial test users (Admin + Customer) and
 *          14 realistic tech products across all 7 required categories.
 * HOW TO RUN: `npm run seed` inside the `backend/` folder.
 * ============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Message = require('./models/Message');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/safeway_enterprises';

const sampleProducts = [
  // 1. Computers
  {
    name: 'Safeway Titan Pro RTX 4070 Gaming Desktop',
    category: 'Computers',
    price: 1499,
    stock: 8,
    warranty: '2 Years Official Safeway Hardware Warranty',
    specs: 'Intel Core i7-14700KF, NVIDIA RTX 4070 12GB, 32GB DDR5 RAM, 1TB NVMe SSD',
    description: 'Custom-built high-airflow desktop workstation and 1440p/4K gaming powerhouse engineered by Safeway Enterprises.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    featured: true
  },
  {
    name: 'Dell OptiPlex 7010 Business Mini Tower PC',
    category: 'Computers',
    price: 649,
    stock: 15,
    warranty: '1 Year Official Dell Warranty',
    specs: 'Intel Core i5-13500, 16GB DDR4 RAM, 512GB NVMe SSD, Windows 11 Pro',
    description: 'Reliable, whisper-quiet office and university desktop computer built for multitasking and enterprise productivity.',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    featured: false
  },

  // 2. Laptops
  {
    name: 'ASUS ROG Strix G16 Gaming Laptop',
    category: 'Laptops',
    price: 1299,
    stock: 11,
    warranty: '2 Years International + Safeway Warranty',
    specs: 'Intel Core i7-13650HX, RTX 4060 8GB, 16GB DDR5, 1TB SSD, 16" 165Hz Display',
    description: 'High-refresh-rate esports and engineering laptop with tri-fan cooling technology and per-key RGB keyboard.',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    featured: true
  },
  {
    name: 'Apple MacBook Air 15-inch (M3 Chip)',
    category: 'Laptops',
    price: 1199,
    stock: 9,
    warranty: '1 Year Official Apple Care Warranty',
    specs: 'Apple M3 8-Core CPU, 10-Core GPU, 16GB Unified Memory, 512GB SSD, 18-Hr Battery',
    description: 'Ultra-thin, fanless powerhouse ideal for software developers, university students, and creative professionals.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    featured: true
  },
  {
    name: 'HP Pavilion 15 Student Edition Laptop',
    category: 'Laptops',
    price: 579,
    stock: 20,
    warranty: '1 Year Official HP Warranty',
    specs: 'AMD Ryzen 5 7530U, 16GB RAM, 512GB NVMe SSD, 15.6" Full HD IPS Anti-Glare',
    description: 'Budget-friendly everyday laptop tailored for university assignments, coding projects, and streaming.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    featured: false
  },

  // 3. Smart Watches
  {
    name: 'Apple Watch Series 10 GPS 45mm',
    category: 'Smart Watches',
    price: 399,
    stock: 14,
    warranty: '1 Year Official Apple Replacement Warranty',
    specs: 'Always-On Retina OLED, ECG & Blood Oxygen Sensor, Water Resistant 50m, WatchOS 11',
    description: 'Next-generation fitness, health tracking, and smart notification companion with fast wireless charging.',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    featured: true
  },
  {
    name: 'Samsung Galaxy Watch 7 Bluetooth 44mm',
    category: 'Smart Watches',
    price: 289,
    stock: 18,
    warranty: '1 Year Official Samsung Warranty',
    specs: 'Sapphire Crystal Glass, BioActive Health Sensor, Dual-Frequency GPS, 40-Hr Battery',
    description: 'Precision sleep coaching, workout tracking, and seamless Android integration in an aluminum frame.',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    featured: false
  },

  // 4. Phones
  {
    name: 'Samsung Galaxy S24 Ultra 5G (512GB)',
    category: 'Phones',
    price: 1149,
    stock: 7,
    warranty: '1 Year Official PTA-Approved Brand Warranty',
    specs: 'Snapdragon 8 Gen 3, 200MP Quad Camera, Titanium Frame, Built-in S-Pen, 5000mAh',
    description: 'Flagship Android smartphone with Galaxy AI features, 120Hz Dynamic AMOLED 2X display, and pro-grade zoom.',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    featured: true
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro 5G (256GB)',
    category: 'Phones',
    price: 329,
    stock: 25,
    warranty: '1 Year Official Airlink / Safeway Warranty',
    specs: '200MP OIS Camera, 120Hz AMOLED Display, 67W Turbo Charging, 8GB RAM + 256GB Storage',
    description: 'Best-selling mid-range smartphone delivering flagship-level photography and all-day battery life.',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    featured: false
  },

  // 5. Mobile Accessories
  {
    name: 'Anker Prime 20,000mAh 200W Power Bank',
    category: 'Mobile Accessories',
    price: 89,
    stock: 30,
    warranty: '1 Year Official Anker Replacement Warranty',
    specs: '20,000mAh Capacity, Dual USB-C + USB-A, Smart Digital OLED Screen, 100W Fast Input',
    description: 'High-capacity portable charger capable of fast-charging phones, tablets, and USB-C laptops simultaneously.',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    featured: false
  },
  {
    name: 'Sony WF-1000XM5 Wireless Noise Cancelling Earbuds',
    category: 'Mobile Accessories',
    price: 199,
    stock: 16,
    warranty: '6 Months Official Safeway Replacement Warranty',
    specs: 'Industry-Leading ANC, LDAC Hi-Res Audio, 24-Hr Total Battery, Multipoint Bluetooth 5.3',
    description: 'Studio-grade wireless earbuds with AI crystal-clear call microphones and ergonomic memory foam tips.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    featured: true
  },

  // 6. Laptop Accessories
  {
    name: 'Baseus 11-in-1 USB-C Thunderbolt Docking Station',
    category: 'Laptop Accessories',
    price: 65,
    stock: 28,
    warranty: '1 Year Official Safeway Replacement Warranty',
    specs: 'Dual 4K HDMI, 100W PD Pass-Through, Gigabit Ethernet, SD/TF Card Reader, 3x USB 3.0',
    description: 'Turn a single laptop USB-C port into a complete multi-monitor workstation setup.',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    featured: false
  },
  {
    name: 'Cooler Master Ergonomic Aluminum Laptop Cooling Stand',
    category: 'Laptop Accessories',
    price: 45,
    stock: 35,
    warranty: '6 Months Safeway Warranty',
    specs: '6-Level Height Adjustment, Dual Silent 140mm LED Fans, Fits 13" to 17.3" Laptops',
    description: 'Reduces gaming and workstation laptop temperatures by up to 12°C while improving neck posture.',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    featured: false
  },

  // 7. PC Accessories
  {
    name: 'Keychron K8 Pro Wireless Mechanical Keyboard',
    category: 'PC Accessories',
    price: 109,
    stock: 22,
    warranty: '1 Year Official Safeway Replacement Warranty',
    specs: 'Hot-Swappable Gateron Red Switches, QMK/VIA Programmable, PBT Keycaps, RGB Backlight',
    description: 'Tactile aluminum-frame wireless mechanical keyboard engineered for coders and game$',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    featured: false
  },
  {
    name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
    category: 'PC Accessories',
    price: 139,
    stock: 19,
    warranty: '1 Year Official Logitech Warranty',
    specs: '60g Ultra-Lightweight, HERO 2 32K DPI Sensor, LIGHTFORCE Hybrid Optical Switches, 95-Hr Battery',
    description: 'Esports-grade wireless mouse delivering zero-latency tracking and effortless glide.',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    featured: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing records to avoid duplicates
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Message.deleteMany({});

    // Create hashed password for sample accounts
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Insert Admin and Customer accounts
    await User.insertMany([
      {
        name: 'Safeway Store Admin',
        email: 'admin@safeway.pk',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Ali Raza (FYP Student)',
        email: 'ali@student.edu.pk',
        password: hashedPassword,
        role: 'customer'
      }
    ]);

    // Insert all 15 sample products across the 7 required categories
    const insertedProducts = await Product.insertMany(sampleProducts);

    // 4. Insert initial realistic Customer orders into MongoDB
    await Order.insertMany([
      {
        customerName: 'Ali Raza',
        customerEmail: 'ali@student.edu.pk',
        items: [
          { product: insertedProducts[2]._id, name: insertedProducts[2].name, category: insertedProducts[2].category, price: insertedProducts[2].price, quantity: 1 },
          { product: insertedProducts[13]._id, name: insertedProducts[13].name, category: insertedProducts[13].category, price: insertedProducts[13].price, quantity: 1 }
        ],
        shippingAddress: {
          fullName: 'Ali Raza',
          phone: '+92 300 4128901',
          city: 'Lahore',
          addressLine: 'House 14, Block H, Gulberg III, Lahore'
        },
        paymentMethod: 'Cash on Delivery (COD)',
        totalAmount: 1408,
        status: 'Processing'
      },
      {
        customerName: 'Zainab Tariq',
        customerEmail: 'zainab.t@corp.pk',
        items: [
          { product: insertedProducts[5]._id, name: insertedProducts[5].name, category: insertedProducts[5].category, price: insertedProducts[5].price, quantity: 1 }
        ],
        shippingAddress: {
          fullName: 'Zainab Tariq',
          phone: '+92 321 9845120',
          city: 'Islamabad',
          addressLine: 'House 29, Street 11, Sector F-7/2, Islamabad'
        },
        paymentMethod: 'Cash on Delivery (COD)',
        totalAmount: 749,
        status: 'Shipped'
      }
    ]);

    // 5. Insert initial realistic Customer Contact Us Messages into MongoDB
    await Message.insertMany([
      {
        name: 'Hamza Mahmood',
        email: 'hamza.cs@pucit.edu.pk',
        phone: '+92 301 7744129',
        subject: 'University CS Lab — 5x Dell Inspiron 15 Bulk Quote',
        message: 'Assalam-o-Alaikum, we need 5 units of Dell Inspiron 15 3530 for our university computer lab in Lahore. Can Safeway Enterprises provide an official GST invoice and student discount?',
        status: 'Unread',
        adminReply: ''
      },
      {
        name: 'Ayesha Siddiqui',
        email: 'ayesha.s@gmail.com',
        phone: '+92 345 8821034',
        subject: 'PTA Approval Verification for Samsung Galaxy S24 Ultra',
        message: 'Hi Safeway team, I want to confirm if the Samsung Galaxy S24 Ultra (1,149) is officially PTA approved for both physical SIM and eSIM before I place my order?',
        status: 'Unread',
        adminReply: ''
      },
      {
        name: 'Bilal Ahmed',
        email: 'bilal.ahmed@techpk.com',
        phone: '+92 312 4409811',
        subject: 'RAM Upgrade on Safeway Titan Pro RTX 4070 PC',
        message: 'Can you upgrade the RAM on the Safeway Titan Pro RTX 4070 Gaming PC from 32GB to 64GB DDR5 before shipping to Islamabad?',
        status: 'Replied',
        adminReply: 'Wa-Alaikum-Assalam Bilal! Yes, our Gulberg III technical team can upgrade it to 64GB DDR5 Corsair Vengeance for an additional 95 with full 2-Year Official Warranty.'
      }
    ]);

    console.log('✅ Database successfully seeded with 2 Users and 15 Products across all 7 categories!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
