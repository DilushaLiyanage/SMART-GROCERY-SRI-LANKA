import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Tag, ShoppingCart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super'
};

const storeLogos = {
  keells: 'bg-green-700 text-white',
  cargills: 'bg-red-700 text-white',
  spar: 'bg-emerald-800 text-yellow-400',
  laugfs: 'bg-amber-600 text-white'
};

export const PriceComparisonCard = ({ product, onAddSuccess, onAddError }) => {
  const { addToCart, selectedStore } = useContext(CartContext);

  const getPriceList = () => {
    const list = [];
    let minPrice = Infinity;
    let cheapestStore = null;

    Object.entries(product.prices).forEach(([store, price]) => {
      if (price !== null) {
        const stock = product.stock[store] || 0;
        list.push({ store, price, stock });
        if (price < minPrice && stock > 0) {
          minPrice = price;
          cheapestStore = store;
        }
      }
    });

    return {
      cheapestStore,
      list: list.sort((a, b) => a.price - b.price)
    };
  };

  const { cheapestStore, list } = getPriceList();

  const handleAddToCart = (storeCode) => {
    const res = addToCart(product, storeCode, 1);
    if (res.success) {
      if (onAddSuccess) onAddSuccess(`Added ${product.name} from ${storeNames[storeCode]} to cart!`);
    } else {
      if (onAddError) onAddError(res.error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 border border-slate-800 hover:border-slate-700"
    >
      {/* Background radial accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-ceylon-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Meta */}
        <div className="w-full md:w-1/3 flex flex-col items-center text-center md:items-start md:text-left justify-between">
          <div className="w-full">
            <div className="relative bg-slate-900/50 rounded-2xl p-4 flex items-center justify-center h-48 border border-slate-800/80 mb-4">
              <span className="text-5xl">🛒</span>
              {/* Product category tag */}
              <span className="absolute top-3 left-3 bg-slate-800/90 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700">
                {product.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">{product.name}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-3">{product.description}</p>
          </div>
        </div>

        {/* Supermarket Comparison Grid */}
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          <h4 className="text-slate-400 font-medium text-xs tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-ceylon-500" />
            Live Price Comparison
          </h4>
          
          <div className="space-y-3.5">
            {list.map(({ store, price, stock }) => {
              const isCheapest = store === cheapestStore;
              const isOutOfStock = stock <= 0;
              const isOtherStoreActive = selectedStore && selectedStore !== store;

              return (
                <div 
                  key={store}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                    isCheapest && !isOutOfStock
                      ? 'bg-ceylon-500/10 border-ceylon-500/35 shadow-[0_0_15px_rgba(25,135,84,0.08)]' 
                      : 'bg-slate-900/40 border-slate-800/60'
                  } hover:bg-slate-900/70`}
                >
                  {/* Store Identity */}
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs tracking-wider ${storeLogos[store]}`}>
                      {storeNames[store].charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{storeNames[store]}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {isOutOfStock ? (
                          <span className="text-[11px] text-rose-500 flex items-center gap-0.5 font-medium">
                            <AlertCircle className="w-3 h-3" /> Out of stock
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-500 flex items-center gap-0.5 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> {stock} items available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-800/60 sm:border-0">
                    <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                      <span className="text-lg font-bold text-white">Rs. {price.toLocaleString()}</span>
                      {isCheapest && !isOutOfStock && (
                        <span className="bg-ceylon-500 text-white font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded">
                          Cheapest ✅
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(store)}
                      disabled={isOutOfStock || isOtherStoreActive}
                      className={`h-10 px-4 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all duration-200 ${
                        isOutOfStock 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : isOtherStoreActive 
                            ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800'
                            : isCheapest
                              ? 'bg-ceylon-500 hover:bg-ceylon-600 text-white shadow-lg shadow-ceylon-500/20 hover:scale-[1.03]'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:scale-[1.03]'
                      }`}
                      title={isOtherStoreActive ? 'Clear cart to order from this store' : ''}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default PriceComparisonCard;
