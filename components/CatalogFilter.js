'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

function CatalogFilterContent({ initialProducts, dbCategories }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSubCategory, setActiveSubCategory] = useState('Todos');

  // Build categories from DB categories (preserves admin-managed order)
  // Always start with "Todos", then DB categories, and ensure "Gift Card" stays at the end
  const regularCats = dbCategories
    .map(c => c.name)
    .filter(name => name.toLowerCase() !== 'gift card');
  const categories = ['Todos', ...regularCats, 'Gift Card'];

  useEffect(() => {
    if (categoryParam) {
      const matched = categories.find(c => c.toLowerCase() === categoryParam.toLowerCase());
      if (matched) {
        setActiveCategory(matched);
        setActiveSubCategory('Todos');
      }
    }
  }, [categoryParam]);

  // Calculate available subcategories for the active category
  const availableSubCategories = ['Todos'];
  if (activeCategory !== 'Todos') {
    initialProducts.forEach(p => {
      if (p.category.toLowerCase() === activeCategory.toLowerCase() && p.subCategory) {
        if (!availableSubCategories.includes(p.subCategory)) {
          availableSubCategories.push(p.subCategory);
        }
      }
    });
  }

  // Filter products
  let filteredProducts = initialProducts.filter(p => {
    const matchCategory = activeCategory === 'Todos' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSubCategory = activeSubCategory === 'Todos' || p.subCategory === activeSubCategory;
    return matchCategory && matchSubCategory;
  });

  // When a specific category is selected, sort by categoryOrder (admin-configured)
  // When viewing 'Todos', keep the original createdAt desc order from the server
  if (activeCategory !== 'Todos') {
    filteredProducts = [...filteredProducts].sort((a, b) => (a.categoryOrder ?? 0) - (b.categoryOrder ?? 0));
  }

  return (
    <div className="catalog-filter-wrapper">
      <div className="filter-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-tab-btn ${activeCategory === cat ? 'active' : ''} ${cat.toLowerCase() === 'gift card' ? 'gift-card-tab' : ''}`}
            onClick={() => {
              setActiveCategory(cat);
              setActiveSubCategory('Todos'); // Reset subcategory when category changes
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeCategory !== 'Todos' && availableSubCategories.length > 1 && (
        <div className="subfilter-tabs">
          {availableSubCategories.map(subCat => (
            <button 
              key={subCat} 
              className={`subfilter-tab-btn ${activeSubCategory === subCat ? 'active' : ''}`}
              onClick={() => setActiveSubCategory(subCat)}
            >
              {subCat}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-catalog">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3>No hay productos</h3>
          <p>Aún no cargamos productos para esta selección.<br/>¡Volvé pronto!</p>
        </div>
      )}
    </div>
  );
}

export default function CatalogFilter({ initialProducts, dbCategories }) {
  return (
    <Suspense fallback={<div className="filter-loading">Cargando catálogo...</div>}>
      <CatalogFilterContent initialProducts={initialProducts} dbCategories={dbCategories} />
    </Suspense>
  );
}
