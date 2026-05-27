const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getMockDB, saveMockDB } = require('../config/db');
const { User, Store, Product, Order, Courier, Review } = require('../models/Schemas');
const { sendOtpEmail } = require('../utils/mailer');

const otpStore = new Map(); // In-memory OTP code store (email/phone -> code)


// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ceylon_tea_super_secret_key_12345', {
    expiresIn: '30d',
  });
};

// ==========================================
// 1. AUTHENTICATION CONTROLLER
// ==========================================

exports.register = async (req, res) => {
  const { name, email, password, role, phone, address, latitude, longitude } = req.body;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';

    // Check duplicate
    if (isMock) {
      const db = getMockDB();
      const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    } else {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    const userId = isMock ? `user_${Date.now()}` : undefined;

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'Customer',
      phone: phone || '',
      location: {
        latitude: latitude || 6.9271,
        longitude: longitude || 79.8612,
        address: address || 'Colombo, Sri Lanka'
      },
      balance: role === 'Customer' ? 10000 : 0 // Free Rs. 10,000 for demo customers
    };

    if (isMock) {
      newUser = { _id: userId, ...userData, createdAt: new Date().toISOString() };
      const db = getMockDB();
      db.users.push(newUser);
      
      // If role is courier, create a courier entry
      if (role === 'Courier') {
        db.couriers.push({
          _id: `courier_${Date.now()}`,
          user: userId,
          vehicleType: 'bike',
          status: 'available',
          currentCoordinates: { lat: 6.9271, lng: 79.8612 },
          rating: 4.8,
          earnings: 0
        });
      }
      saveMockDB();
    } else {
      const dbUser = new User(userData);
      newUser = await dbUser.save();

      if (role === 'Courier') {
        const dbCourier = new Courier({
          user: newUser._id,
          vehicleType: 'bike',
          status: 'available',
          currentCoordinates: { lat: 6.9271, lng: 79.8612 }
        });
        await dbCourier.save();
      }
    }

    // Exclude password in return
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      location: newUser.location,
      balance: newUser.balance
    };

    return res.status(201).json({
      success: true,
      token: signToken(newUser._id),
      user: userResponse
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error during registration' });
  }
};

