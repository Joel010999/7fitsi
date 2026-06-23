'use client';

import { useState, useEffect } from 'react';

export default function ProductImageGallery({ product }) {
  const [mainImage, setMainImage] = useState('');

  // Extract images array from product
  let images = [];
  if (product.images) {
    try {
      images = JSON.parse(product.images);
    } catch (e) {
      console.error('Error parsing product images JSON:', e);
      images = [];
    }
  }

  // Fallback to imageUrl if no images parsed
  if (!images || images.length === 0) {
    if (product.imageUrl) {
      images = [product.imageUrl];
    } else {
      images = ['']; // Empty placeholder
    }
  }

  // Set first image as active when product changes
  useEffect(() => {
    if (images.length > 0) {
      setMainImage(images[0]);
    }
  }, [product.id, product.images, product.imageUrl]);

  return (
    <div className="gallery-container">
      <div className="gallery-main-container">
        {product.originalPrice && product.category !== 'Gift Card' && (
          <span className="detail-discount-badge">OFERTA</span>
        )}
        <div className="gallery-main-image">
          {mainImage ? (
            <img src={mainImage} alt={product.name} />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}>
              Sin imagen
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`gallery-thumbnail ${mainImage === img ? 'active' : ''}`}
              onClick={() => setMainImage(img)}
            >
              <img src={img} alt={`${product.name} miniatura ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
