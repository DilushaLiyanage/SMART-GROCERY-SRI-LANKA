import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext, API_URL } from '../context/AuthContext';
import { MapPin, Navigation, CreditCard, DollarSign, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super'
};

export const CheckoutPage = () => {
  const { cartItems, selectedStore, getCartTotal, clearCart } = useContext(CartContext);
  const { user, updateBalance } = useContext(AuthContext);
  const navigate = useNavigate();

  // Address
  const [addressText, setAddressText] = useState(user?.location?.address || 'Colombo 03, Sri Lanka');
  const [lat, setLat] = useState(user?.location?.latitude || 6.9271);
  const [lng, setLng] = useState(user?.location?.longitude || 79.8612);

  // Delivery options
  const [courierType, setCourierType] = useState('platform');
  const [deliveryFee, setDeliveryFee] = useState(150);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Live Travel ETA prediction
  const [etaDetails, setEtaDetails] = useState(null);
  const [loadingEta, setLoadingEta] = useState(false);
  const [trafficCondition, setTrafficCondition] = useState('medium');

  const courierOptions = [
    { type: 'platform', name: 'Platform Express Rider', cost: 150, eta: '25 mins', rating: '⭐ 4.8' },
    { type: 'third-party', name: 'Three-Wheel Courier', cost: 120, eta: '35 mins', rating: '⭐ 4.6' },
    { type: 'store', name: 'Supermarket Store Fleet', cost: 140, eta: '45 mins', rating: '⭐ 4.4' },
    { type: 'self-pickup', name: 'Self Pickup', cost: 0, eta: 'Immediate', rating: '⭐ 5.0' }
  ];

  const handleCourierSelect = (type, cost) => {
    setCourierType(type);
    setDeliveryFee(cost);
  };

  // Sync delivery travel prediction from microservice simulation
  const fetchEtaPrediction = async () => {
    setLoadingEta(true);
    try {
      const res = await axios.post(`${API_URL}/predict-delivery`, {
        distance: 3.8, // simulated distance in km from supermarket to user location
        traffic: trafficCondition,
        courierType
      });
      if (res.data.success) {
        setEtaDetails(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEta(false);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      fetchEtaPrediction();
    }
  }, [courierType, trafficCondition, selectedStore]);

  const handlePlaceOrder = async () => {
    const total = getCartTotal() + deliveryFee;

    if (paymentMethod === 'card' && user.balance < total) {
      alert('Insufficient wallet balance. Please choose Cash on Delivery or top up.');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/orders`, {
        store: selectedStore,
        items: cartItems,
        deliveryFee,
        courierType,
        paymentMethod,
        deliveryAddress: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          text: addressText
        }
      });

      if (res.data.success) {
        // Update user balance locally if card
        if (paymentMethod === 'card') {
          updateBalance(user.balance - total);
        }
        
        const orderId = res.data.data.orderId;
        clearCart();
        navigate(`/orders/tracking?id=${orderId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing order');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center text-center p-6">
        <span className="text-5xl mb-4">🛒</span>
        <h3 className="font-extrabold text-white text-lg">Checkout Empty</h3>
        <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-normal">
          You don't have any items in your checkout basket. Return to the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <header>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Complete Checkout</h2>
        <p className="text-xs text-slate-500 mt-1">Review supermarket items and configure delivery options.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Checkout configurations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Details */}
          <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ceylon-500" />
              Delivery Address
            </h3>
            
            <div className="space-y-3.5">
              <div className="relative">
                <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="Address details"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-xl text-xs font-semibold text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-xl text-xs font-semibold text-slate-400 outline-none"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Longitude"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-xl text-xs font-semibold text-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Courier Bidding Selection */}
          <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-white text-base">Select Delivery Speed</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Compare PickMe-style couriers based on ETAs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courierOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => handleCourierSelect(opt.type, opt.cost)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                    courierType === opt.type
                      ? 'bg-ceylon-500/10 border-ceylon-500 text-white'
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-white">{opt.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{opt.rating}</span>
                  </div>
                  <div className="flex justify-between items-center w-full mt-4">
                    <span className="text-[10px] text-slate-400 font-medium">ETA: {opt.eta}</span>
                    <span className="text-xs font-black text-white">Rs. {opt.cost}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment details */}
          <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Payment Method</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-ceylon-500/10 border-ceylon-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-ceylon-500" />
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">Pay with Wallet</div>
                    <div className="text-[9px] text-slate-500 font-semibold mt-1">Wallet Card Balance</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-ceylon-500/10 border-ceylon-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-marigold-500" />
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">Cash on Delivery</div>
                    <div className="text-[9px] text-slate-500 font-semibold mt-1">Pay at delivery time</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Order Basket Summary */}
        <div className="space-y-6">
          {/* Basket list card */}
          <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-white text-base">Checkout Summary</h3>

            {/* Selected Store indicator */}
            <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-3 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Store Selected</span>
              <span className="font-bold text-ceylon-500">{storeNames[selectedStore]}</span>
            </div>

            {/* Items list */}
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {item.name} <span className="text-slate-600">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-white">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Basket Subtotal</span>
                <span>Rs. {getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white border-t border-slate-900 pt-4 mt-2">
                <span>Total Amount</span>
                <span>Rs. {(getCartTotal() + deliveryFee).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-4 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-ceylon-500/20 hover:scale-[1.01]"
            >
              Place Order & Settle
            </button>
          </div>

          {/* AI Travel Estimates predictor panel */}
          <div className="glass-panel border-slate-900 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ceylon-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-ceylon-500" />
                <h3 className="font-extrabold text-white text-base">Travel ETA Estimator</h3>
              </div>
              {/* Traffic control */}
              <select
                value={trafficCondition}
                onChange={(e) => setTrafficCondition(e.target.value)}
                className="bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-lg text-[10px] font-bold text-slate-400 outline-none px-2 py-1"
              >
                <option value="low">Low Traffic</option>
                <option value="medium">Normal Traffic</option>
                <option value="high">Heavy Traffic</option>
              </select>
            </div>

            {loadingEta ? (
              <div className="h-20 flex items-center justify-center text-xs text-slate-500 font-semibold">
                Calculating transit minutes...
              </div>
            ) : etaDetails ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold">Total Predicted ETA</span>
                  <span className="text-lg font-black text-white">{etaDetails.eta} Minutes</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500 border-t border-slate-900 pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Store Prep Time</span>
                    <span>{etaDetails.breakdown.prepTime} Mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Road Travel Time</span>
                    <span>{etaDetails.breakdown.transitTime} Mins</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Configure parameters above to load travel stats.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;
