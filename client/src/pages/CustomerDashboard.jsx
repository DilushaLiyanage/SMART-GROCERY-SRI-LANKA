import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Search, Tag, Wallet, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import PriceComparisonCard from '../components/PriceComparisonCard';
import { StoreSkeleton, ProductSkeleton } from '../components/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories] = useState(['All', 'Dairy & Eggs', 'Grocery Items', 'Beverages', 'Biscuits & Snacks', 'Fresh Produce']);

  // Budget shopping helper
  const [budgetVal, setBudgetVal] = useState('5000');
  const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);
  const [budgetSolutions, setBudgetSolutions] = useState(null);
  const [calculatingBudget, setCalculatingBudget] = useState(false);

  // Recommendations
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // Alert system
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const loadDashboardData = async () => {
    try {
      const storeRes = await axios.get(`${API_URL}/stores`);
      if (storeRes.data.success) {
        setStores(storeRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStores(false);
    }

    try {
      const prodRes = await axios.get(`${API_URL}/products`);
      if (prodRes.data.success) {
        setProducts(prodRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Sync recommendation suggestions whenever cartItems modify
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (cartItems.length === 0) {
        setAiSuggestions([]);
        return;
      }
      setLoadingAi(true);
      try {
        const basketIds = cartItems.map(item => item.productId);
        const res = await axios.post(`${API_URL}/recommend`, { basket: basketIds });
        if (res.data.success) {
          setAiSuggestions(res.data.recommendations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchRecommendations();
  }, [cartItems]);

  const handleBudgetCheck = async () => {
    if (selectedBudgetIds.length === 0) {
      triggerToast('Please select at least one product for budget checking.', 'error');
      return;
    }
    setCalculatingBudget(true);
    setBudgetSolutions(null);
    try {
      const res = await axios.post(`${API_URL}/budget-optimize`, {
        budget: parseFloat(budgetVal),
        items: selectedBudgetIds
      });
      if (res.data.success) {
        setBudgetSolutions(res.data.optimizedSolutions);
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Error parsing budget', 'error');
    } finally {
      setCalculatingBudget(false);
    }
  };

  const toggleBudgetSelect = (prodId) => {
    if (selectedBudgetIds.includes(prodId)) {
      setSelectedBudgetIds(selectedBudgetIds.filter(id => id !== prodId));
    } else {
      setSelectedBudgetIds([...selectedBudgetIds, prodId]);
    }
  };

  // Filter products by query and category
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border ${
              alertType === 'success' 
                ? 'bg-ceylon-500/10 border-ceylon-500 text-ceylon-400'
                : 'bg-rose-500/10 border-rose-500 text-rose-400'
            }`}
          >
            {alertType === 'success' ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertTriangle className="w-4.5 h-4.5" />}
            <span>{alertMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Hello Header Banner */}
      <header className="glass-panel border-slate-900 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 left-0 w-44 h-44 bg-ceylon-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <div className="text-[10px] uppercase font-bold tracking-widest text-ceylon-500">Welcome Back</div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-1">Ayubowan, {user?.name}!</h2>
          <p className="text-xs text-slate-400 mt-2">Compare live retail supermarket catalog prices across Colombo areas.</p>
        </div>
        <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 flex items-center gap-4 z-10 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-marigold-500/10 flex items-center justify-center text-marigold-500">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Balance</div>
            <div className="text-base font-extrabold text-white">Rs. {user?.balance.toLocaleString()}</div>
          </div>
        </div>
      </header>

      {/* Nearby Supermarket Listings */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white">Nearby Supermarkets</h3>
            <p className="text-xs text-slate-500 mt-1">Available stores for delivery and pickup options.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStores ? (
            Array(4).fill(0).map((_, idx) => <StoreSkeleton key={idx} />)
          ) : (
            stores.map((store) => (
              <motion.div
                key={store.code}
                whileHover={{ y: -4 }}
                className="glass-panel border-slate-900 rounded-3xl p-5 hover:border-slate-800 transition-all duration-200"
              >
                <div className="h-32 bg-slate-950 rounded-2xl flex items-center justify-center text-4xl mb-4 border border-slate-850">
                  {store.code === 'keells' ? '🟢' 
                   : store.code === 'cargills' ? '🔴' 
                   : store.code === 'spar' ? '🟤' 
                   : '🟡'}
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-sm">{store.name}</h4>
                  <span className="text-xs text-slate-400 font-semibold">⭐ {store.rating}</span>
                </div>
                <p className="text-slate-500 text-[10px] mt-1.5 line-clamp-1">{store.address}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-4 mt-4 border-t border-slate-900">
                  <span>⏱️ {store.deliveryTimeEst}</span>
                  <span className="font-bold text-ceylon-500">Rs. {store.deliveryFee} Deliv.</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Product Catalog & Smart Budget shopping split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Products Search & List Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold text-white mr-auto">Live Product Catalogue</h3>
            
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 focus:ring-1 focus:ring-ceylon-500 rounded-xl text-xs font-semibold text-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Categories Tab slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-900 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-2 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-ceylon-500 text-white shadow-lg shadow-ceylon-500/15'
                    : 'bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items List */}
          <div className="space-y-6">
            {loadingProducts ? (
              Array(3).fill(0).map((_, idx) => <ProductSkeleton key={idx} />)
            ) : filteredProducts.length === 0 ? (
              <div className="glass-panel border-slate-900 rounded-3xl p-12 text-center text-slate-500 text-sm">
                No products found matching filter conditions.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className="relative">
                  {/* Select Checkbox for Budget checking */}
                  <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Budget check</span>
                    <input
                      type="checkbox"
                      checked={selectedBudgetIds.includes(product._id)}
                      onChange={() => toggleBudgetSelect(product._id)}
                      className="w-4.5 h-4.5 rounded-lg border-slate-850 accent-ceylon-500 focus:ring-0 bg-slate-900 cursor-pointer"
                    />
                  </div>
                  <PriceComparisonCard 
                    product={product} 
                    onAddSuccess={(msg) => triggerToast(msg, 'success')} 
                    onAddError={(err) => triggerToast(err, 'error')}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Budget Shopping Optimizer Sidepanel */}
        <div className="space-y-6">
          <div className="glass-panel border-slate-900 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-marigold-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-marigold-500" />
              <h3 className="font-extrabold text-white text-base">Smart Budget Planner</h3>
            </div>

            <p className="text-slate-400 text-xs leading-normal mb-6">
              Check the boxes on products you need, input your maximum limit, and we will advise you which supermarket satisfies the checklist cheapest.
            </p>

            <div className="space-y-4">
              {/* Budget input */}
              <div className="space-y-1.5">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Your Limit (Rs.)</span>
                <input
                  type="number"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-xl text-sm font-bold text-white outline-none"
                />
              </div>

              {/* Selection Counter */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1 py-1">
                <span>Selected Checklist</span>
                <span className="text-white font-extrabold">{selectedBudgetIds.length} items</span>
              </div>

              <button
                onClick={handleBudgetCheck}
                disabled={calculatingBudget}
                className="w-full py-3.5 bg-slate-900 hover:bg-ceylon-500/10 border border-slate-800 hover:border-ceylon-500/30 text-slate-300 hover:text-ceylon-400 text-xs font-bold rounded-xl transition-all duration-200"
              >
                {calculatingBudget ? 'Optimizing Baskets...' : 'Optimize Store Selections'}
              </button>
            </div>

            {/* Budget Optimization Solutions */}
            {budgetSolutions && (
              <div className="mt-8 pt-6 border-t border-slate-900 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solutions Found</h4>
                
                <div className="space-y-3.5">
                  {budgetSolutions.map((sol) => (
                    <div 
                      key={sol.supermarket}
                      className={`p-3 rounded-2xl border text-xs ${
                        sol.fitsBudget 
                          ? 'bg-ceylon-500/10 border-ceylon-500/30 text-slate-200' 
                          : 'bg-rose-500/5 border-rose-500/20 text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-white text-xs">{sol.supermarketName}</span>
                        <span className="font-black text-white text-xs">Rs. {sol.total.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] font-semibold text-slate-400 border-t border-slate-900/60 pt-2.5">
                        <span>Fits budget?</span>
                        {sol.fitsBudget ? (
                          <span className="text-emerald-500 flex items-center gap-0.5">Yes (Save Rs. {sol.savings})</span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-0.5">Exceeds Rs. {Math.abs(sol.savings)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Recommended Products Carousel */}
          {aiSuggestions.length > 0 && (
            <div className="glass-panel border-slate-900 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-ceylon-500" />
                <h3 className="font-extrabold text-white text-base">Frequently Bought Together</h3>
              </div>
              <div className="space-y-4">
                {aiSuggestions.map((prod) => (
                  <div key={prod._id} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-850 rounded-2xl">
                    <div>
                      <div className="font-bold text-white text-xs leading-snug">{prod.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-semibold">Dairy & Egg Staples</div>
                    </div>
                    <span className="text-xl">🥛</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CustomerDashboard;
