'use client';

import { useState } from 'react';

export default function AddToCartClient({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  const handleCheckout = () => {
    // We will build a WhatsApp message
    const message = `¡Hola Acero Sports! Quiero comprar:\n\n*${product.name}*\nColor: ${selectedColor}\nTalle: ${selectedSize}\nPrecio: $${product.price.toLocaleString('es-AR')}\n\nPor favor indíquenme cómo seguimos.`;
    
    // Replace with the actual WhatsApp number later
    const whatsappNumber = '5491100000000'; // Placeholder
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="product-options">
      <div className="option-group">
        <h3>Color</h3>
        <div className="option-selector">
          {product.colors.map(color => (
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
        <h3>Talle</h3>
        <div className="option-selector">
          {product.sizes.map(size => (
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

      <button className="add-to-cart-btn w-full" onClick={handleCheckout} style={{ marginTop: '1rem' }}>
        Comprar por WhatsApp
      </button>
    </div>
  );
}
