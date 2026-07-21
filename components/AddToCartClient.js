'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function AddToCartClient({ product }) {
  // En la DB colors y sizes se guardan como un string separado por comas
  const colorsList = typeof product.colors === 'string' ? product.colors.split(',').map(c => c.trim()) : (product.colors || []);
  const sizesList = typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : (product.sizes || []);

  const [selectedColor, setSelectedColor] = useState(colorsList[0] || '');
  const [selectedSize, setSelectedSize] = useState(sizesList[0] || '');
  const [customAmount, setCustomAmount] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const { addToCart, openCart } = useCart();

  // Parse variants and check stock
  const variants = (() => {
    if (!product.variants) return [];
    try {
      return JSON.parse(product.variants);
    } catch (err) {
      console.error('Error parsing product variants:', err);
      return [];
    }
  })();

  const selectedVariant = variants.find(
    v => v.size.toLowerCase() === selectedSize.toLowerCase() && v.color.toLowerCase() === selectedColor.toLowerCase()
  );
  const selectedStock = selectedVariant ? selectedVariant.stock : 0;
  
  const isGiftCard = product.category === 'Gift Card';

  const handleAddToCart = () => {
    if (isGiftCard) {
      if (!customAmount || isNaN(customAmount) || Number(customAmount) <= 0) {
        alert('Por favor ingresá un monto válido para regalar.');
        return;
      }

      // For Gift Cards, create a product-like object with the custom price
      const giftCardProduct = {
        ...product,
        price: Number(customAmount),
        listPrice: Number(customAmount),
        originalPrice: null,
      };

      addToCart(giftCardProduct, 'Gift Card', `$${Number(customAmount).toLocaleString('es-AR')}`, 999);
    } else {
      if (selectedStock <= 0) {
        alert('Este producto no tiene stock disponible en el color y talle seleccionados.');
        return;
      }

      addToCart(product, selectedColor, selectedSize, selectedStock);
    }

    // Show brief visual feedback
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);

    // Open cart modal
    openCart();
  };

  return (
    <div className="product-options">
      {isGiftCard ? (
        <div className="option-group">
          <h3>Monto a Regalar ($)</h3>
          <input 
            type="number" 
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Ej: 25000"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              marginTop: '0.5rem'
            }}
          />
        </div>
      ) : (
        <>
          <div className="option-group">
            <h3>Color</h3>
            <div className="option-selector">
              {colorsList.map(color => (
                <button 
                  key={color} 
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    borderColor: selectedColor === color ? 'var(--text-primary)' : 'var(--border)',
                    borderWidth: selectedColor === color ? '2px' : '1px'
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Talle</h3>
              <span className="stock-indicator" style={{ fontSize: '0.85rem', fontWeight: '600', color: selectedStock > 0 ? '#22c55e' : '#ef4444' }}>
                {selectedStock > 0 ? `Stock: ${selectedStock}` : 'Stock: 0'}
              </span>
            </div>
            <div className="option-selector">
              {sizesList.map(size => (
                <button 
                  key={size} 
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    borderColor: selectedSize === size ? 'var(--text-primary)' : 'var(--border)',
                    borderWidth: selectedSize === size ? '2px' : '1px'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        className="add-to-cart-btn w-full"
        onClick={handleAddToCart}
        disabled={!isGiftCard && selectedStock <= 0}
        style={{
          marginTop: '1rem',
          opacity: (!isGiftCard && selectedStock <= 0) ? 0.5 : 1,
          cursor: (!isGiftCard && selectedStock <= 0) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          background: addedFeedback ? '#22c55e' : undefined,
        }}
      >
        {addedFeedback
          ? '✓ ¡Agregado!'
          : (!isGiftCard && selectedStock <= 0)
            ? 'Sin Stock'
            : '🛒 Agregar al Carrito'
        }
      </button>
    </div>
  );
}

