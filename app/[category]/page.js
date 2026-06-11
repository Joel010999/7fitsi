import { mockProducts } from '../../data/mockProducts';
import ProductCard from '../../components/ProductCard';
import '../page.css'; // Reuse home page styles for grid

export default async function CategoryPage({ params }) {
  const { category } = await params;
  
  // Capitalize category and handle special cases if any
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  
  const categoryProducts = mockProducts.filter(
    p => p.category.toLowerCase() === categoryName.toLowerCase() || 
         (category === 'giftcard' && p.category.toLowerCase() === 'gift card')
  );

  return (
    <div className="home-wrapper" style={{ paddingTop: '2rem' }}>
      <section className="catalog-section container">
        <div className="section-header">
          <h2>{categoryName}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {categoryProducts.length} producto{categoryProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {categoryProducts.length > 0 ? (
          <div className="products-grid">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h3>No hay productos en esta categoría por el momento.</h3>
          </div>
        )}
      </section>
    </div>
  );
}
