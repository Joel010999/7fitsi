'use client';

import { useState } from 'react';

export default function AddToCartClient({ product }) {
  // En la DB colors y sizes se guardan como un string separado por comas
  const colorsList = typeof product.colors === 'string' ? product.colors.split(',').map(c => c.trim()) : (product.colors || []);
  const sizesList = typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : (product.sizes || []);

  const [selectedColor, setSelectedColor] = useState(colorsList[0] || '');
  const [selectedSize, setSelectedSize] = useState(sizesList[0] || '');
  const [customAmount, setCustomAmount] = useState('');
  
  const isGiftCard = product.category === 'Gift Card';

  const handleCheckout = () => {
    if (isGiftCard && (!customAmount || isNaN(customAmount) || Number(customAmount) <= 0)) {
      alert('Por favor ingresá un monto válido para regalar.');
      return;
    }

    const finalPrice = isGiftCard ? Number(customAmount).toLocaleString('es-AR') : product.price.toLocaleString('es-AR');
    
    // We will build a WhatsApp message
    const message = `¡Hola 7CERO Sports! Quiero comprar:\n\n*${product.name}*\n${isGiftCard ? `Monto a regalar: $${finalPrice}` : `Color: ${selectedColor}\nTalle: ${selectedSize}\nPrecio: $${finalPrice}`}\n\nPor favor indíquenme cómo seguimos.`;
    
    // Replace with the actual WhatsApp number later
    const whatsappNumber = '5493518197872'; // Updated with real number
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
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
            <h3>Talle</h3>
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

      <button className="add-to-cart-btn w-full" onClick={handleCheckout} style={{ marginTop: '1rem' }}>
        Comprar por WhatsApp
      </button>
    </div>
  );
}
