import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, AlertCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterPage = () => {
  const { register, user, error, loading } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'Customer');
  const [address, setAddress] = useState('Colombo 03, Sri Lanka');
  const [lat, setLat] = useState(6.9271);
  const [lng, setLng] = useState(79.8612);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register({
      name,
      email,
      password,
      role,
      phone,
      address,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    });
    if (res?.success) {
      // Redirect handled by useEffect
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'Customer') navigate('/dashboard');
      else if (user.role === 'StoreAdmin') navigate('/store-admin');
      else if (user.role === 'Courier') navigate('/courier-dashboard');
      else if (user.role === 'SystemAdmin') navigate('/system-admin');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-73px)] py-12 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-[#070b19]/60 backdrop-blur-xl border border-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-ceylon-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold text-white">Create Account</h3>
          <p className="text-xs text-slate-500 mt-2">Join Sri Lanka's leading grocery network today.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex gap-3 text-rose-500 text-xs font-semibold mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nimal Silva"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-xs font-medium text-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nimal@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-xs font-medium text-white transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-xs font-medium text-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-xs font-medium text-white transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Customer', label: 'Buyer Dashboard' },
                { name: 'Courier', label: 'Delivery Rider' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setRole(item.name)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 ${
                    role === item.name
                      ? 'bg-ceylon-500/10 border-ceylon-500 text-white'
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-ceylon-500" /> {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Delivery / Operation Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, District"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-xs font-medium text-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Coordinates inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Latitude</span>
              <input
                type="number"
                step="0.0001"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-lg text-xs font-semibold text-slate-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Longitude</span>
              <input
                type="number"
                step="0.0001"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-lg text-xs font-semibold text-slate-400 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold text-xs rounded-xl transition-all duration-200 shadow-xl shadow-ceylon-500/20 disabled:bg-slate-800 disabled:text-slate-500"
          >
            {loading ? 'Creating Account...' : 'Complete Register'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-900 pt-4">
          <p className="text-slate-500 text-xs font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-ceylon-500 hover:text-ceylon-400 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default RegisterPage;
