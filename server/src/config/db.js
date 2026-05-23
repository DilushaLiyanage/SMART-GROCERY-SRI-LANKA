const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFilePath = path.join(__dirname, '../../data/db.json');
let mockDatabase = null;

// Seed Data
const seedData = {
  users: [
    {
      _id: 'user_cust_001',
      name: 'Nimal Silva',
      email: 'nimal@gmail.com',
      password: '', // Will hash
      role: 'Customer',
      phone: '0771234567',
      location: { latitude: 6.9271, longitude: 79.8612, address: 'Colombo 03, Sri Lanka' },
      balance: 15000,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user_store_001',
      name: 'Keells Manager',
      email: 'keells@gmail.com',
      password: '',
      role: 'StoreAdmin',
      phone: '0772223333',
      location: { latitude: 6.9142, longitude: 79.8519, address: 'Keells Colombo 03' },
      balance: 45000,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user_courier_001',
      name: 'Pradeep Kumara',
      email: 'pradeep@gmail.com',
      password: '',
      role: 'Courier',
      phone: '0773334444',
      location: { latitude: 6.9271, longitude: 79.8612, address: 'Kollupitiya Station, Colombo' },
      balance: 2400,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user_admin_001',
      name: 'Smart Admin',
      email: 'admin@smartgrocery.lk',
      password: '',
      role: 'SystemAdmin',
      phone: '0775556666',
      location: { latitude: 6.9271, longitude: 79.8612, address: 'Headquarters, Colombo 02' },
      balance: 100000,
      createdAt: new Date().toISOString()
    }
  ],
  stores: [
    {
      _id: 'store_keells',
      name: 'Keells Super',
      code: 'keells',
      image: '/assets/images/stores/keells.jpg',
      rating: 4.6,
      address: 'Galle Road, Colombo 03',
      coordinates: { lat: 6.9142, lng: 79.8519 },
      deliveryFee: 150,
      deliveryTimeEst: '25-35 mins',
      status: 'open'
    },
    {
      _id: 'store_cargills',
      name: 'Cargills Food City',
      code: 'cargills',
      image: '/assets/images/stores/cargills.jpg',
      rating: 4.5,
      address: 'Duplication Road, Colombo 04',
      coordinates: { lat: 6.8973, lng: 79.8558 },
      deliveryFee: 120,
      deliveryTimeEst: '20-30 mins',
      status: 'open'
    },
    {
      _id: 'store_spar',
      name: 'SPAR Sri Lanka',
      code: 'spar',
      image: '/assets/images/stores/spar.jpg',
      rating: 4.8,
      address: 'Ward Place, Colombo 07',
      coordinates: { lat: 6.9189, lng: 79.8681 },
      deliveryFee: 180,
      deliveryTimeEst: '30-45 mins',
      status: 'open'
    },
    {
      _id: 'store_laugfs',
      name: 'Laugfs Supermarket',
      code: 'laugfs',
      image: '/assets/images/stores/laugfs.jpg',
      rating: 4.2,
      address: 'Havelock Road, Colombo 05',
      coordinates: { lat: 6.8894, lng: 79.8647 },
      deliveryFee: 140,
      deliveryTimeEst: '25-40 mins',
      status: 'open'
    }
  ],
  products: [
    {
      _id: 'prod_milk_001',
      name: 'Anchor Milk Powder 400g',
      category: 'Dairy & Eggs',
      description: 'Premium Sri Lankan milk powder fortified with vitamins and minerals.',
      image: '/assets/images/products/milk.png',
      prices: { keells: 520, cargills: 510, spar: 530, laugfs: 525 },
      stock: { keells: 45, cargills: 60, spar: 30, laugfs: 15 }
    },
    {
      _id: 'prod_rice_001',
      name: 'Keeri Samba Rice 5kg',
      category: 'Grocery Items',
      description: 'Aromatic, fine-grain premium Keeri Samba rice, locally sourced.',
      image: '/assets/images/products/rice.png',
      prices: { keells: 1350, cargills: 1300, spar: 1400, laugfs: 1360 },
      stock: { keells: 80, cargills: 100, spar: 25, laugfs: 40 }
    },
    {
      _id: 'prod_tea_001',
      name: 'Lipton Ceylonta Tea 200g',
      category: 'Beverages',
      description: 'Finest quality Ceylon black tea blend for the perfect cup.',
      image: '/assets/images/products/tea.png',
      prices: { keells: 450, cargills: 430, spar: 460, laugfs: 440 },
      stock: { keells: 150, cargills: 130, spar: 80, laugfs: 90 }
    },
    {
      _id: 'prod_coffee_001',
      name: 'Harischandra Coffee 200g',
      category: 'Beverages',
      description: 'Traditional Sri Lankan roasted coffee powder.',
      image: '/assets/images/products/coffee.png',
      prices: { keells: 750, cargills: 720, spar: 770, laugfs: 740 },
      stock: { keells: 30, cargills: 40, spar: 15, laugfs: 20 }
    },
    {
      _id: 'prod_puff_001',
      name: 'Munchee Lemon Puff 200g',
      category: 'Biscuits & Snacks',
      description: 'Crispy biscuits with a tangy, sweet lemon cream filling.',
      image: '/assets/images/products/puff.png',
      prices: { keells: 180, cargills: 170, spar: 190, laugfs: 185 },
      stock: { keells: 200, cargills: 220, spar: 90, laugfs: 110 }
    },
    {
      _id: 'prod_marie_001',
      name: 'Maliban Gold Marie 80g',
      category: 'Biscuits & Snacks',
      description: 'Classic tea-time crispy Marie biscuits.',
      image: '/assets/images/products/marie.png',
      prices: { keells: 90, cargills: 85, spar: 95, laugfs: 90 },
      stock: { keells: 300, cargills: 400, spar: 120, laugfs: 150 }
    },
    {
      _id: 'prod_butter_001',
      name: 'Pelwatte Butter 200g',
      category: 'Dairy & Eggs',
      description: 'Rich, creamy salted butter made from pure fresh cow milk.',
      image: '/assets/images/products/butter.png',
      prices: { keells: 680, cargills: 670, spar: 700, laugfs: 690 },
      stock: { keells: 20, cargills: 35, spar: 10, laugfs: 8 }
    },
    {
      _id: 'prod_dhal_001',
      name: 'Mysoor Dhal (Red Lentils) 1kg',
      category: 'Grocery Items',
      description: 'Premium split red lentils, a staple for Sri Lankan households.',
      image: '/assets/images/products/dhal.png',
      prices: { keells: 410, cargills: 395, spar: 420, laugfs: 405 },
      stock: { keells: 120, cargills: 180, spar: 75, laugfs: 90 }
    },
    {
      _id: 'prod_coconut_001',
      name: 'Nestle Coconut Milk Powder 300g',
      category: 'Grocery Items',
      description: 'Rich coconut milk powder made from fresh hand-picked coconuts.',
      image: '/assets/images/products/coconut.png',
      prices: { keells: 680, cargills: 660, spar: 710, laugfs: 675 },
      stock: { keells: 60, cargills: 80, spar: 40, laugfs: 35 }
    },
    {
      _id: 'prod_onions_001',
      name: 'Red Onions 1kg',
      category: 'Fresh Produce',
      description: 'Fresh and sharp red onions, perfect for curries and sambols.',
      image: '/assets/images/products/onions.png',
      prices: { keells: 480, cargills: 460, spar: 520, laugfs: 490 },
      stock: { keells: 50, cargills: 60, spar: 30, laugfs: 25 }
    }
  ],
  couriers: [
    {
      _id: 'courier_001',
      user: 'user_courier_001',
      vehicleType: 'bike',
      status: 'available',
      currentCoordinates: { lat: 6.9200, lng: 79.8570 },
      rating: 4.8,
      earnings: 2400
    }
  ],
  orders: [],
  reviews: [
    {
      _id: 'rev_001',
      user: 'user_cust_001',
      userName: 'Nimal Silva',
      targetType: 'store',
      targetId: 'keells',
      rating: 5,
      comment: 'Excellent service! Fresh items and fast delivery.',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'rev_002',
      user: 'user_cust_001',
      userName: 'Nimal Silva',
      targetType: 'product',
      targetId: 'prod_milk_001',
      rating: 4,
      comment: 'Always reliable and fresh packaging.',
      createdAt: new Date().toISOString()
    }
  ]
};

