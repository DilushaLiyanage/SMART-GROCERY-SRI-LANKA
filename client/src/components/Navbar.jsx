import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, LogOut, User, Menu, X, Plus, Minus, Trash2, Shield, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super'
};

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems, selectedStore, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Customer') return '/dashboard';
    if (user.role === 'StoreAdmin') return '/store-admin';
    if (user.role === 'Courier') return '/courier-dashboard';
    if (user.role === 'SystemAdmin') return '/system-admin';
    return '/';
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#020617]/75 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-ceylon-500 to-marigold-500 bg-clip-text text-transparent">
              SMART GROCERY
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="font-medium text-slate-300 hover:text-ceylon-500 transition-colors text-sm">
                  Dashboard
                </Link>
                {user.role === 'Customer' && (
                  <Link to="/orders" className="font-medium text-slate-300 hover:text-ceylon-500 transition-colors text-sm">
                    My Orders
                  </Link>
                )}
                
                {/* Balance display */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-300">
                  <Wallet className="w-3.5 h-3.5 text-marigold-500" />
                  <span>Rs. {user.balance.toLocaleString()}</span>
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5">
                      <Shield className="w-2.5 h-2.5 text-ceylon-500" />
                      {user.role}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-ceylon-500">
                    {user.name.charAt(0)}
                  </div>
                </div>

                {/* Cart Trigger */}
                {user.role === 'Customer' && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2.5 bg-ceylon-500/10 hover:bg-ceylon-500/20 text-ceylon-500 rounded-xl transition-all duration-200 border border-ceylon-500/20"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {totalCartQty > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-marigold-500 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-[#020617]">
                        {totalCartQty}
                      </span>
                    )}
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-semibold text-slate-300 hover:text-white transition-colors text-sm">
                  Login
                </Link>
                <Link to="/register" className="bg-ceylon-500 hover:bg-ceylon-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-ceylon-500/25">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburguer */}
          <div className="md:hidden flex items-center gap-3">
            {user && user.role === 'Customer' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-ceylon-500/10 text-ceylon-500 rounded-xl border border-ceylon-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartQty > 0 && (
                  <span className="absolute -top-1 -right-1 bg-marigold-500 text-slate-950 font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                    {totalCartQty}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[73px] left-0 w-full z-30 bg-[#020617]/95 border-b border-slate-900 p-6 flex flex-col gap-4 backdrop-blur-lg"
          >
            {user ? (
              <>
                <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-ceylon-500">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-2">
                  <span className="text-xs text-slate-400 font-medium">Wallet Balance</span>
                  <span className="text-sm font-bold text-white">Rs. {user.balance.toLocaleString()}</span>
                </div>

                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-medium text-slate-300 hover:text-white py-2"
                >
                  Dashboard
                </Link>
                {user.role === 'Customer' && (
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-medium text-slate-300 hover:text-white py-2"
                  >
                    My Orders
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-4 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-xs py-3 rounded-xl"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-semibold text-slate-300 hover:text-white text-center py-2.5 border border-slate-800 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-ceylon-500 hover:bg-ceylon-600 text-white font-bold text-xs py-3 rounded-xl text-center shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer sliding right */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            ></motion.div>

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-slateDark-950 border-l border-slate-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slateDark-900/40">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-ceylon-500" />
                  <h3 className="font-extrabold text-lg text-white">Your Basket</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length > 0 && selectedStore && (
                  <div className="bg-ceylon-500/5 border border-ceylon-500/20 rounded-2xl p-4 flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-ceylon-500 tracking-wider">Supermarket</div>
                      <div className="text-sm font-bold text-white mt-0.5">{storeNames[selectedStore]}</div>
                    </div>
                    <span className="text-xl">🏪</span>
                  </div>
                )}

                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <span className="text-5xl mb-4">🛒</span>
                    <h4 className="font-bold text-slate-300 text-base mb-1">Basket is empty</h4>
                    <p className="text-xs text-slate-500 max-w-[200px]">
                      Add products from a supermarket to start your order.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div 
                      key={item.productId}
                      className="glass-panel border-slate-900 rounded-2xl p-4 flex gap-4 items-center justify-between"
                    >
                      <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-2xl border border-slate-800">
                        🍎
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-xs leading-snug truncate">{item.name}</h4>
                        <div className="text-xs text-slate-400 font-semibold mt-1">
                          Rs. {item.price.toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-850 p-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Foot */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-slate-900 bg-slateDark-900/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400 font-semibold">Subtotal</span>
                    <span className="text-xl font-black text-white">Rs. {getCartTotal().toLocaleString()}</span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal text-center">
                    Prices compiled from local stores. Delivery fee & taxes calculated at checkout.
                  </p>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full py-4 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-xl shadow-ceylon-500/15 hover:scale-[1.01]"
                  >
                    <span>Proceed to Checkout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
