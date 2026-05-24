import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, LogOut, User, Menu, X, Plus, Minus, Trash2, Shield, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Google Fonts (same as LandingPage) ─── */
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

  /* ─────────────────────────────────────────────────── */
  /*  Inline style tokens — matches LandingPage palette  */
  /* ─────────────────────────────────────────────────── */
  const gold = '#C07722';
  const goldLight = '#FDF6EC';
  const goldBorder = '#F5DFB0';
  const ink = '#0A0A0A';
  const surface = '#fff';
  const muted = '#6E6E6B';
  const border = '#EBEBEA';
  const pageBg = '#FAFAF8';

  const nav = {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    background: 'rgba(250,250,248,0.88)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderBottom: `1px solid ${border}`,
    fontFamily: "'DM Sans', sans-serif",
  };

  const inner = {
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 32px',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  };

  /* Brand */
  const brandWrap = { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' };
  const brandIcon = { fontSize: 26 };
  const brandText = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 800,
    fontSize: 22,
    color: ink,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  };
  const brandSpan = { color: gold };

  /* Nav links */
  const navLink = {
    fontWeight: 500,
    fontSize: 15,
    color: muted,
    textDecoration: 'none',
    transition: 'color .15s',
    letterSpacing: '-0.01em',
  };

  /* Wallet pill */
  const walletPill = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: goldLight,
    border: `1px solid ${goldBorder}`,
    borderRadius: 999,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#92580A',
  };

  /* Avatar block */
  const avatarBlock = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
    borderLeft: `1px solid ${border}`,
  };
  const avatarMeta = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };
  const avatarName = { fontSize: 14, fontWeight: 600, color: ink, lineHeight: 1.2 };
  const avatarRole = {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    color: muted,
    fontWeight: 500,
    marginTop: 2,
  };
  const avatarCircle = {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: goldLight,
    border: `1.5px solid ${goldBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    color: gold,
  };

  /* Cart button */
  const cartBtn = {
    position: 'relative',
    padding: '9px 11px',
    background: goldLight,
    border: `1px solid ${goldBorder}`,
    borderRadius: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: gold,
    transition: 'background .15s',
  };
  const cartBadge = {
    position: 'absolute',
    top: -7,
    right: -7,
    background: gold,
    color: '#fff',
    fontWeight: 700,
    fontSize: 10,
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${pageBg}`,
  };

  /* Logout button */
  const logoutBtn = {
    padding: '9px 11px',
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 12,
    cursor: 'pointer',
    color: muted,
    display: 'flex',
    alignItems: 'center',
    transition: 'color .15s, border-color .15s',
  };

  /* Auth buttons */
  const loginBtn = {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    color: muted,
    textDecoration: 'none',
    transition: 'color .15s',
  };
  const registerBtn = {
    fontFamily: "'DM Sans', sans-serif",
    background: gold,
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    padding: '10px 22px',
    borderRadius: 12,
    textDecoration: 'none',
    transition: 'background .15s',
  };

  /* Mobile hamburger */
  const hamburgerBtn = {
    padding: '8px 10px',
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 12,
    cursor: 'pointer',
    color: muted,
    display: 'flex',
    alignItems: 'center',
  };

  /* ── Mobile Drawer ── */
  const mobileDrawer = {
    position: 'fixed',
    top: 68,
    left: 0,
    width: '100%',
    zIndex: 30,
    background: 'rgba(250,250,248,0.97)',
    backdropFilter: 'blur(14px)',
    borderBottom: `1px solid ${border}`,
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    fontFamily: "'DM Sans', sans-serif",
  };

  const mobileUserRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: `1px solid ${border}`,
    paddingBottom: 16,
    marginBottom: 4,
  };

  const mobileWalletRow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: goldLight,
    border: `1px solid ${goldBorder}`,
    borderRadius: 14,
    padding: '12px 16px',
  };

  const mobileLinkStyle = {
    fontWeight: 500,
    fontSize: 16,
    color: muted,
    textDecoration: 'none',
    padding: '8px 0',
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
    padding: '13px 0',
    borderRadius: 14,
    cursor: 'pointer',
    width: '100%',
  };

  /* ── Cart Drawer ── */
  const cartPanel = {
    position: 'fixed',
    right: 0,
    top: 0,
    bottom: 0,
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

  const cartHeaderLeft = { display: 'flex', alignItems: 'center', gap: 10 };
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
  const storeChipLabel = { fontSize: 10, fontWeight: 700, color: gold, letterSpacing: '.1em', textTransform: 'uppercase' };
  const storeChipName = { fontSize: 14, fontWeight: 600, color: ink, marginTop: 3 };

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
    width: 46,
    height: 46,
    background: '#fff',
    borderRadius: 12,
    border: `1px solid ${border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  };

  const cartItemName = { fontWeight: 600, fontSize: 13, color: ink, lineHeight: 1.3 };
  const cartItemPrice = { fontSize: 12, color: muted, fontWeight: 500, marginTop: 3 };

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

  const qtyNum = { width: 24, textAlign: 'center', fontSize: 13, fontWeight: 700, color: ink };

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

  const subtotalRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' };
  const subtotalLabel = { fontSize: 14, color: muted, fontWeight: 500 };
  const subtotalAmount = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    fontWeight: 800,
    color: ink,
    letterSpacing: '-0.02em',
  };

  const checkoutBtn = {
    width: '100%',
    padding: '15px 0',
    background: gold,
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background .15s',
    letterSpacing: '-0.01em',
  };

  const cartNote = { fontSize: 11, color: '#B0AEA9', textAlign: 'center', lineHeight: 1.6 };

  return (
    <>
      {/* ── Main Navbar ── */}
      <nav style={nav}>
        <div style={inner}>

          {/* Logo */}
          <Link to="/" style={brandWrap}>
            <span style={brandIcon}>🛒</span>
            <span style={brandText}>
              Smart<span style={brandSpan}>Grocery</span>
            </span>
          </Link>

          {/* Desktop right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }} className="hidden md:flex">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  style={navLink}
                  onMouseEnter={e => (e.target.style.color = ink)}
                  onMouseLeave={e => (e.target.style.color = muted)}
                >
                  Dashboard
                </Link>

                {user.role === 'Customer' && (
                  <Link
                    to="/orders"
                    style={navLink}
                    onMouseEnter={e => (e.target.style.color = ink)}
                    onMouseLeave={e => (e.target.style.color = muted)}
                  >
                    My Orders
                  </Link>
                )}

                {/* Wallet */}
                <div style={walletPill}>
                  <Wallet size={14} color={gold} />
                  <span>Rs. {user.balance.toLocaleString()}</span>
                </div>

                {/* Avatar + name */}
                <div style={avatarBlock}>
                  <div style={avatarMeta}>
                    <span style={avatarName}>{user.name}</span>
                    <span style={avatarRole}>
                      <Shield size={10} color={gold} />
                      {user.role}
                    </span>
                  </div>
                  <div style={avatarCircle}>{user.name.charAt(0)}</div>
                </div>

                {/* Cart */}
                {user.role === 'Customer' && (
                  <button style={cartBtn} onClick={() => setIsCartOpen(true)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FDE68A')}
                    onMouseLeave={e => (e.currentTarget.style.background = goldLight)}>
                    <ShoppingCart size={20} />
                    {totalCartQty > 0 && <span style={cartBadge}>{totalCartQty}</span>}
                  </button>
                )}

                {/* Logout */}
                <button style={logoutBtn} onClick={handleLogout}
                  onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = muted; e.currentTarget.style.borderColor = border; }}>
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={loginBtn}
                  onMouseEnter={e => (e.target.style.color = ink)}
                  onMouseLeave={e => (e.target.style.color = muted)}>
                  Login
                </Link>
                <Link to="/register" style={registerBtn}
                  onMouseEnter={e => (e.target.style.background = '#9E601A')}
                  onMouseLeave={e => (e.target.style.background = gold)}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="md:hidden">
            {user?.role === 'Customer' && (
              <button style={cartBtn} onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={19} />
                {totalCartQty > 0 && <span style={cartBadge}>{totalCartQty}</span>}
              </button>
            )}
            <button style={hamburgerBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            style={mobileDrawer}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            {user ? (
              <>
                <div style={mobileUserRow}>
                  <div style={{ ...avatarCircle, width: 44, height: 44, fontSize: 17 }}>{user.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: ink }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{user.email}</div>
                  </div>
                </div>

                <div style={mobileWalletRow}>
                  <span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>Wallet Balance</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#92580A' }}>Rs. {user.balance.toLocaleString()}</span>
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
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ ...mobileLinkStyle, textAlign: 'center', border: `1px solid ${border}`, borderRadius: 14, padding: '13px 0' }}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" style={{ ...registerBtn, textAlign: 'center', padding: '13px 0', display: 'block', fontSize: 15 }}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Register
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#0A0A0A', cursor: 'pointer' }}
            />

            {/* Panel */}
            <motion.div
              style={cartPanel}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
            >
              {/* Header */}
              <div style={cartHeader}>
                <div style={cartHeaderLeft}>
                  <ShoppingCart size={20} color={gold} />
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
                      <div style={storeChipLabel}>Supermarket</div>
                      <div style={storeChipName}>{storeNames[selectedStore]}</div>
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
                  cartItems.map((item) => (
                    <div key={item.productId} style={cartItem}>
                      <div style={cartItemThumb}>🍎</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={cartItemName}>{item.name}</div>
                        <div style={cartItemPrice}>Rs. {item.price.toLocaleString()}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={qtyControl}>
                          <button style={qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                            <Minus size={13} />
                          </button>
                          <span style={qtyNum}>{item.quantity}</span>
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
                  <div style={subtotalRow}>
                    <span style={subtotalLabel}>Subtotal</span>
                    <span style={subtotalAmount}>Rs. {getCartTotal().toLocaleString()}</span>
                  </div>
                  <p style={cartNote}>
                    Prices compiled from local stores. Delivery fee & taxes calculated at checkout.
                  </p>
                  <button
                    style={checkoutBtn}
                    onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#9E601A')}
                    onMouseLeave={e => (e.currentTarget.style.background = gold)}
                  >
                    Proceed to Checkout →
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
