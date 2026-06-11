import { mockProducts } from '../../../data/mockProducts';
import './productDetail.css';
import Link from 'next/link';
import AddToCartClient from '../../../components/AddToCartClient';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Producto no encontrado</h2>
        <Link href="/" style={{ textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-wrapper container">
      <div className="product-layout">
        
        {/* Product Image */}
        <div className="product-image-section">
          {product.originalPrice && (
            <span className="detail-discount-badge">OFERTA</span>
          )}
          <img src={product.imageUrl} alt={product.name} />
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / <Link href={`/${product.category.toLowerCase()}`}>{product.category}</Link> / <span>{product.name}</span>
          </div>
          
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-price">
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice.toLocaleString('es-AR')}</span>
            )}
            <span className="current-price">${product.price.toLocaleString('es-AR')}</span>
          </div>

          <AddToCartClient product={product} />

          <div className="product-description">
            <h3>Descripción</h3>
            <p>
              {product.description || "Indumentaria deportiva premium, diseñada con materiales de alta calidad para brindar máximo confort y rendimiento en tus entrenamientos."}
            </p>
            <ul className="details-list">
              <li>Lycra premium / Suplex</li>
              <li>Calce perfecto</li>
              <li>Soporte y elasticidad</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
