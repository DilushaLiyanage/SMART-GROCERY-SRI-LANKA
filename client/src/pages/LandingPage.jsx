import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Tag, Truck, ShoppingBag, Clock } from 'lucide-react';

/* ─── Google Fonts injected once ─── */
if (typeof document !== 'undefined' && !document.getElementById('sgsl-fonts')) {
  const link = document.createElement('link');
  link.id = 'sgsl-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;0,800;1,700;1,800&family=DM+Sans:wght@400;500;600&display=swap';
  document.head.appendChild(link);
}

/* ─── Inline styles ─── */
const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#FAFAF8',
    fontFamily: "'DM Sans', sans-serif",
    color: '#111',
  },

  /* Hero */
  hero: {
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url(/bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderBottom: '1px solid #EBEBEA',
    padding: '80px 0 64px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#FDF6EC',
    color: '#92580A',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '.09em',
    textTransform: 'uppercase',
    padding: '7px 16px',
    borderRadius: 999,
    border: '1px solid #F5DFB0',
    marginBottom: 22,
  },
  h1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(40px, 6vw, 64px)',
    fontWeight: 800,
    color: '#0A0A0A',
    lineHeight: 1.06,
    letterSpacing: '-0.03em',
    marginBottom: 20,
  },
  h1em: { fontStyle: 'italic', color: '#C07722' },
  heroP: {
    fontSize: 15,
    color: '#6E6E6B',
    lineHeight: 1.75,
    maxWidth: 620,
    margin: '0 auto 48px',
    fontWeight: 400,
  },
  ctaRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 48,
  },
  btnPrimary: {
    background: '#C07722',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    padding: '15px 30px',
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  btnOutline: {
    background: '#fff',
    color: '#333',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    padding: '15px 30px',
    borderRadius: 14,
    border: '1.5px solid #E0DDD8',
    cursor: 'pointer',
  },
  tooltip: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1A1A1A',
    color: '#F5DFB0',
    fontSize: 11,
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: 10,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  /* Hero images */
  carouselContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    margin: 0,
  },
  carouselTrack: {
    display: 'flex',
    gap: 16,
    width: 'max-content',
  },
  heroImgWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 'clamp(180px, 20vw, 260px)',
    width: 'clamp(260px, 28vw, 360px)',
    position: 'relative',
    flexShrink: 0,
  },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  heroImgCap: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    fontSize: 13,
    fontWeight: 600,
    color: '#0A0A0A',
    padding: '8px 20px',
    borderRadius: 999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  /* Stores */
  section: { padding: '56px 40px', maxWidth: 940, margin: '0 auto', width: '100%' },
  eyebrow: {
    fontSize: 10,
    fontWeight: 700,
    color: '#C07722',
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  secTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(26px, 4vw, 36px)',
    fontWeight: 800,
    color: '#0A0A0A',
    lineHeight: 1.1,
    marginBottom: 10,
  },
  secSub: {
    fontSize: 13,
    color: '#8A8A87',
    lineHeight: 1.7,
    maxWidth: 400,
    marginBottom: 36,
  },
  storesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14,
  },
  storeCard: {
    background: '#fff',
    border: '1px solid #EBEBEA',
    borderRadius: 22,
    padding: 22,
    display: 'flex',
    gap: 16,
    cursor: 'pointer',
    transition: 'border-color .18s, box-shadow .18s, transform .18s',
  },
  storeCardHover: {
    borderColor: '#C07722',
    boxShadow: '0 4px 24px rgba(192,119,34,.10)',
    transform: 'translateY(-3px)',
  },
  storeImg: {
    width: 54,
    height: 54,
    borderRadius: 14,
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid #F0EDE8',
  },
  storeName: { fontSize: 14, fontWeight: 600, color: '#0A0A0A', marginBottom: 4 },
  storeDesc: { fontSize: 11, color: '#9A9A96', lineHeight: 1.55, marginBottom: 12 },
  storeRating: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    color: '#6E6E6B',
    background: '#F7F6F4',
    padding: '4px 10px',
    borderRadius: 999,
  },

  /* Features */
  featBand: {
    background: '#fff',
    borderTop: '1px solid #EBEBEA',
    borderBottom: '1px solid #EBEBEA',
  },
  featInner: {
    maxWidth: 940,
    margin: '0 auto',
    padding: '52px 40px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 32,
  },
  feat: { display: 'flex', flexDirection: 'column', gap: 12 },
  featIco: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: '#FDF6EC',
    border: '1px solid #F5DFB0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#C07722',
  },
  featTitle: { fontSize: 13, fontWeight: 600, color: '#0A0A0A' },
  featBody: { fontSize: 12, color: '#9A9A96', lineHeight: 1.65 },

  /* Promo */
  promoWrap: { maxWidth: 940, margin: '0 auto', padding: '0 40px 56px', width: '100%' },
  promoInner: {
    background: '#0A0A0A',
    borderRadius: 26,
    padding: '40px 44px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  promoH3: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    fontWeight: 800,
    color: '#FAF8F4',
    marginBottom: 8,
    lineHeight: 1.15,
  },
  promoP: { fontSize: 12, color: '#787874', maxWidth: 340, lineHeight: 1.65 },
  btnGold: {
    background: '#C07722',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    padding: '13px 22px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  /* Footer */
  footer: {
    padding: '28px 40px',
    borderTop: '1px solid #EBEBEA',
    maxWidth: 940,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  fBrand: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    fontWeight: 800,
    color: '#0A0A0A',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  fLinks: { display: 'flex', gap: 20 },
  fLink: { fontSize: 12, color: '#9A9A96', cursor: 'pointer', fontWeight: 500 },
  fCopy: { fontSize: 11, color: '#C4C2BE' },
};

/* ─── Data ─── */
const stores = [
  {
    name: 'Keells Super',
    desc: 'Freshness Guaranteed',
    rating: 4.6,
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&q=80',
  },
  {
    name: 'Cargills Food City',
    desc: "Sri Lanka's Everyday Retailer",
    rating: 4.5,
    img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&q=80',
  },
  {
    name: 'SPAR Sri Lanka',
    desc: 'International Quality & Assortment',
    rating: 4.8,
    img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=120&q=80',
  },
  {
    name: 'Laugfs Supermarket',
    desc: 'Your 24/7 Supermarket',
    rating: 4.2,
    img: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=120&q=80',
  },
];

const features = [
  {
    icon: <Tag size={18} />,
    title: 'Cheapest Basket Matcher',
    body: 'Add items to your cart and let our price comparison engine find which retailer offers the cheapest subtotal.',
  },
  {
    icon: <Truck size={18} />,
    body: 'Choose between platform couriers, store delivery, or third-party services based on your budget, speed, or ETA.',
    title: 'Courier Bid Marketplace',
  },
  {
    icon: <ShoppingBag size={18} />,
    title: 'Single-Checkout Restrict',
    body: 'Clean checkout workflow restricting items to one store branch, avoiding multi-location delivery failures.',
  },
];

const heroImages = [
  { src: 'https://images.unsplash.com/photo-1543168256-418811576931?w=600&q=80', alt: 'Fresh produce', caption: 'Fresh Produce' },
  { src: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&q=80', alt: 'Supermarket', caption: 'Top Supermarkets' },
  { src: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80', alt: 'Delivery', caption: 'Fast Delivery' },
  { src: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&q=80', alt: 'Budget matcher', caption: 'Budget Matcher' },
  { src: '/live_tracking_hero.png', alt: 'Live tracking', caption: 'Live Tracking' },
];

/* ─── Sub-components ─── */
function StoreCard({ store }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...S.storeCard, ...(hovered ? S.storeCardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={S.storeImg}>
        <img src={store.img} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div>
        <div style={S.storeName}>{store.name}</div>
        <div style={S.storeDesc}>{store.desc}</div>
        <span style={S.storeRating}>⭐ {store.rating}</span>
      </div>
    </div>
  );
}

/* ─── Animation variants ─── */
const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.13 } } };
const item = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };

