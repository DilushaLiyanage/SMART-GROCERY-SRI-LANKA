import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Truck, ShoppingBag, ShieldCheck, Heart } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 flex flex-col items-center justify-center overflow-hidden border-b border-slate-900/60 bg-gradient-to-b from-slateDark-900/20 to-slateDark-950">
        {/* Animated Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ceylon-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-marigold-500/5 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center"
        >
          {/* Tag badge */}
          <motion.span 
            variants={itemVariants}
            className="bg-ceylon-500/10 border border-ceylon-500/30 text-ceylon-500 font-extrabold text-[10px] tracking-widest uppercase px-4.5 py-1.5 rounded-full mb-6"
          >
            🇱🇰 Sri Lanka's First Luxury Grocery Marketplace
          </motion.span>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Fresh Groceries, <br className="hidden sm:inline" />
            <span className="text-gradient-ceylon">Smartest Prices.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-400 text-base md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Compare prices across Keells, Cargills Food City, SPAR, and Laugfs in real-time. Buy cheaper, track orders live, and get delivered instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/select-location"
              className="px-8 py-4 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-xl shadow-ceylon-500/20 hover:scale-[1.02]"
            >
              <span>Start Smart Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/register?role=Courier"
              className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-2xl text-center hover:scale-[1.02] transition-all duration-200"
            >
              Join as Delivery Partner
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Stores Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-ceylon-500 text-xs font-bold uppercase tracking-wider">Supermarket Marketplace</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-2">Shop Your Favorite Supermarkets</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto mt-3">
            Get instant access to items stocked at Sri Lanka's leading retail brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Keells Super', code: 'keells', desc: 'Freshness Guaranteed', rating: 4.6, time: '25-35 mins', emoji: '🟢' },
            { name: 'Cargills Food City', code: 'cargills', desc: 'Sri Lanka’s Everyday Retailer', rating: 4.5, time: '20-30 mins', emoji: '🔴' },
            { name: 'SPAR Sri Lanka', code: 'spar', desc: 'International Quality & Assortment', rating: 4.8, time: '30-45 mins', emoji: '🟤' },
            { name: 'Laugfs Supermarket', code: 'laugfs', desc: 'Your 24/7 Supermarket', rating: 4.2, time: '25-40 mins', emoji: '🟡' }
          ].map((store, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              className="glass-panel border-slate-900 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-800 transition-all duration-200"
            >
              <div>
                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-2xl border border-slate-800 mb-5">
                  {store.emoji}
                </div>
                <h3 className="font-extrabold text-lg text-white mb-1.5">{store.name}</h3>
                <p className="text-slate-400 text-xs font-medium mb-4 leading-normal">{store.desc}</p>
              </div>
              <div className="border-t border-slate-900 pt-4 flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1">⭐ {store.rating}</span>
                <span>⏱️ {store.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Overview */}
      <section className="px-6 py-20 bg-slate-950/40 border-y border-slate-900/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ceylon-500/10 flex-shrink-0 flex items-center justify-center text-ceylon-500">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white mb-2">Cheapest Basket Matcher</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add items to your cart and let our price comparison engine compare exact items to find which retailer offers the cheapest subtotal.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ceylon-500/10 flex-shrink-0 flex items-center justify-center text-ceylon-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white mb-2">Courier Bid Marketplace</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Choose between platform couriers, store delivery, or third-party courier services based on your budget, speed rating, or ETA needs.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ceylon-500/10 flex-shrink-0 flex items-center justify-center text-ceylon-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white mb-2">Single-Checkout Restrict</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Clean and modern checkout workflow restricting items to one supermarket store branch, avoiding multi-location delivery failures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-10 border-t border-slate-900 bg-slate-950/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-slate-300">SMART GROCERY SRI LANKA</span>
          </div>
          <div>© 2026 Smart Grocery Sri Lanka. All Rights Reserved.</div>
          <div className="flex gap-4 font-semibold text-slate-400">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Colombo Operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