// Initialize Mock DB
const initMockDB = async () => {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check if file exists, if not seed it
  if (!fs.existsSync(dbFilePath)) {
    // Hash passwords for seed users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    seedData.users.forEach(u => {
      u.password = passwordHash;
    });

    fs.writeFileSync(dbFilePath, JSON.stringify(seedData, null, 2), 'utf-8');
    console.log('Mock database seeded and created.');
  }

  mockDatabase = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
};

const saveMockDB = () => {
  if (mockDatabase) {
    fs.writeFileSync(dbFilePath, JSON.stringify(mockDatabase, null, 2), 'utf-8');
  }
};

const getMockDB = () => {
  if (!mockDatabase) {
    if (fs.existsSync(dbFilePath)) {
      mockDatabase = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    } else {
      mockDatabase = JSON.parse(JSON.stringify(seedData));
    }
  }
  return mockDatabase;
};

// Mongoose MongoDB connector
const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('Using simulated Mock JSON database fallback.');
    await initMockDB();
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully.');
    
    // Seed MongoDB
    const { User, Store, Product, Courier, Review } = require('../models/Schemas');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding MongoDB database...');
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      
      const mongoUsers = seedData.users.map(u => ({ ...u, password: passwordHash }));
      await User.insertMany(mongoUsers);
      await Store.insertMany(seedData.stores);
      await Product.insertMany(seedData.products);
      await Courier.insertMany(seedData.couriers);
      await Review.insertMany(seedData.reviews);
      console.log('MongoDB database seeding complete.');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Falling back to local simulated Mock JSON database.');
    process.env.USE_MOCK_DB = 'true';
    await initMockDB();
  }
};

module.exports = {
  connectDB,
  getMockDB,
  saveMockDB
};