exports.checkUser = async (req, res) => {
  const { emailOrPhone } = req.body;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let user;

    if (isMock) {
      const db = getMockDB();
      user = db.users.find(u => 
        (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase().trim()) || 
        (u.phone && u.phone === emailOrPhone.trim())
      );
    } else {
      user = await User.findOne({
        $or: [
          { email: emailOrPhone.toLowerCase().trim() },
          { phone: emailOrPhone.trim() }
        ]
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const key = emailOrPhone.toLowerCase().trim();
    otpStore.set(key, otp);

    const isEmail = emailOrPhone.includes('@') && emailOrPhone.includes('.');
    let emailResult = null;

    if (isEmail) {
      // Send real email
      emailResult = await sendOtpEmail(emailOrPhone.trim(), otp);
    } else {
      // Log to console for phones
      console.log(`[SMS OTP SIMULATION] Sent OTP ${otp} to phone number ${emailOrPhone}`);
    }

    const response = {
      success: true,
      exists: !!user,
      isEmail
    };

    if (!isEmail) {
      response.otp = otp;
    }

    // Include ethereal preview url in development logs if applicable
    if (emailResult && emailResult.previewUrl) {
      response.previewUrl = emailResult.previewUrl;
    }

    return res.json(response);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error during verification request' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { emailOrPhone, otp } = req.body;
  const key = emailOrPhone.toLowerCase().trim();

  try {
    if (!otpStore.has(key)) {
      return res.status(400).json({ success: false, message: 'OTP expired or not sent. Please request a new one.' });
    }

    const savedOtp = otpStore.get(key);

    if (savedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid 4-digit verification code.' });
    }

    // Correct OTP, clear it
    otpStore.delete(key);

    // Retrieve user if they exist
    const isMock = process.env.USE_MOCK_DB === 'true';
    let user;

    if (isMock) {
      const db = getMockDB();
      user = db.users.find(u => 
        (u.email && u.email.toLowerCase() === key) || 
        (u.phone && u.phone === emailOrPhone.trim())
      );
    } else {
      user = await User.findOne({
        $or: [
          { email: key },
          { phone: emailOrPhone.trim() }
        ]
      });
    }

    if (user) {
      // Exists: login directly
      const token = signToken(user._id);
      return res.json({
        success: true,
        verified: true,
        exists: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          balance: user.balance
        }
      });
    }

    // New user: proceed to profile creation
    return res.json({
      success: true,
      verified: true,
      exists: false
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error during OTP verification' });
  }
};

exports.otpLogin = async (req, res) => {
  const { emailOrPhone } = req.body;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let user;

    if (isMock) {
      const db = getMockDB();
      user = db.users.find(u => 
        (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase().trim()) || 
        (u.phone && u.phone === emailOrPhone.trim())
      );
    } else {
      user = await User.findOne({
        $or: [
          { email: emailOrPhone.toLowerCase().trim() },
          { phone: emailOrPhone.trim() }
        ]
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        balance: user.balance
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error during OTP login' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let user;

    if (isMock) {
      const db = getMockDB();
      user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        balance: user.balance
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};

exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

exports.updateLocation = async (req, res) => {
  const { latitude, longitude, address } = req.body;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';

    if (isMock) {
      const db = getMockDB();
      const userIndex = db.users.findIndex(u => u._id === req.user._id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      db.users[userIndex].location = {
        latitude: parseFloat(latitude) || 6.9271,
        longitude: parseFloat(longitude) || 79.8612,
        address: address || 'Colombo, Sri Lanka'
      };
      saveMockDB();

      return res.json({
        success: true,
        message: 'Location updated successfully',
        location: db.users[userIndex].location
      });
    } else {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.location = {
        latitude: parseFloat(latitude) || 6.9271,
        longitude: parseFloat(longitude) || 79.8612,
        address: address || 'Colombo, Sri Lanka'
      };
      await user.save();

      return res.json({
        success: true,
        message: 'Location updated successfully',
        location: user.location
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error during location update' });
  }
};

// ==========================================
// 2. STORES CONTROLLER
// ==========================================

exports.getStores = async (req, res) => {
  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let stores;

    if (isMock) {
      stores = getMockDB().stores;
    } else {
      stores = await Store.find({});
    }

    return res.json({ success: true, count: stores.length, data: stores });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStoreByCode = async (req, res) => {
  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let store;

    if (isMock) {
      store = getMockDB().stores.find(s => s.code === req.params.code);
    } else {
      store = await Store.findOne({ code: req.params.code });
    }

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    return res.json({ success: true, data: store });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. PRODUCTS & PRICE COMPARISON CONTROLLER
// ==========================================

exports.getProducts = async (req, res) => {
  const { category, search } = req.query;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let products;

    if (isMock) {
      products = getMockDB().products;
    } else {
      products = await Product.find({});
    }

    // Filter
    let filtered = [...products];

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Dynamic price comparison parsing
    const processed = filtered.map(p => {
      const storePrices = [];
      let cheapestStore = null;
      let minPrice = Infinity;

      Object.entries(p.prices).forEach(([store, price]) => {
        if (price !== null && p.stock[store] > 0) {
          storePrices.push({ store, price, stock: p.stock[store] });
          if (price < minPrice) {
            minPrice = price;
            cheapestStore = store;
          }
        }
      });

      return {
        ...p,
        comparePrices: storePrices.sort((a, b) => a.price - b.price),
        cheapest: cheapestStore ? { store: cheapestStore, price: minPrice } : null
      };
    });

    return res.json({ success: true, count: processed.length, data: processed });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let product;

    if (isMock) {
      product = getMockDB().products.find(p => p._id === req.params.id);
    } else {
      product = await Product.findById(req.params.id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. ORDERS & DELIVERIES CONTROLLER
// ==========================================

exports.createOrder = async (req, res) => {
  const { store, items, deliveryFee, courierType, paymentMethod, deliveryAddress } = req.body;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    const db = getMockDB();

    // Verify stock and fetch fresh prices
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      let product;
      if (isMock) {
        product = db.products.find(p => p._id === item.productId);
      } else {
        product = await Product.findById(item.productId);
      }

      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }

      // Check stock
      const storeStock = product.stock[store] || 0;
      if (storeStock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name} at selected supermarket` 
        });
      }

      const itemPrice = product.prices[store];
      subtotal += itemPrice * item.quantity;

      verifiedItems.push({
        productId: product._id.toString(),
        name: product.name,
        quantity: item.quantity,
        price: itemPrice
      });

      // Deduct stock
      if (isMock) {
        product.stock[store] -= item.quantity;
      } else {
        const updateField = `stock.${store}`;
        await Product.findByIdAndUpdate(product._id, { $inc: { [updateField]: -item.quantity } });
      }
    }

    const total = subtotal + parseFloat(deliveryFee);

    // Verify user balance if card/wallet payment is simulated
    let customerUser;
    if (isMock) {
      customerUser = db.users.find(u => u._id === req.user._id);
    } else {
      customerUser = await User.findById(req.user._id);
    }

    if (paymentMethod === 'card' && customerUser.balance < total) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for payment' });
    }

    if (paymentMethod === 'card') {
      customerUser.balance -= total;
    }

    // Fetch store info for coordinates
    let targetStore;
    if (isMock) {
      targetStore = db.stores.find(s => s.code === store);
    } else {
      targetStore = await Store.findOne({ code: store });
    }

    const orderId = `SG-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrderData = {
      orderId,
      customer: req.user._id,
      store,
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
      status: 'Pending',
      courier: null,
      pickupAddress: targetStore ? targetStore.address : 'Store Location',
      deliveryAddress: {
        latitude: parseFloat(deliveryAddress.latitude) || 6.9271,
        longitude: parseFloat(deliveryAddress.longitude) || 79.8612,
        text: deliveryAddress.text || 'Colombo, Sri Lanka'
      },
      paymentMethod,
      createdAt: new Date().toISOString(),
      statusTimeline: {
        confirmedAt: null,
        preparingAt: null,
        pickedUpAt: null,
        deliveredAt: null
      }
    };

    let savedOrder;
    if (isMock) {
      savedOrder = newOrderData;
      db.orders.push(savedOrder);
      saveMockDB();
    } else {
      const orderModel = new Order(newOrderData);
      savedOrder = await orderModel.save();
    }

    // Trigger realtime notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Notify Store Admins of new order
      io.to(`store_${store}`).emit('new_order', savedOrder);
      // Notify System Admins
      io.to('admin_room').emit('global_new_order', savedOrder);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: savedOrder
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let orders = [];

    if (isMock) {
      orders = getMockDB().orders;
    } else {
      orders = await Order.find({}).sort({ createdAt: -1 });
    }

    // Filter by role
    let roleOrders = [...orders];

    if (req.user.role === 'Customer') {
      roleOrders = roleOrders.filter(o => o.customer.toString() === req.user._id.toString());
    } else if (req.user.role === 'StoreAdmin') {
      // Find the store assigned to this StoreAdmin
      const storeCode = req.user.email.includes('keells') ? 'keells' 
                     : req.user.email.includes('cargills') ? 'cargills'
                     : req.user.email.includes('spar') ? 'spar'
                     : 'laugfs';
      roleOrders = roleOrders.filter(o => o.store === storeCode);
    } else if (req.user.role === 'Courier') {
      // Couriers can see orders allocated to them, OR Pending/Confirmed orders near their location
      roleOrders = roleOrders.filter(o => 
        (o.courier && o.courier.id && o.courier.id.toString() === req.user._id.toString()) ||
        ((o.status === 'Confirmed' || o.status === 'Preparing') && !o.courier)
      );
    }

    return res.json({ success: true, count: roleOrders.length, data: roleOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let order;

    if (isMock) {
      order = getMockDB().orders.find(o => o.orderId === req.params.id || o._id === req.params.id);
    } else {
      order = await Order.findOne({ $or: [{ orderId: req.params.id }, { _id: req.params.id }] });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    const db = getMockDB();
    let order;

    if (isMock) {
      order = db.orders.find(o => o.orderId === req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    const now = new Date().toISOString();

    if (status === 'Confirmed') order.statusTimeline.confirmedAt = now;
    if (status === 'Preparing') order.statusTimeline.preparingAt = now;
    if (status === 'Picked Up') order.statusTimeline.pickedUpAt = now;
    if (status === 'Delivered') {
      order.statusTimeline.deliveredAt = now;
      
      // If payment is Cash on Delivery, settle balance
      if (order.paymentMethod === 'cash') {
        // Collect cash
      }
      
      // Credit Courier payout (e.g. 80% of delivery fee goes to rider)
      if (order.courier && order.courier.id) {
        if (isMock) {
          const rider = db.users.find(u => u._id === order.courier.id);
          const riderProfile = db.couriers.find(c => c.user === order.courier.id);
          if (rider) {
            rider.balance += order.deliveryFee * 0.8;
          }
          if (riderProfile) {
            riderProfile.earnings += order.deliveryFee * 0.8;
            riderProfile.status = 'available';
          }
        } else {
          // MongoDB update balance
          await User.findByIdAndUpdate(order.courier.id, { $inc: { balance: order.deliveryFee * 0.8 } });
          await Courier.findOneAndUpdate({ user: order.courier.id }, { 
            $inc: { earnings: order.deliveryFee * 0.8 },
            $set: { status: 'available' }
          });
        }
      }
    }

    if (isMock) {
      saveMockDB();
    } else {
      await order.save();
    }

    // Trigger realtime updates
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order.orderId}`).emit('order_status_updated', order);
      io.to('admin_room').emit('global_order_updated', order);
    }

    return res.json({ success: true, message: `Status updated to ${status}`, data: order });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptDelivery = async (req, res) => {
  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    const db = getMockDB();
    let order;

    if (isMock) {
      order = db.orders.find(o => o.orderId === req.params.id);
    } else {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.courier) {
      return res.status(400).json({ success: false, message: 'Order already accepted by another rider' });
    }

    let courierProfile;
    if (isMock) {
      courierProfile = db.couriers.find(c => c.user === req.user._id);
    } else {
      courierProfile = await Courier.findOne({ user: req.user._id });
    }

    if (courierProfile) {
      courierProfile.status = 'busy';
    }

    order.courier = {
      id: req.user._id.toString(),
      name: req.user.name,
      phone: req.user.phone || '0779998888',
      lat: courierProfile ? courierProfile.currentCoordinates.lat : 6.9200,
      lng: courierProfile ? courierProfile.currentCoordinates.lng : 79.8570,
      courierType: 'platform'
    };
    order.status = 'Preparing'; // Change status to preparing when courier accepts

    if (isMock) {
      saveMockDB();
    } else {
      await order.save();
      if (courierProfile) await courierProfile.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order.orderId}`).emit('order_status_updated', order);
      io.to('admin_room').emit('global_order_updated', order);
    }

    return res.json({ success: true, message: 'Delivery offer accepted', data: order });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. BUDGET SHOP OPTIMIZER (BACKEND IMPLEMENTATION)
// ==========================================

exports.budgetOptimize = async (req, res) => {
  const { budget, items } = req.body; // items: array of productIds
  const maxBudget = parseFloat(budget);

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let allProducts;

    if (isMock) {
      allProducts = getMockDB().products;
    } else {
      allProducts = await Product.find({});
    }

    // Filter down to specified items
    const targetProducts = allProducts.filter(p => items.includes(p._id.toString()));

    if (targetProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products provided for optimization' });
    }

    // We want to suggest which supermarket code yields the CHEAPEST total basket
    const supermarkets = ['keells', 'cargills', 'spar', 'laugfs'];
    const results = [];

    supermarkets.forEach(shop => {
      let shopTotal = 0;
      const shopItems = [];
      let isAvailableAll = true;

      targetProducts.forEach(prod => {
        const price = prod.prices[shop];
        const stock = prod.stock[shop] || 0;

        if (price !== null && stock > 0) {
          shopTotal += price;
          shopItems.push({
            productId: prod._id,
            name: prod.name,
            price
          });
        } else {
          isAvailableAll = false;
        }
      });

      if (isAvailableAll) {
        results.push({
          supermarket: shop,
          supermarketName: shop === 'keells' ? 'Keells Super' 
                         : shop === 'cargills' ? 'Cargills Food City'
                         : shop === 'spar' ? 'SPAR Sri Lanka'
                         : 'Laugfs Supermarket',
          total: shopTotal,
          items: shopItems,
          fitsBudget: shopTotal <= maxBudget,
          savings: maxBudget - shopTotal
        });
      }
    });

    // Sort results by cheapest total basket
    results.sort((a, b) => a.total - b.total);

    return res.json({
      success: true,
      originalBudget: maxBudget,
      optimizedSolutions: results
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. AI ALGORITHMS SIMULATOR
// ==========================================

// Apriori Recommended Items mapping
const recomendationMatrix = {
  'prod_rice_001': ['prod_dhal_001', 'prod_coconut_001', 'prod_onions_001'],
  'prod_milk_001': ['prod_tea_001', 'prod_coffee_001', 'prod_marie_001'],
  'prod_tea_001': ['prod_milk_001', 'prod_marie_001', 'prod_puff_001'],
  'prod_coffee_001': ['prod_milk_001', 'prod_marie_001'],
  'prod_puff_001': ['prod_tea_001', 'prod_marie_001'],
  'prod_marie_001': ['prod_tea_001', 'prod_puff_001', 'prod_milk_001'],
  'prod_butter_001': ['prod_milk_001', 'prod_tea_001']
};

exports.getRecommendations = async (req, res) => {
  const { basket } = req.body; // array of productIds

  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    let allProducts;

    if (isMock) {
      allProducts = getMockDB().products;
    } else {
      allProducts = await Product.find({});
    }

    const recommendedIds = new Set();
    basket.forEach(prodId => {
      const associations = recomendationMatrix[prodId] || [];
      associations.forEach(id => {
        if (!basket.includes(id)) {
          recommendedIds.add(id);
        }
      });
    });

    // Fallback: If no recommendations found, suggest trending dairy/grocery products
    if (recommendedIds.size === 0) {
      allProducts.slice(0, 3).forEach(p => recommendedIds.add(p._id.toString()));
    }

    const suggestions = allProducts.filter(p => recommendedIds.has(p._id.toString()));

    return res.json({
      success: true,
      recommendations: suggestions
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.predictDeliveryTime = async (req, res) => {
  const { distance, traffic, courierType } = req.body;

  try {
    const dist = parseFloat(distance) || 3.5; // km
    const trafficLvl = traffic || 'medium'; // low, medium, high

    // Factors
    const prepTime = 15; // standard store preparation duration
    let speedFactor = 3.5; // minutes per km default (bike)

    if (courierType === 'three-wheel') speedFactor = 4.2;
    if (courierType === 'car') speedFactor = 5.0;
    if (courierType === 'self-pickup') {
      return res.json({
        success: true,
        eta: 0,
        message: 'Self-pickup has no delivery travel time.'
      });
    }

    let trafficMultiplier = 1.0;
    if (trafficLvl === 'medium') trafficMultiplier = 1.35;
    if (trafficLvl === 'high') trafficMultiplier = 1.85;

    const transitTime = dist * speedFactor * trafficMultiplier;
    const totalEta = Math.round(prepTime + transitTime);

    return res.json({
      success: true,
      eta: totalEta,
      distance: dist,
      traffic: trafficLvl,
      breakdown: {
        prepTime,
        transitTime: Math.round(transitTime)
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. SYSTEM HEALTH & USER/SUPERMARKET CRUD
// ==========================================

exports.getGlobalStats = async (req, res) => {
  try {
    const isMock = process.env.USE_MOCK_DB === 'true';
    const db = getMockDB();
    
    let userCount, storeCount, orderCount, courierCount, orders;
    
    if (isMock) {
      userCount = db.users.length;
      storeCount = db.stores.length;
      orderCount = db.orders.length;
      courierCount = db.couriers.length;
      orders = db.orders;
    } else {
      userCount = await User.countDocuments();
      storeCount = await Store.countDocuments();
      orderCount = await Order.countDocuments();
      courierCount = await Courier.countDocuments();
      orders = await Order.find({});
    }

    const totalRevenue = orders.reduce((sum, o) => o.status === 'Delivered' ? sum + o.total : sum, 0);
    const platformCommission = totalRevenue * 0.15; // 15% system fee

    return res.json({
      success: true,
      stats: {
        users: userCount,
        stores: storeCount,
        orders: orderCount,
        couriers: courierCount,
        totalRevenue,
        platformCommission,
        systemHealth: 'Healthy'
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
