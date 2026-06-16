import Link from 'next/link';
import Image from 'next/image';
import './ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="image-container">
        {product.originalPrice && (
          <span className="discount-badge">OFERTA</span>
        )}
        <Image 
          src={product.imageUrl} 
          alt={product.name} 
          fill 
          sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 300px"
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price">
          {product.originalPrice && product.category !== 'Gift Card' && (
            <span className="original-price">${product.originalPrice.toLocaleString('es-AR')}</span>
          )}
          {product.category === 'Gift Card' ? (
            <span className="current-price">Monto a elección</span>
          ) : (
            <span className="current-price">${product.price.toLocaleString('es-AR')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
