import { db } from '../../../lib/db';
import './productDetail.css';
import Link from 'next/link';
import AddToCartClient from '../../../components/AddToCartClient';
import ProductImageGallery from '../../../components/ProductImageGallery';

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
        
        {/* Product Image Gallery */}
        <ProductImageGallery product={product} />

        {/* Product Info */}
        <div className="product-info-section">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link> / <Link href={`/?category=${product.category}#productos`}>{product.category}</Link> / <span>{product.name}</span>
          </div>
          
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-price">
            {product.category === 'Gift Card' ? (
              <span className="current-price">Monto a elección</span>
            ) : (
              <>
                {/* BLOQUE SUPERIOR — Precio de Lista */}
                {(product.listPrice || product.originalPrice) && (
                  <div className="list-price-block">
                    <span className="price-label">Precio de lista</span>
                    <div className="price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                      {product.listPrice != null && (
                        <span className="original-price">${Number(product.listPrice).toLocaleString('es-AR')}</span>
                      )}
                      {product.originalPrice != null && (
                        <span className="list-price-amount">${Number(product.originalPrice).toLocaleString('es-AR')}</span>
                      )}
                    </div>
                    <div className="installments-info">
                      <span className="installments-text">3 y 6 cuotas sin interes!!</span>
                      <img src="/visa-master.png" alt="Tarjetas aceptadas" className="cards-logo" />
                    </div>
                  </div>
                )}

                {/* BLOQUE INFERIOR — Precio Efectivo / Transferencia */}
                <div className="price-block effective-price-block">
                  {product.price != null ? (
                    <span className="effective-price">
                      ${Number(product.price).toLocaleString('es-AR')}{' '}
                      <span className="effective-price-suffix">con Efectivo/transferencia</span>
                    </span>
                  ) : (
                    <span className="effective-price">Consultar precio</span>
                  )}
                </div>
              </>
            )}
          </div>

          <AddToCartClient product={product} />

          <div className="product-description">
            <h3>Descripción</h3>
            {product.category === 'Gift Card' ? (
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {product.description || "Regalá movimiento y estilo con nuestra Gift Card. El regalo perfecto y más flexible para los amantes del deporte."}
              </p>
            ) : (
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {product.description || "Indumentaria deportiva premium, diseñada con materiales de alta calidad para brindar máximo confort y rendimiento en tus entrenamientos."}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
