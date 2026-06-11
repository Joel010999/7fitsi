import Link from 'next/link';
import './ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="product-image-link">
        <div className="image-container">
          {product.originalPrice && (
            <span className="discount-badge">OFERTA</span>
          )}
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        </div>
      </Link>
      
      <div className="product-info">
        <Link href={`/product/${product.id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <div className="product-price">
          {product.originalPrice && (
            <span className="original-price">${product.originalPrice.toLocaleString('es-AR')}</span>
          )}
          <span className="current-price">${product.price.toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
}
