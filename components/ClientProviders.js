'use client';

import { CartProvider } from '../context/CartContext';
import CartModal from './CartModal';

export default function ClientProviders({ children }) {
  return (
    <CartProvider>
      {children}
      <CartModal />
    </CartProvider>
  );
}
