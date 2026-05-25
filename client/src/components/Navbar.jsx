import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LocationModal from './LocationModal';
import { CartContext } from '../context/CartContext';
import {
  ShoppingCart, LogOut, Menu, X, Plus, Minus, Trash2,
  Shield, Wallet, Search, MapPin, ChevronDown, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Google Fonts ─── */
if (typeof document !== 'undefined' && !document.getElementById('sgsl-fonts')) {
  const link = document.createElement('link');
  link.id = 'sgsl-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap';
  document.head.appendChild(link);
}

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super',
};

export const Navbar = () => {
  const { user, logout, currentLocation } = useContext(AuthContext);
  const { cartItems, selectedStore, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [orderMode, setOrderMode] = useState('Delivery'); // 'Delivery' | 'Pickup'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Customer') return '/dashboard';
    if (user.role === 'StoreAdmin') return '/store-admin';
    if (user.role === 'Courier') return '/courier-dashboard';
    if (user.role === 'SystemAdmin') return '/system-admin';
    return '/';
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  /* ─── Design tokens ─── */
  const green = '#06C167';
  const greenLight = '#E8F8EE';
  const ink = '#1A1A1A';
  const surface = '#fff';
  const muted = '#6E6E6B';
  const border = '#EBEBEA';
  const pageBg = '#FAFAF8';
  const gold = '#C07722';
  const goldLight = '#FDF6EC';
  const goldBorder = '#F5DFB0';

  /* ─── Navbar shell ─── */
  const nav = {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    background: surface,
    borderBottom: `1px solid ${border}`,
    fontFamily: "'DM Sans', sans-serif",
  };

  const inner = {
    width: '100%',
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 20px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  /* ─── Delivery / Pickup toggle ─── */
  const toggleGroup = {
    display: 'flex',
    alignItems: 'center',
    background: '#F3F3F1',
    borderRadius: 999,
    padding: 3,
    gap: 2,
    flexShrink: 0,
  };

  const toggleBtn = (active) => ({
    padding: '7px 16px',
    borderRadius: 999,
    border: active ? `0.5px solid ${border}` : 'none',
    background: active ? surface : 'transparent',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    color: active ? ink : muted,
    cursor: 'pointer',
    transition: 'all .15s',
    whiteSpace: 'nowrap',
  });

  /* ─── Location pill ─── */
  const locBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: ink,
    padding: '7px 10px',
    borderRadius: 10,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  };

  /* ─── Search bar ─── */
  const searchWrap = {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  };

  const searchIconStyle = {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: muted,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  };

  const searchInput = {
    width: '100%',
    padding: '10px 16px 10px 42px',
    border: 'none',
    background: '#F3F3F1',
    borderRadius: 999,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: ink,
    outline: 'none',
  };

  /* ─── Right actions ─── */
  const rightActions = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 4,
  };

  const cartBtn = {
    position: 'relative',
    padding: '8px 10px',
    background: 'none',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: ink,
  };

  const cartBadge = {
    position: 'absolute',
    top: 2,
    right: 2,
    background: green,
    color: '#fff',
    fontWeight: 700,
    fontSize: 10,
    width: 18,
    height: 18,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${surface}`,
  };

  const loginBtn = {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: 14,
    color: ink,
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  };

  const signupBtn = {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    color: surface,
    background: ink,
    border: 'none',
    padding: '9px 20px',
    borderRadius: 999,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  };

  /* ─── Logged-in user pill ─── */
  const walletPill = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: goldLight,
    border: `1px solid ${goldBorder}`,
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#92580A',
    flexShrink: 0,
  };

  const avatarCircle = {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: greenLight,
    border: `1.5px solid ${green}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#0A5C38',
    flexShrink: 0,
  };

  const logoutBtn = {
    padding: '8px 10px',
    background: 'none',
    border: `1px solid ${border}`,
    borderRadius: 10,
    cursor: 'pointer',
    color: muted,
    display: 'flex',
    alignItems: 'center',
  };

  /* ─── Mobile hamburger ─── */
  const hamburgerBtn = {
    padding: '7px 9px',
    background: '#F3F3F1',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    color: ink,
    display: 'flex',
    alignItems: 'center',
  };

  /* ─── Mobile Drawer ─── */
  const mobileDrawer = {
    position: 'fixed',
    top: 64,
    left: 0,
    width: '100%',
    zIndex: 30,
    background: surface,
    borderBottom: `1px solid ${border}`,
    padding: '20px 20px 24px',
    flexDirection: 'column',
    gap: 12,
    fontFamily: "'DM Sans', sans-serif",
  };

  const mobileToggle = {
    display: 'flex',
    background: '#F3F3F1',
    borderRadius: 999,
    padding: 3,
    gap: 2,
    marginBottom: 4,
  };

  const mobileLinkStyle = {
    fontWeight: 500,
    fontSize: 15,
    color: muted,
    textDecoration: 'none',
    padding: '10px 0',
    display: 'block',
    borderBottom: `1px solid ${border}`,
  };

  const mobileLogoutBtn = {
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    padding: '12px 0',
    borderRadius: 14,
    cursor: 'pointer',
    width: '100%',
  };

  /* ─── Cart Drawer ─── */
  const cartPanel = {
    position: 'fixed',
    right: 0, top: 0, bottom: 0,
    zIndex: 50,
    width: '100%',
    maxWidth: 420,
    background: surface,
    borderLeft: `1px solid ${border}`,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '-8px 0 40px rgba(0,0,0,.08)',
  };

  const cartHeader = {
    padding: '20px 24px',
    borderBottom: `1px solid ${border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: pageBg,
  };

  const cartTitle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 800,
    color: ink,
    letterSpacing: '-0.02em',
  };

  const cartCloseBtn = {
    padding: '6px 8px',
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 10,
    cursor: 'pointer',
    color: muted,
    display: 'flex',
    alignItems: 'center',
  };

  const cartBody = { flex: 1, overflowY: 'auto', padding: '20px 24px' };

  const storeChip = {
    background: goldLight,
    border: `1px solid ${goldBorder}`,
    borderRadius: 14,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  };

  const emptyState = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '48px 0',
    color: muted,
  };

  const cartItem = {
    background: pageBg,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: '14px 16px',
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  };

  const cartItemThumb = {
    width: 46, height: 46,
    background: '#fff',
    borderRadius: 12,
    border: `1px solid ${border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  };

  const qtyControl = {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    border: `1px solid ${border}`,
    borderRadius: 10,
    padding: '2px 4px',
    gap: 2,
  };

  const qtyBtn = {
    padding: '4px 6px',
    cursor: 'pointer',
    borderRadius: 8,
    background: 'none',
    border: 'none',
    color: muted,
    display: 'flex',
    alignItems: 'center',
  };

  const deleteBtn = {
    padding: '6px 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#D1D5DB',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    transition: 'color .15s',
  };

  const cartFooter = {
    padding: '20px 24px',
    borderTop: `1px solid ${border}`,
    background: pageBg,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };

  const checkoutBtn = {
    width: '100%',
    padding: '14px 0',
    background: ink,
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity .15s',
  };

  return (
    <>
      {/* ── Main Navbar ── */}
      <nav style={nav}>
        <div style={inner}>

          {/* Delivery / Pickup toggle */}
          <div style={toggleGroup} className="hidden md:flex">
            {['Delivery', 'Pickup'].map(mode => (
              <button
                key={mode}
                style={toggleBtn(orderMode === mode)}
                onClick={() => setOrderMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Location + time */}
          <button style={locBtn} className="hidden md:flex" onClick={() => setIsLocationModalOpen(true)}>
            <MapPin size={15} color={green} />
            <span className="truncate max-w-[150px]">{currentLocation?.address || 'Polhengoda Road'}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: muted, margin: '0 2px', display: 'inline-block' }} />
            <span style={{ color: muted }}>Now</span>
            <ChevronDown size={14} color={muted} />
          </button>

          {/* Search */}
          <div style={searchWrap}>
            <span style={searchIconStyle}><Search size={16} /></span>
            <input
              style={searchInput}
              type="text"
              placeholder="Search SmartGrocery"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop right */}
          <div style={rightActions} className="hidden md:flex">
            {user ? (
              <>
                <Link to={getDashboardLink()} style={{ ...loginBtn, textDecoration: 'none' }}>
                  Dashboard
                </Link>

                {user.role === 'Customer' && (
                  <Link to="/orders" style={{ ...loginBtn, textDecoration: 'none' }}>
                    My Orders
                  </Link>
                )}

                {/* Wallet */}
                <div style={walletPill}>
                  <Wallet size={13} color={gold} />
                  <span>Rs. {user.balance.toLocaleString()}</span>
                </div>

                {/* Avatar */}
                <div style={avatarCircle} title={user.name}>
                  {user.name.charAt(0)}
                </div>

                {/* Cart */}
                {user.role === 'Customer' && (
                  <button style={cartBtn} onClick={() => setIsCartOpen(true)} aria-label={`Cart, ${totalCartQty} items`}>
                    <ShoppingCart size={22} />
                    <span style={cartBadge}>{totalCartQty}</span>
                  </button>
                )}

                {/* Logout */}
                <button style={logoutBtn} onClick={handleLogout}>
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={loginBtn}>Log in</Link>
                <Link to="/register" style={signupBtn}>Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="flex md:hidden">
            {user?.role === 'Customer' && (
              <button style={cartBtn} onClick={() => setIsCartOpen(true)} aria-label="Cart">
                <ShoppingCart size={21} />
                {totalCartQty > 0 && <span style={cartBadge}>{totalCartQty}</span>}
              </button>
            )}
            <button style={hamburgerBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            style={mobileDrawer}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="flex md:hidden"
          >
            {/* Mode toggle */}
            <div style={mobileToggle}>
              {['Delivery', 'Pickup'].map(mode => (
                <button
                  key={mode}
                  style={{ ...toggleBtn(orderMode === mode), flex: 1, justifyContent: 'center' }}
                  onClick={() => setOrderMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Location */}
            <button 
              style={{ ...locBtn, padding: '10px 0', borderBottom: `1px solid ${border}`, width: '100%', justifyContent: 'flex-start' }}
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLocationModalOpen(true);
              }}
            >
              <MapPin size={15} color={green} style={{ marginRight: 4 }} />
              <span className="truncate flex-1 text-left">{currentLocation?.address || 'Polhengoda Road'}</span>
              <span style={{ color: muted, margin: '0 2px' }}>·</span>
              <span style={{ color: muted }}>Now</span>
              <ChevronDown size={14} color={muted} style={{ marginLeft: 'auto' }} />
            </button>

            {user ? (
              <>
                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${border}` }}>
                  <div style={avatarCircle}>{user.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: ink }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{user.email}</div>
                  </div>
                  <div style={{ ...walletPill, marginLeft: 'auto', fontSize: 12 }}>
                    Rs. {user.balance.toLocaleString()}
                  </div>
                </div>

                <Link to={getDashboardLink()} style={mobileLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                {user.role === 'Customer' && (
                  <Link to="/orders" style={mobileLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                )}
                <button style={mobileLogoutBtn} onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}>
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{ ...mobileLinkStyle, textAlign: 'center', border: `1px solid ${border}`, borderRadius: 14, padding: '12px 0' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  style={{ ...signupBtn, textAlign: 'center', padding: '12px 0', display: 'block', fontSize: 15, borderRadius: 14 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#0A0A0A', cursor: 'pointer' }}
            />

            <motion.div
              style={cartPanel}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.26 }}
            >
              {/* Header */}
              <div style={cartHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShoppingCart size={20} color={green} />
                  <span style={cartTitle}>Your Basket</span>
                </div>
                <button style={cartCloseBtn} onClick={() => setIsCartOpen(false)}>
                  <X size={17} />
                </button>
              </div>

              {/* Body */}
              <div style={cartBody}>
                {cartItems.length > 0 && selectedStore && (
                  <div style={storeChip}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: gold, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                        Supermarket
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: ink, marginTop: 3 }}>
                        {storeNames[selectedStore]}
                      </div>
                    </div>
                    <span style={{ fontSize: 22 }}>🏪</span>
                  </div>
                )}

                {cartItems.length === 0 ? (
                  <div style={emptyState}>
                    <span style={{ fontSize: 48, marginBottom: 16 }}>🛒</span>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 800, color: ink, marginBottom: 8 }}>
                      Basket is empty
                    </div>
                    <p style={{ fontSize: 13, color: muted, maxWidth: 200, lineHeight: 1.6 }}>
                      Add products from a supermarket to start your order.
                    </p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.productId} style={cartItem}>
                      <div style={cartItemThumb}>🍎</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: ink, lineHeight: 1.3 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: muted, fontWeight: 500, marginTop: 3 }}>Rs. {item.price.toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={qtyControl}>
                          <button style={qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                            <Minus size={13} />
                          </button>
                          <span style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 700, color: ink }}>
                            {item.quantity}
                          </span>
                          <button style={qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          style={deleteBtn}
                          onClick={() => removeFromCart(item.productId)}
                          onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div style={cartFooter}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 14, color: muted, fontWeight: 500 }}>Subtotal</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 800, color: ink, letterSpacing: '-0.02em' }}>
                      Rs. {getCartTotal().toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: '#B0AEA9', textAlign: 'center', lineHeight: 1.6 }}>
                    Prices compiled from local stores. Delivery fee & taxes calculated at checkout.
                  </p>
                  <button
                    style={checkoutBtn}
                    onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Selector Modal */}
      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
