'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = '7cero_cart';

// Generate a unique item ID from product id + color + size
function makeItemId(productId, color, size) {
  return `${productId}_${color}_${size}`;
}

// Reducer actions
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, cartItems: action.payload };

    case 'ADD_TO_CART': {
      const { product, color, size, stock } = action.payload;
      const itemId = makeItemId(product.id, color, size);
      const existing = state.cartItems.find(item => item.itemId === itemId);

      if (existing) {
        // Already in cart — increment qty if stock allows
        if (existing.quantity >= stock) return state;
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.itemId === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      // New entry
      const newItem = {
        itemId,
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        color,
        size,
        price: product.price,
        listPrice: product.listPrice ?? null,
        originalPrice: product.originalPrice ?? null,
        category: product.category,
        stock,
        quantity: 1,
      };
      return { ...state, cartItems: [...state.cartItems, newItem] };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, delta } = action.payload;
      return {
        ...state,
        cartItems: state.cartItems
          .map(item => {
            if (item.itemId !== itemId) return item;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null; // will be filtered
            if (newQty > item.stock) return item; // cap at stock
            return { ...item, quantity: newQty };
          })
          .filter(Boolean),
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.itemId !== action.payload),
      };

    case 'CLEAR_CART':
      return { ...state, cartItems: [] };

    case 'OPEN_CART':
      return { ...state, isCartOpen: true };

    case 'CLOSE_CART':
      return { ...state, isCartOpen: false };

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    isCartOpen: false,
  });

  // Track if we've hydrated from localStorage to avoid SSR mismatch
  const [hydrated, setHydrated] = useState(false);

  // Hydrate cart from localStorage on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch (err) {
      console.error('Error reading cart from localStorage:', err);
    }
    setHydrated(true);
  }, []);

  // Persist cart to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cartItems));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [state.cartItems, hydrated]);

  // Action creators
  const addToCart = (product, color, size, stock) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, color, size, stock } });
  };

  const updateQuantity = (itemId, delta) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, delta } });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  // Derived values
  const totalItems = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getTotalByPriceType = (priceType) => {
    return state.cartItems.reduce((sum, item) => {
      let unitPrice;
      if (priceType === 'lista') {
        // Use listPrice if available, then originalPrice, fallback to price
        unitPrice = item.listPrice ?? item.originalPrice ?? item.price;
      } else {
        // Efectivo — use price
        unitPrice = item.price;
      }
      return sum + unitPrice * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        isCartOpen: state.isCartOpen,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        getTotalByPriceType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
