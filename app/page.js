import { db } from '../lib/db';
import CatalogFilter from '../components/CatalogFilter';
import './page.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// SVG icons mapped to common category names (fallback icon for unknown categories)
const categoryIcons = {
  mujer: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
      <path d="M16 22v-2a4 4 0 0 0-8 0v2"/>
      <path d="M12 14c-4 0-6 2-6 4v4h12v-4c0-2-2-4-6-4z"/>
    </svg>
  ),
  hombre: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="4"/>
      <path d="M20 22v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    </svg>
  ),
  hombres: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="4"/>
      <path d="M20 22v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    </svg>
  ),
  unisex: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  'gift card': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2"/>
      <path d="M12 8V21"/>
      <path d="M3 12h18"/>
      <path d="M12 8c-2-3-6-3-6 0s4 4 6 0"/>
      <path d="M12 8c2-3 6-3 6 0s-4 4-6 0"/>
    </svg>
  ),
  'niños': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2.5"/>
      <path d="M12 6.5v4"/>
      <path d="M8 8.5l4 2 4-2"/>
      <path d="M9 14l-2 7"/>
      <path d="M15 14l2 7"/>
      <path d="M12 10.5v5"/>
    </svg>
  ),
};

// Gradient backgrounds mapped to common category names (fallback for unknown)
const categoryGradients = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #2a1a3e 50%, #1a1a2e 100%)',
  'linear-gradient(135deg, #0a1a2a 0%, #1a3a4a 50%, #0a2a3a 100%)',
  'linear-gradient(135deg, #2a1a1a 0%, #3d2a2a 50%, #2a1a1a 100%)',
  'linear-gradient(135deg, #1a2a1a 0%, #2a3d2a 50%, #1a2a1a 100%)',
];

const knownGradients = {
  mujer: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  hombre: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
  hombres: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
  unisex: 'linear-gradient(135deg, #1a1a2e 0%, #2a1a3e 50%, #1a1a2e 100%)',
  'gift card': 'linear-gradient(135deg, #2a1a0a 0%, #3d2a1a 50%, #2a1a0a 100%)',
  'niños': 'linear-gradient(135deg, #0a1a2a 0%, #1a3a4a 50%, #0a2a3a 100%)',
};

// Short descriptions for known categories
const categoryDescriptions = {
  mujer: 'Rendimiento y estilo sin límites.',
  hombre: 'Potencia para cada entrenamiento.',
  hombres: 'Potencia para cada entrenamiento.',
  unisex: 'Diseños versátiles para todos.',
  'gift card': 'El regalo ideal para deportistas.',
  'niños': 'Comodidad y diversión para los más chicos.',
};

// Default icon for unknown categories
const defaultIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
  </svg>
);

function getCategoryIcon(name) {
  return categoryIcons[name.toLowerCase()] || defaultIcon;
}

function getCategoryGradient(name, index) {
  return knownGradients[name.toLowerCase()] || categoryGradients[index % categoryGradients.length];
}

function getCategoryDescription(name) {
  return categoryDescriptions[name.toLowerCase()] || 'Explorá esta categoría.';
}

export default async function Home() {
  const [products, dbCategories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    db.category.findMany({
      orderBy: { name: 'asc' }
    }),
  ]);

  // Separate regular categories from Gift Card for the featured section
  const regularCats = dbCategories.filter(c => c.name.toLowerCase() !== 'gift card');
  const giftCardCat = dbCategories.find(c => c.name.toLowerCase() === 'gift card') || { id: 'gift-card-virtual', name: 'Gift Card' };

  // Build the ordered list for the featured grid: regular categories first, Gift Card last
  const featuredCategories = [...regularCats, giftCardCat];

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
            <Link href="/?category=Mujer#productos" className="hero-btn secondary">Explorar Mujer</Link>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span></span>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="video-section">
        <div className="video-section-inner">
          <div className="video-container">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src="/video-hero.mp4"
            />
          </div>
          <div className="video-text">
            <span className="video-badge">Nuevo Drop</span>
            <h2>Diseñada para<br/>el movimiento</h2>
            <p>
              Cada prenda está pensada para acompañarte en tu entrenamiento. 
              Telas de alto rendimiento, cortes que se adaptan a tu cuerpo 
              y diseños que no pasan desapercibidos.
            </p>
            <div className="video-stats">
              <div className="video-stat">
                <span className="stat-number">+500</span>
                <span className="stat-label">Clientes activos</span>
              </div>
              <div className="video-stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Calidad premium</span>
              </div>
              <div className="video-stat">
                <span className="stat-number">24hs</span>
                <span className="stat-label">Envío rápido</span>
              </div>
            </div>
            <a href="https://wa.me/5493518197872" className="video-cta" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Escribinos por WhatsApp
            </a>
          </div>
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

      {/* Featured Categories — Dynamic from DB */}
      <section className="categories-section container">
        <div className="section-header">
          <span className="section-label">Categorías</span>
          <h2>Encontrá tu estilo</h2>
        </div>
        <div className="category-grid" style={{
          gridTemplateColumns: featuredCategories.length <= 4
            ? `repeat(${featuredCategories.length}, 1fr)`
            : 'repeat(auto-fill, minmax(220px, 1fr))'
        }}>
          {featuredCategories.map((cat, index) => {
            const isGiftCard = cat.name.toLowerCase() === 'gift card';
            return (
              <Link
                key={cat.id}
                href={`/?category=${encodeURIComponent(cat.name)}#productos`}
                className={`category-card ${isGiftCard ? 'highlight' : ''}`}
              >
                <div
                  className="category-card-bg"
                  style={{ background: getCategoryGradient(cat.name, index) }}
                />
                <div className="category-card-content">
                  <div className="cat-icon">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="cat-number">{String(index + 1).padStart(2, '0')}</span>
                  <div className="cat-text">
                    <h2>{cat.name}</h2>
                    <p className="cat-desc">{getCategoryDescription(cat.name)}</p>
                  </div>
                  <span className="cat-arrow">→</span>
                </div>
              </Link>
            );
          })}
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
        
        <CatalogFilter initialProducts={products} dbCategories={dbCategories} />
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