/* ─── Main component ─── */
export const LandingPage = () => {
  const [ctaHover, setCtaHover] = useState(false);

  return (
    <div style={S.page}>

      {/* ── Hero ── */}
      <section style={S.hero}>
        <motion.div variants={container} initial="hidden" animate="visible"
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Centered text container to keep content from moving/stretching on other desktop sizes */}
          <div style={{ maxWidth: 860, width: '100%', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <motion.span variants={item} style={S.badge}>
              🇱🇰 Sri Lanka's First Grocery Marketplace
            </motion.span>

            <motion.h1 variants={item} style={S.h1}>
              Fresh Groceries,{' '}
              <br />
              <em style={S.h1em}>Smartest Prices.</em>
            </motion.h1>

            <motion.p variants={item} style={S.heroP}>
              Compare prices across Keells, Cargills Food City, SPAR, and Laugfs in real-time.
              Buy cheaper, track orders live, and get delivered instantly.
            </motion.p>

            <motion.div variants={item} style={S.ctaRow}>
              {/* Primary CTA with delivery tooltip on hover */}
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setCtaHover(true)}
                onMouseLeave={() => setCtaHover(false)}>
                <Link to="/select-location" style={{ textDecoration: 'none' }}>
                  <motion.button
                    style={S.btnPrimary}
                    whileHover={{ background: '#9E601A', y: -1 }}
                    whileTap={{ scale: 0.97 }}>
                    Start Shopping
                    <ArrowRight size={15} />
                  </motion.button>
                </Link>
                <AnimatePresence>
                  {ctaHover && (
                    <motion.div
                      style={S.tooltip}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.16 }}>
                      <Clock size={12} />
                      Delivered in 25–45 min
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/register?role=Courier" style={{ textDecoration: 'none' }}>
                <motion.button style={S.btnOutline} whileHover={{ borderColor: '#B8B5AF', y: -1 }} whileTap={{ scale: 0.97 }}>
                  Join as Delivery Partner
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Infinite Scrolling Card Carousel ── */}
      <div style={{ background: '#FAFAF8', borderBottom: '1px solid #EBEBEA', padding: '48px 0' }}>
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.div variants={item} style={S.carouselContainer}>
            <motion.div
              style={S.carouselTrack}
              animate={{ x: [0, "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
            >
              {[...heroImages, ...heroImages].map((img, idx) => (
                <div key={idx} style={S.heroImgWrap}>
                  <img src={img.src} alt={img.alt} style={S.heroImg} />
                  <span style={S.heroImgCap}>{img.caption}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Stores ── */}
      <section style={S.section}>
        <p style={S.eyebrow}>Supermarket Marketplace</p>
        <h2 style={S.secTitle}>Shop Your Favorite Supermarkets</h2>
        <p style={S.secSub}>Get instant access to items stocked at Sri Lanka's leading retail brands.</p>
        <div style={S.storesGrid}>
          {stores.map((store) => <StoreCard key={store.name} store={store} />)}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={S.featBand}>
        <div style={S.featInner}>
          {features.map((f) => (
            <div key={f.title} style={S.feat}>
              <div style={S.featIco}>{f.icon}</div>
              <div style={S.featTitle}>{f.title}</div>
              <div style={S.featBody}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Promo band ── */}
      <div style={S.promoWrap}>
        <div style={S.promoInner}>
          <div>
            <h3 style={S.promoH3}>Deliver on your<br />own schedule.</h3>
            <p style={S.promoP}>
              Join as a courier partner and earn on your terms. Bid on deliveries,
              set your zone, and get paid fast.
            </p>
          </div>
          <Link to="/register?role=Courier" style={{ textDecoration: 'none' }}>
            <motion.button style={S.btnGold} whileHover={{ background: '#9E601A' }} whileTap={{ scale: 0.97 }}>
              Become a Partner →
            </motion.button>
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <div style={S.fBrand}>🛒 Smart Grocery SL</div>
        <div style={S.fLinks}>
          <span style={S.fLink}>Terms of Service</span>
          <span style={S.fLink}>Privacy Policy</span>
          <span style={S.fLink}>Colombo Operations</span>
        </div>
        <span style={S.fCopy}>© 2026 Smart Grocery Sri Lanka. All Rights Reserved.</span>
      </footer>

    </div>
  );
};

export default LandingPage;
