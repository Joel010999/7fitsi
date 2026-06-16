import { db } from '../../../lib/db';
import './productDetail.css';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartClient from '../../../components/AddToCartClient';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id: id }
  });

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
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
            <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / <Link href={`/?category=${product.category}#productos`}>{product.category}</Link> / <span>{product.name}</span>
          </div>
          
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-price">
            {product.originalPrice && product.category !== 'Gift Card' && (
              <span className="original-price">${product.originalPrice.toLocaleString('es-AR')}</span>
            )}
            {product.category === 'Gift Card' ? (
              <span className="current-price">Monto a elección</span>
            ) : (
              <span className="current-price">${product.price.toLocaleString('es-AR')}</span>
            )}
          </div>

          <AddToCartClient product={product} />

          <div className="product-description">
            <h3>Descripción</h3>
            {product.category === 'Gift Card' ? (
              <>
                <p>
                  {product.description || "Regalá movimiento y estilo con nuestra Gift Card. El regalo perfecto y más flexible para los amantes del deporte."}
                </p>
                <ul className="details-list">
                  <li>Monto a tu elección</li>
                  <li>Canjeable por cualquier producto en stock</li>
                  <li>Se envía en formato digital a tu email o WhatsApp</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  {product.description || "Indumentaria deportiva premium, diseñada con materiales de alta calidad para brindar máximo confort y rendimiento en tus entrenamientos."}
                </p>
                <ul className="details-list">
                  <li>Lycra premium / Suplex</li>
                  <li>Calce perfecto</li>
                  <li>Soporte y elasticidad</li>
                </ul>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
