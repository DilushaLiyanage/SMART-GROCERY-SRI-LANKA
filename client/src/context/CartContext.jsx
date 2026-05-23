import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedStore = localStorage.getItem('cartStore');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedStore) setSelectedStore(savedStore);
  }, []);

  // Sync cart with localStorage on changes
  const saveCartToStorage = (items, store) => {
    localStorage.setItem('cart', JSON.stringify(items));
    if (store) {
      localStorage.setItem('cartStore', store);
    } else {
      localStorage.removeItem('cartStore');
    }
  };

  const addToCart = (product, storeCode, quantity = 1) => {
    // If cart is empty, set selected store
    if (cartItems.length === 0) {
      setSelectedStore(storeCode);
      const price = product.prices[storeCode];
      const newItems = [{
        productId: product._id,
        name: product.name,
        image: product.image,
        category: product.category,
        price,
        quantity
      }];
      setCartItems(newItems);
      saveCartToStorage(newItems, storeCode);
      return { success: true };
    }

    // Check if adding from the same store
    if (selectedStore !== storeCode) {
      return { 
        success: false, 
        error: 'Multi-store restriction: You can only add products from one supermarket at a time. Please clear your current cart first.' 
      };
    }

    // Add to existing store cart
    const existingIndex = cartItems.findIndex(item => item.productId === product._id);
    let newItems = [...cartItems];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity;
    } else {
      const price = product.prices[storeCode];
      newItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        category: product.category,
        price,
        quantity
      });
    }

    setCartItems(newItems);
    saveCartToStorage(newItems, storeCode);
    return { success: true };
  };

  const removeFromCart = (productId) => {
    const newItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(newItems);
    
    const store = newItems.length === 0 ? null : selectedStore;
    if (newItems.length === 0) setSelectedStore(null);
    
    saveCartToStorage(newItems, store);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newItems = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    );
    setCartItems(newItems);
    saveCartToStorage(newItems, selectedStore);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedStore(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartStore');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      selectedStore,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
