const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'StoreAdmin', 'Courier', 'SystemAdmin'], default: 'Customer' },
  phone: { type: String, default: '' },
  location: {
    latitude: { type: Number, default: 6.9271 }, // Colombo Default
    longitude: { type: Number, default: 79.8612 },
    address: { type: String, default: 'Colombo, Sri Lanka' }
  },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const StoreSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // keells, cargills, spar, laugfs
  image: { type: String, default: '' },
  rating: { type: Number, default: 4.5 },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  deliveryFee: { type: Number, default: 150 },
  deliveryTimeEst: { type: String, default: '30-45 mins' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  prices: {
    keells: { type: Number, default: null },
    cargills: { type: Number, default: null },
    spar: { type: Number, default: null },
    laugfs: { type: Number, default: null }
  },
  stock: {
    keells: { type: Number, default: 0 },
    cargills: { type: Number, default: 0 },
    spar: { type: Number, default: 0 },
    laugfs: { type: Number, default: 0 }
  }
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: { type: String, ref: 'User', required: true },
  store: { type: String, required: true }, // store code
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Preparing', 'Picked Up', 'On the Way', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  courier: {
    id: { type: String, default: null },
    name: { type: String, default: null },
    phone: { type: String, default: null },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    courierType: { type: String, default: 'platform' }
  },
  pickupAddress: { type: String, default: '' },
  deliveryAddress: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    text: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
  createdAt: { type: Date, default: Date.now },
  statusTimeline: {
    confirmedAt: { type: Date },
    preparingAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date }
  }
});

const CourierSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user: { type: String, ref: 'User', required: true },
  vehicleType: { type: String, enum: ['bike', 'three-wheel', 'car'], default: 'bike' },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  currentCoordinates: {
    lat: { type: Number, default: 6.9271 },
    lng: { type: Number, default: 79.8612 }
  },
  rating: { type: Number, default: 4.8 },
  earnings: { type: Number, default: 0 }
});

const ReviewSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user: { type: String, ref: 'User', required: true },
  userName: { type: String, required: true },
  targetType: { type: String, enum: ['product', 'store', 'courier'], required: true },
  targetId: { type: String, required: true }, // Product ID, Store Code, or Courier User ID
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Store: mongoose.models.Store || mongoose.model('Store', StoreSchema),
  Product: mongoose.models.Product || mongoose.model('Product', ProductSchema),
  Order: mongoose.models.Order || mongoose.model('Order', OrderSchema),
  Courier: mongoose.models.Courier || mongoose.model('Courier', CourierSchema),
  Review: mongoose.models.Review || mongoose.model('Review', ReviewSchema)
};
