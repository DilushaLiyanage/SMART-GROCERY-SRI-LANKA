import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Play, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage = () => {
  const { login, user, error, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Quick Login Shortcuts for Reviewers
  const demoUsers = [
    { name: 'Customer (Nimal)', email: 'nimal@gmail.com', password: 'password123', role: 'Customer' },
    { name: 'Keells Super Store Admin', email: 'keells@gmail.com', password: 'password123', role: 'StoreAdmin' },
    { name: 'Courier Rider (Pradeep)', email: 'pradeep@gmail.com', password: 'password123', role: 'Courier' },
    { name: 'System Admin', email: 'admin@smartgrocery.lk', password: 'password123', role: 'SystemAdmin' }
  ];

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    login(demoEmail, demoPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const res = await login(email, password);
    if (res?.success) {
      // Redirect handled by useEffect
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'Customer') navigate('/select-location');
      else if (user.role === 'StoreAdmin') navigate('/store-admin');
      else if (user.role === 'Courier') navigate('/courier-dashboard');
      else if (user.role === 'SystemAdmin') navigate('/system-admin');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-73px)] py-12 px-6 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
      
      {/* Intro Context Column */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
        <span className="text-ceylon-500 font-extrabold text-xs tracking-wider uppercase mb-3">Startup Demo Mode</span>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          Access Dashboards <br />
          <span className="text-gradient-ceylon">Instantly.</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
          Use our one-click quick logins to switch between user roles (Customer, Supermarket Store Admin, Courier, and System Admin) to test the complete order workflow.
        </p>

        {/* Demo Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {demoUsers.map((demo, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickLogin(demo.email, demo.password)}
              className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-ceylon-500/10 border border-slate-800 hover:border-ceylon-500/30 rounded-2xl transition-all duration-200 group text-left"
            >
              <div>
                <div className="text-xs font-bold text-white leading-tight group-hover:text-ceylon-400">
                  {demo.name}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-0.5">
                  <Shield className="w-3 h-3 text-ceylon-500" />
                  {demo.role}
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-ceylon-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Login Card Form */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full md:w-[420px] bg-[#070b19]/60 backdrop-blur-xl border border-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-ceylon-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold text-white">Sign In</h3>
          <p className="text-xs text-slate-500 mt-2">Enter credentials or select a demo account above.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex gap-3 text-rose-500 text-xs font-semibold mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-sm font-medium text-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-sm font-medium text-white transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-ceylon-500/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-900 pt-6">
          <p className="text-slate-500 text-xs font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-ceylon-500 hover:text-ceylon-400 font-bold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;
