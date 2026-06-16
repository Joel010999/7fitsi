'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

function CatalogFilterContent({ initialProducts }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSubCategory, setActiveSubCategory] = useState('Todos');

  const categories = ['Todos', 'Mujer', 'Hombre', 'Unisex', 'Gift Card'];

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
  const filteredProducts = initialProducts.filter(p => {
    const matchCategory = activeCategory === 'Todos' || p.category.toLowerCase() === activeCategory.toLowerCase() || (activeCategory === 'Gift Card' && p.category.toLowerCase() === 'gift card');
    const matchSubCategory = activeSubCategory === 'Todos' || p.subCategory === activeSubCategory;
    return matchCategory && matchSubCategory;
  });

  return (
    <div className="catalog-filter-wrapper">
      <div className="filter-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-tab-btn ${activeCategory === cat ? 'active' : ''}`}
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

export default function CatalogFilter({ initialProducts }) {
  return (
    <Suspense fallback={<div className="filter-loading">Cargando catálogo...</div>}>
      <CatalogFilterContent initialProducts={initialProducts} />
    </Suspense>
  );
}
