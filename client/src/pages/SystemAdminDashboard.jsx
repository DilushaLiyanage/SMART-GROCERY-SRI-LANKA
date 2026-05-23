import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { DashboardCardSkeleton } from '../components/Skeletons';
import { 
  Users, ShoppingBag, Landmark, Activity, 
  Database, RefreshCw, BarChart2, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

const storeSalesData = [
  { name: 'Keells', sales: 125000, orders: 48 },
  { name: 'Cargills', sales: 154000, orders: 62 },
  { name: 'SPAR', sales: 88000, orders: 29 },
  { name: 'Laugfs', sales: 74000, orders: 25 }
];

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export const SystemAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`);
      if (res.data.success) {
        setStats(res.data.stats);
      }
      
      // Load user accounts for the management table. Since we don't have separate /users admin endpoints,
      // we mock load user items based on seed structures for illustration
      setUsersList([
        { name: 'Nimal Silva', email: 'nimal@gmail.com', role: 'Customer', registered: '2026-05-18' },
        { name: 'Keells Manager', email: 'keells@gmail.com', role: 'StoreAdmin', registered: '2026-05-19' },
        { name: 'Pradeep Kumara', email: 'pradeep@gmail.com', role: 'Courier', registered: '2026-05-20' },
        { name: 'Smart Admin', email: 'admin@smartgrocery.lk', role: 'SystemAdmin', registered: '2026-05-21' }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <Sidebar role="SystemAdmin" />

      <div className="flex-1 px-8 py-8 space-y-10 overflow-y-auto max-w-6xl">
        <header className="flex justify-between items-center">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-ceylon-500 font-sans">Global Platform Oversight</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">System Admin Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">Control panel monitoring network operations, users database, and revenue splits.</p>
          </div>
          <button 
            onClick={fetchGlobalStats}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </header>

        {loading || !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, idx) => <DashboardCardSkeleton key={idx} />)}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Registered Users', val: stats.users, label: 'Customers, couriers, stores', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
                { title: 'Supermarkets', val: stats.stores, label: 'Active retail codes', icon: ShoppingBag, color: 'text-ceylon-500 bg-ceylon-500/10' },
                { title: 'Commission (15%)', val: `Rs. ${stats.platformCommission.toLocaleString()}`, label: 'Calculated platform revenue', icon: Landmark, color: 'text-marigold-500 bg-marigold-500/10' },
                { title: 'System Health', val: stats.systemHealth, label: 'JSON DB Mock fallback OK', icon: Activity, color: 'text-emerald-500 bg-emerald-500/10' }
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

            {/* Performance charts columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store revenue shares bar chart */}
              <div className="glass-panel border-slate-900 rounded-3xl p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <BarChart2 className="w-4.5 h-4.5 text-ceylon-500" /> Revenue Shares per Supermarket (Rs.)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storeSalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} labelStyle={{ color: '#94a3b8' }} />
                      <Bar dataKey="sales" fill="#198754" radius={[6, 6, 0, 0]}>
                        {storeSalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order distribution shares pie chart */}
              <div className="glass-panel border-slate-900 rounded-3xl p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-ceylon-500" /> Order Load Distribution
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={storeSalesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="orders"
                      >
                        {storeSalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Users Accounts Control table */}
            <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Accounts list</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Account Role</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Database State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((userAccount) => (
                      <tr key={userAccount.email} className="border-b border-slate-900 hover:bg-slate-900/10">
                        <td className="py-4 px-4 font-bold text-white">{userAccount.name}</td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">{userAccount.email}</td>
                        <td className="py-4 px-4 font-bold text-ceylon-500">{userAccount.role}</td>
                        <td className="py-4 px-4 text-slate-500 font-semibold">{userAccount.registered}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default SystemAdminDashboard;
