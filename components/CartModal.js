'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './CartModal.css';

const WHATSAPP_NUMBER = '5493518197872';

export default function CartModal() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalByPriceType,
  } = useCart();

  const [priceType, setPriceType] = useState('efectivo'); // 'efectivo' | 'lista'

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  const getItemPrice = (item) => {
    if (priceType === 'lista') {
      return item.listPrice ?? item.originalPrice ?? item.price;
    }
    return item.price;
  };

  const formatPrice = (num) => {
    return Number(num).toLocaleString('es-AR');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const paymentLabel = priceType === 'efectivo'
      ? 'Efectivo/Transferencia'
      : 'Lista (Cuotas)';

    const itemLines = cartItems.map((item) => {
      const unitPrice = getItemPrice(item);
      const subtotal = unitPrice * item.quantity;
      if (item.category === 'Gift Card') {
        return `🔹 ${item.name} — Monto: $${formatPrice(unitPrice)} — x${item.quantity} — $${formatPrice(subtotal)}`;
      }
      return `🔹 ${item.name} — Talle ${item.size} — ${item.color} — x${item.quantity} — $${formatPrice(subtotal)}`;
    });

    const total = getTotalByPriceType(priceType);

    const message = `¡Hola! Quiero realizar este pedido en 7cero:\n\n${itemLines.join('\n')}\n\n💰 Total (${paymentLabel}): $${formatPrice(total)}\n\n¿Cómo avanzamos?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    clearCart();
    closeCart();
  };

  const total = getTotalByPriceType(priceType);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      {/* Panel */}
      <aside className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <h2>
            Tu Carrito{' '}
            {cartItems.length > 0 && (
              <span className="cart-header-count">({cartItems.length})</span>
            )}
          </h2>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Cerrar carrito">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Tu carrito está vacío</p>
              <button className="cart-empty-cta" onClick={closeCart}>
                Ver Productos
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.itemId}>
                {/* Thumbnail */}
                <div className="cart-item-image">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} />
                  )}
                </div>

                {/* Details */}
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-variant">
                    {item.category === 'Gift Card'
                      ? `Monto: $${formatPrice(item.price)}`
                      : `${item.color} · ${item.size}`
                    }
                  </p>
                  <p className="cart-item-price">
                    ${formatPrice(getItemPrice(item) * item.quantity)}
                  </p>

                  {/* Quantity + Remove */}
                  <div className="cart-item-actions">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.itemId, -1)}
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.itemId, 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>

                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.itemId)}
                      aria-label="Eliminar producto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — only show when cart has items */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Payment type selector */}
            <div className="payment-type-selector">
              <button
                className={`payment-type-btn ${priceType === 'efectivo' ? 'active' : ''}`}
                onClick={() => setPriceType('efectivo')}
              >
                💵 Efectivo / Transfer.
              </button>
              <button
                className={`payment-type-btn ${priceType === 'lista' ? 'active' : ''}`}
                onClick={() => setPriceType('lista')}
              >
                💳 Lista (Cuotas)
              </button>
            </div>

            {/* Total */}
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-amount">${formatPrice(total)}</span>
            </div>

            {/* Action buttons */}
            <div className="cart-footer-btns">
              <button className="cart-btn-continue" onClick={closeCart}>
                Seguir Comprando
              </button>
              <button className="cart-btn-checkout" onClick={handleCheckout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Finalizar Compra
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
