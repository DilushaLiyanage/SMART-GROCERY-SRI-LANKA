import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { DashboardCardSkeleton } from '../components/Skeletons';
import { 
  TrendingUp, ShoppingCart, PackageOpen, AlertTriangle, 
  Check, RefreshCw, Layers 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { motion } from 'framer-motion';

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super'
};

const salesChartData = [
  { name: 'Mon', sales: 45000 },
  { name: 'Tue', sales: 52000 },
  { name: 'Wed', sales: 49000 },
  { name: 'Thu', sales: 63000 },
  { name: 'Fri', sales: 58000 },
  { name: 'Sat', sales: 85000 },
  { name: 'Sun', sales: 92000 }
];

export const StoreAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [storeCode, setStoreCode] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for inventory update
  const [editingProdId, setEditingProdId] = useState(null);
  const [editStockVal, setEditStockVal] = useState('');

  const identifyStoreCode = () => {
    if (!user) return '';
    const email = user.email.toLowerCase();
    if (email.includes('keells')) return 'keells';
    if (email.includes('cargills')) return 'cargills';
    if (email.includes('spar')) return 'spar';
    return 'laugfs';
  };

  const loadStoreData = async () => {
    const code = identifyStoreCode();
    setStoreCode(code);

    try {
      // Load orders
      const orderRes = await axios.get(`${API_URL}/orders`);
      if (orderRes.data.success) {
        setOrders(orderRes.data.data.filter(o => o.store === code));
      }

      // Load products
      const prodRes = await axios.get(`${API_URL}/products`);
      if (prodRes.data.success) {
        setProducts(prodRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStoreData();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = 'Confirmed';
    if (currentStatus === 'Pending') nextStatus = 'Confirmed';
    else if (currentStatus === 'Confirmed') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Picked Up';
    else if (currentStatus === 'Picked Up') nextStatus = 'On the Way';
    else if (currentStatus === 'On the Way') nextStatus = 'Delivered';

    try {
      const res = await axios.put(`${API_URL}/orders/${orderId}/status`, { status: nextStatus });
      if (res.data.success) {
        // Refresh list
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: nextStatus } : o));
      }
    } catch (err) {
      alert('Error updating order timeline');
    }
  };

  const handleUpdateStock = async (prodId) => {
    // Simulated stock save. In mock fallback it updates products list
    try {
      const res = await axios.get(`${API_URL}/products`);
      if (res.data.success) {
        // In real backend we would trigger a POST to product/stock.
        // For demonstration, we just update local products list.
        setProducts(products.map(p => {
          if (p._id === prodId) {
            p.stock[storeCode] = parseInt(editStockVal) || 0;
          }
          return p;
        }));
        setEditingProdId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculation
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Preparing').length;
  
  const lowStockItems = products.filter(p => {
    const stock = p.stock[storeCode] || 0;
    return stock > 0 && stock <= 15;
  });

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <Sidebar role="StoreAdmin" />

      <div className="flex-1 px-8 py-8 space-y-10 overflow-y-auto max-w-6xl">
        <header className="flex justify-between items-center">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-ceylon-500">Retail Admin Console</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              {storeNames[storeCode] || 'Supermarket'} Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-1">Review live sales, fulfill orders, and monitor stock inventory sheets.</p>
          </div>
          <button 
            onClick={loadStoreData}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, idx) => <DashboardCardSkeleton key={idx} />)}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Store Revenue', val: `Rs. ${totalRevenue.toLocaleString()}`, label: 'From delivered orders', icon: TrendingUp, color: 'text-ceylon-500 bg-ceylon-500/10' },
                { title: 'Pending Dispatch', val: pendingOrders, label: 'Awaiting rider allocation', icon: ShoppingCart, color: 'text-marigold-500 bg-marigold-500/10' },
                { title: 'Total Fulfillments', val: orders.filter(o => o.status === 'Delivered').length, label: 'Completed deliveries', icon: PackageOpen, color: 'text-blue-500 bg-blue-500/10' },
                { title: 'Low Stock Alerts', val: lowStockItems.length, label: 'Items below 15 units', icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="glass-panel border-slate-900 rounded-3xl p-6 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{card.title}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{card.val}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-semibold">{card.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sales Chart */}
            <div className="glass-panel border-slate-900 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-ceylon-500" /> Weekly Sales Chart (Rs.)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#198754" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#198754" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} labelStyle={{ color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="sales" stroke="#198754" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Orders List */}
            <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Fulfillments Queue</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Items Count</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-500">No supermarket orders found.</td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.orderId} className="border-b border-slate-900 hover:bg-slate-900/10">
                          <td className="py-4 px-4 font-bold text-white">{o.orderId}</td>
                          <td className="py-4 px-4 text-slate-400 font-semibold">{o.items.length} products</td>
                          <td className="py-4 px-4 font-extrabold text-white">Rs. {o.subtotal.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'Delivered' ? 'bg-ceylon-500/10 text-ceylon-400 border border-ceylon-500/25' : 'bg-marigold-500/10 text-marigold-400 border border-marigold-500/10'
                            }`}>{o.status}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {o.status !== 'Delivered' && o.status !== 'Cancelled' ? (
                              <button
                                onClick={() => handleUpdateStatus(o.orderId, o.status)}
                                className="px-3.5 py-1.5 bg-ceylon-500 hover:bg-ceylon-600 text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Advance State
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold">Archived</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Stock manager */}
            <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Stock Sheet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => {
                  const stock = p.stock[storeCode] || 0;
                  const isLow = stock <= 15;

                  return (
                    <div 
                      key={p._id}
                      className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs leading-snug truncate">{p.name}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-black ${isLow ? 'text-rose-500' : 'text-slate-500'}`}>
                            Stock: {stock} units
                          </span>
                          {isLow && <span className="bg-rose-500/15 border border-rose-500/20 text-rose-500 font-bold text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded">Low Stock</span>}
                        </div>
                      </div>

                      {editingProdId === p._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editStockVal}
                            onChange={(e) => setEditStockVal(e.target.value)}
                            className="w-16 bg-slate-900 border border-slate-850 px-2 py-1 text-xs font-bold text-white rounded outline-none"
                          />
                          <button
                            onClick={() => handleUpdateStock(p._id)}
                            className="p-1.5 bg-ceylon-500 hover:bg-ceylon-600 rounded-lg text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingProdId(p._id);
                            setEditStockVal(stock.toString());
                          }}
                          className="px-3 py-1 bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 font-bold text-[10px] rounded-lg transition-all"
                        >
                          Modify
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default StoreAdminDashboard;
