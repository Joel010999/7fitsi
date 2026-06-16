import { db } from '../lib/db';
import CatalogFilter from '../components/CatalogFilter';
import './page.css';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="home-wrapper">
      {/* Hero Section with Background Image */}
      <section className="hero">
        <div className="hero-bg-image"></div>
        <div className="hero-overlay"></div>
        <div className="hero-particles">
          <span className="particle p1"></span>
          <span className="particle p2"></span>
          <span className="particle p3"></span>
          <span className="particle p4"></span>
          <span className="particle p5"></span>
        </div>
        <div className="hero-content">
          <span className="hero-badge">7cero Sports — 2025</span>
          <h1>Nueva<br/>Colección</h1>
          <p>Indumentaria deportiva premium diseñada para el movimiento.</p>
          <div className="hero-cta-group">
            <Link href="#productos" className="hero-btn primary">Ver Productos</Link>
            <Link href="/mujer" className="hero-btn secondary">Explorar Mujer</Link>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span></span>
        </div>
      </section>

      {/* Infinite Marquee Banner */}
      <section className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-content">
            <span>NUEVA TEMPORADA</span>
            <span className="marquee-dot">●</span>
            <span>ENVÍOS A TODO EL PAÍS</span>
            <span className="marquee-dot">●</span>
            <span>COMPRA POR WHATSAPP</span>
            <span className="marquee-dot">●</span>
            <span>CALIDAD PREMIUM</span>
            <span className="marquee-dot">●</span>
            <span>NUEVA TEMPORADA</span>
            <span className="marquee-dot">●</span>
            <span>ENVÍOS A TODO EL PAÍS</span>
            <span className="marquee-dot">●</span>
            <span>COMPRA POR WHATSAPP</span>
            <span className="marquee-dot">●</span>
            <span>CALIDAD PREMIUM</span>
            <span className="marquee-dot">●</span>
          </div>
        </div>
      </section>

      {/* Featured Categories with Images */}
      <section className="categories-section container">
        <div className="section-header">
          <span className="section-label">Categorías</span>
          <h2>Encontrá tu estilo</h2>
        </div>
        <div className="category-grid">
          <Link href="/?category=Mujer#productos" className="category-card cat-mujer">
            <div className="category-card-bg"></div>
            <div className="category-card-content">
              <span className="cat-number">01</span>
              <div className="cat-text">
                <h2>Mujer</h2>
                <p className="cat-desc">Rendimiento y estilo sin límites.</p>
              </div>
              <span className="cat-arrow">→</span>
            </div>
          </Link>
          <Link href="/?category=Hombre#productos" className="category-card cat-hombre">
            <div className="category-card-bg"></div>
            <div className="category-card-content">
              <span className="cat-number">02</span>
              <div className="cat-text">
                <h2>Hombre</h2>
                <p className="cat-desc">Potencia para cada entrenamiento.</p>
              </div>
              <span className="cat-arrow">→</span>
            </div>
          </Link>
          <Link href="/?category=Unisex#productos" className="category-card cat-unisex">
            <div className="category-card-bg"></div>
            <div className="category-card-content">
              <span className="cat-number">03</span>
              <div className="cat-text">
                <h2>Unisex</h2>
                <p className="cat-desc">Diseños versátiles para todos.</p>
              </div>
              <span className="cat-arrow">→</span>
            </div>
          </Link>
          <Link href="/?category=Gift Card#productos" className="category-card cat-gift highlight">
            <div className="category-card-bg"></div>
            <div className="category-card-content">
              <span className="cat-number">04</span>
              <div className="cat-text">
                <h2>Gift Card</h2>
                <p className="cat-desc">El regalo ideal para deportistas.</p>
              </div>
              <span className="cat-arrow">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Visual Showcase - Sports Imagery */}
      <section className="showcase-section">
        <div className="showcase-grid">
          <div className="showcase-item showcase-large">
            <Image src="/images/sports_runner.png" alt="Atleta en acción" fill style={{ objectFit: 'cover' }} />
            <div className="showcase-overlay">
              <span>RENDIMIENTO</span>
            </div>
          </div>
          <div className="showcase-item showcase-small">
            <Image src="/images/apparel_detail.png" alt="Detalle de tela deportiva" fill style={{ objectFit: 'cover' }} />
            <div className="showcase-overlay">
              <span>CALIDAD</span>
            </div>
          </div>
          <div className="showcase-item showcase-small">
            <Image src="/images/sports_store_bg.png" alt="Tienda 7cero Sports" fill style={{ objectFit: 'cover' }} />
            <div className="showcase-overlay">
              <span>ESTILO</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3>Envío Seguro</h3>
            <p>Tu pedido llega protegido a cualquier punto del país.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>Calidad Premium</h3>
            <p>Materiales de alto rendimiento que marcan la diferencia.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <h3>Compra por WhatsApp</h3>
            <p>Atención personalizada y respuestas al instante.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3>Diseño Exclusivo</h3>
            <p>Piezas únicas pensadas para cada tipo de entrenamiento.</p>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section id="productos" className="catalog-section container">
        <div className="section-header">
          <span className="section-label">Catálogo</span>
          <h2>Todos los Productos</h2>
        </div>
        
        <CatalogFilter initialProducts={products} />
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="footer-cta-content container">
          <h2>¿Lista para entrenar?</h2>
          <p>Seguinos en redes y descubrí las últimas novedades.</p>
          <a href="https://wa.me/5493518197872" className="hero-btn primary" target="_blank" rel="noopener noreferrer">
            Contactanos por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
