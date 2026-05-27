const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register,
  login,
  checkUser,
  otpLogin,
  verifyOtp,
  getMe,
  updateLocation,
  getStores,
  getStoreByCode,
  getProducts,
  getProductById,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  acceptDelivery,
  budgetOptimize,
  getRecommendations,
  predictDeliveryTime,
  getGlobalStats
} = require('../controllers/apiControllers');

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/check', checkUser);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/otp-login', otpLogin);
router.get('/auth/me', protect, getMe);
router.put('/auth/location', protect, updateLocation);

// --- Store Routes ---
router.get('/stores', getStores);
router.get('/stores/:code', getStoreByCode);

// --- Product Routes ---
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// --- Order Routes ---
router.post('/orders', protect, authorize('Customer'), createOrder);
router.get('/orders', protect, getOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/status', protect, updateOrderStatus);
router.put('/orders/:id/accept', protect, authorize('Courier'), acceptDelivery);

// --- AI & Optimization Routing ---
router.post('/recommend', getRecommendations);
router.post('/predict-delivery', predictDeliveryTime);
router.post('/budget-optimize', protect, budgetOptimize);

// --- Admin Routing ---
router.get('/admin/stats', protect, authorize('SystemAdmin'), getGlobalStats);

module.exports = router;
