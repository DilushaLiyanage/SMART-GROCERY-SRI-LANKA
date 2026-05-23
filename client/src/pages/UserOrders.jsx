import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Package, Calendar, MapPin, Eye, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super'
};

export const UserOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center text-xs text-slate-500 font-semibold">
        <RefreshCw className="w-5 h-5 animate-spin text-ceylon-500 mr-2" /> Loading Orders...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <header>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Your Orders</h2>
        <p className="text-xs text-slate-500 mt-1">Review active deliveries and past transaction receipts.</p>
      </header>

      {orders.length === 0 ? (
        <div className="glass-panel border-slate-900 rounded-3xl p-16 text-center text-slate-500 text-sm flex flex-col items-center">
          <span className="text-5xl mb-4">📦</span>
          <h4 className="font-bold text-slate-300 text-base mb-1">No Orders Placed Yet</h4>
          <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed mt-1">
            Check our live catalog on the marketplace dashboard to submit your first basket order.
          </p>
          <Link 
            to="/dashboard"
            className="mt-6 px-6 py-2.5 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-ceylon-500/20"
          >
            Visit Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel border-slate-900 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-slate-800 transition-all duration-200"
            >
              {/* Left Identity */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-2xl border border-slate-850">
                  📦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Order {order.orderId}</span>
                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black ${
                      order.status === 'Delivered' 
                        ? 'bg-ceylon-500/20 text-ceylon-400 border border-ceylon-500/20' 
                        : 'bg-marigold-500/20 text-marigold-400 border border-marigold-500/10'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 font-semibold mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-ceylon-500" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {storeNames[order.store]}</span>
                  </div>
                </div>
              </div>

              {/* Right Pricing / Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t border-slate-900 sm:border-0 pt-4 sm:pt-0 gap-3">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Charge</div>
                  <div className="text-base font-extrabold text-white mt-0.5">Rs. {order.total.toLocaleString()}</div>
                </div>

                <Link
                  to={`/orders/tracking?id=${order.orderId}`}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Route
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default UserOrders;
