import { db } from '../../lib/db';
import ProductCard from '../../components/ProductCard';
import '../page.css'; // Reuse home page styles for grid

export default async function CategoryPage({ params }) {
  const { category } = await params;
  
  // Decode the URL parameter (handles encoded characters like %C3%B1 for ñ)
  const decodedCategory = decodeURIComponent(category);

  // Look up the category in the DB to get the exact name (case-insensitive match)
  const dbCategory = await db.category.findFirst({
    where: {
      name: {
        equals: decodedCategory,
        mode: 'insensitive',
      },
    },
  });

  const isGiftCardRoute = decodedCategory.toLowerCase().replace(/[\s-_]+/g, '') === 'giftcard';

  // Use the DB category name if found (exact casing), otherwise capitalize the URL param
  const categoryName = isGiftCardRoute
    ? 'Gift Card'
    : dbCategory
      ? dbCategory.name
      : decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1).replace('-', ' ');

  // Fetch products matching this category (case-insensitive)
  const categoryProducts = await db.product.findMany({
    where: {
      category: {
        equals: categoryName,
        mode: 'insensitive'
      }
    },
    orderBy: { categoryOrder: 'asc' }
  });

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
