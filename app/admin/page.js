'use client';

import { useState, useEffect } from 'react';
import './admin.css';
import GiftCardVisual from '../../components/GiftCardVisual';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'giftcards'
  const [products, setProducts] = useState([]);
  const [giftcards, setGiftcards] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Reorder state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Product category filter state for admin
  const [productCategoryTab, setProductCategoryTab] = useState('TODOS');
  const [productSubCategoryFilter, setProductSubCategoryFilter] = useState('Todos');
  
  // Product state
  const [newProduct, setNewProduct] = useState({
    name: '',
    originalPrice: '',
    price: '',
    imageUrl: '',
    category: 'Mujer',
    subCategory: 'Remeras tops y musculosas',
    colors: '',
    sizes: ''
  });
  const [editingProductId, setEditingProductId] = useState(null);

  // Giftcard state
  const [newGiftcard, setNewGiftcard] = useState({
    amount: '',
    recipientName: '',
    message: ''
  });
  const [selectedGiftcard, setSelectedGiftcard] = useState(null);

  // Fetch data from API on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts(productCategoryTab);
      fetchGiftcards();
    }
  }, [isAuthenticated]);

  const fetchProducts = async (categoryTab) => {
    setLoading(true);
    try {
      const param = categoryTab && categoryTab !== 'TODOS' ? `?category=${categoryTab}` : '';
      const res = await fetch(`/api/products${param}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  };

  const fetchGiftcards = async () => {
    try {
      const res = await fetch('/api/giftcards');
      const data = await res.json();
      setGiftcards(data);
    } catch (err) {
      console.error('Error fetching giftcards:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '7cerofit') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
      setPasswordInput('');
    }
  };

  const handleCategoryTabChange = (tab) => {
    setProductCategoryTab(tab);
    setProductSubCategoryFilter('Todos');
    setHasUnsavedChanges(false);
    fetchProducts(tab);
  };

  // Reorder: swap product with its neighbor locally (without API call)
  const handleReorder = (productId, direction) => {
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;

    const newProducts = [...products];
    // Swap positions in the array
    [newProducts[idx], newProducts[targetIdx]] = [newProducts[targetIdx], newProducts[idx]];
    setProducts(newProducts);
    setHasUnsavedChanges(true);
  };

  // Save the current order to the database in bulk
  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = products.map((product, index) => ({
        id: product.id,
        categoryOrder: index,
      }));

      const res = await fetch('/api/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        setHasUnsavedChanges(false);
        alert('✅ Orden guardado exitosamente');
        // Re-fetch to sync with DB
        await fetchProducts(productCategoryTab);
      } else {
        alert('❌ Error al guardar el orden');
      }
    } catch (err) {
      console.error('Error saving order:', err);
      alert('❌ Error al guardar el orden');
    }
    setSavingOrder(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-wrapper container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2>Panel de Admin</h2>
          <p className="login-subtitle">Ingresá la contraseña para acceder</p>
          <div className="form-group">
            <input 
              type="password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              placeholder="Contraseña" 
              required
            />
          </div>
          <button type="submit" className="login-btn">Ingresar</button>
        </form>
      </div>
    );
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEditing = !!editingProductId;
      const endpoint = isEditing ? `/api/products/${editingProductId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          originalPrice: newProduct.originalPrice || null,
          price: newProduct.price,
          imageUrl: newProduct.imageUrl,
          category: newProduct.category,
          subCategory: newProduct.subCategory,
          colors: newProduct.colors,
          sizes: newProduct.sizes
        })
      });

      if (res.ok) {
        await fetchProducts(productCategoryTab);
        setShowAddForm(false);
        setEditingProductId(null);
        setNewProduct({
          name: '',
          originalPrice: '',
          price: '',
          imageUrl: '',
          category: 'Mujer',
          subCategory: 'Remeras tops y musculosas',
          colors: '',
          sizes: ''
        });
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error al guardar producto');
    }
    setLoading(false);
  };

  const handleEditProductClick = (product) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name || '',
      originalPrice: product.originalPrice || '',
      price: product.price || '',
      imageUrl: product.imageUrl || '',
      category: product.category || 'Mujer',
      subCategory: product.subCategory || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || ''
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts(productCategoryTab);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
    setLoading(false);
  };

  const handleCreateGiftcard = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/giftcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: newGiftcard.amount,
          recipientName: newGiftcard.recipientName,
          message: newGiftcard.message
        })
      });

      if (res.ok) {
        const createdCard = await res.json();
        await fetchGiftcards();
        setShowAddForm(false);
        setNewGiftcard({
          amount: '',
          recipientName: '',
          message: ''
        });
        setSelectedGiftcard(createdCard); // Mostrar el modal visual inmediatamente
      }
    } catch (err) {
      console.error('Error creating giftcard:', err);
      alert('Error al crear gift card');
    }
    setLoading(false);
  };

  const handleDeleteGiftcard = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta Gift Card? No se podrá usar el código.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/giftcards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchGiftcards();
      }
    } catch (err) {
      console.error('Error deleting giftcard:', err);
    }
    setLoading(false);
  };

  // Derive subcategories from current products list
  const availableSubCategories = ['Todos'];
  if (productCategoryTab !== 'TODOS') {
    products.forEach(p => {
      if (p.subCategory && !availableSubCategories.includes(p.subCategory)) {
        availableSubCategories.push(p.subCategory);
      }
    });
  }

  // Filter products by subcategory (category is already filtered by the API)
  const filteredProducts = productSubCategoryFilter === 'Todos'
    ? products
    : products.filter(p => p.subCategory === productSubCategoryFilter);

  const isCategoryView = productCategoryTab !== 'TODOS';
  const isSubFiltered = productSubCategoryFilter !== 'Todos';
  // Only allow reordering when viewing a full category (not a subcategory subset)
  const canReorder = isCategoryView && !isSubFiltered;

  return (
    <div className="admin-wrapper container">
      {selectedGiftcard && (
        <GiftCardVisual 
          code={selectedGiftcard.code}
          amount={selectedGiftcard.amount}
          recipientName={selectedGiftcard.recipientName}
          message={selectedGiftcard.message}
          onClose={() => setSelectedGiftcard(null)}
        />
      )}

      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h1>Panel de Administración</h1>
            <a href="/" className="view-btn" style={{ textDecoration: 'none', padding: '0.25rem 0.75rem' }}>
              Volver a la Tienda
            </a>
          </div>
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('products'); setShowAddForm(false); setEditingProductId(null); }}
            >
              📦 Productos ({products.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'giftcards' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('giftcards'); setShowAddForm(false); setEditingProductId(null); }}
            >
              🎁 Administrar Gift Cards ({giftcards.length})
            </button>
          </div>
        </div>
        <button className="add-btn" onClick={() => {
          if (showAddForm) {
            setShowAddForm(false);
            setEditingProductId(null);
          } else {
            setShowAddForm(true);
            setNewProduct({
              name: '',
              originalPrice: '',
              price: '',
              imageUrl: '',
              category: 'Mujer',
              subCategory: 'Remeras tops y musculosas',
              colors: '',
              sizes: ''
            });
          }
        }}>
          {showAddForm ? '✕ Cancelar' : (activeTab === 'products' ? '+ Agregar Producto' : '+ Generar Gift Card')}
        </button>
      </div>

      {showAddForm && activeTab === 'products' && (
        <form className="admin-form" onSubmit={handleAddProduct}>
          <h2>{editingProductId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del Producto</label>
              <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ej: Calza Active" />
            </div>
            
            <div className="form-group">
              <label>Precio Actual</label>
              <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="Ej: 25000" />
            </div>
            
            <div className="form-group">
              <label>Precio Original (Opcional, para oferta)</label>
              <input type="number" value={newProduct.originalPrice} onChange={e => setNewProduct({...newProduct, originalPrice: e.target.value})} placeholder="Ej: 31250" />
            </div>
            
            <div className="form-group">
              <label>Categoría</label>
              <select value={newProduct.category} onChange={e => {
                const newCat = e.target.value;
                let defaultSub = '';
                if (newCat === 'Mujer') defaultSub = 'Remeras tops y musculosas';
                else if (newCat === 'Hombre') defaultSub = 'Remeras musculosa y chombas';
                else if (newCat === 'Unisex') defaultSub = 'Accesorios';
                setNewProduct({...newProduct, category: newCat, subCategory: defaultSub});
              }}>
                <option>Mujer</option>
                <option>Hombre</option>
                <option>Unisex</option>
                <option>Gift Card</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Subcategoría</label>
              <select 
                value={newProduct.subCategory} 
                onChange={e => setNewProduct({...newProduct, subCategory: e.target.value})}
                disabled={!newProduct.category || newProduct.category === 'Gift Card'}
              >
                {newProduct.category === 'Mujer' && (
                  <>
                    <option value="Remeras tops y musculosas">Remeras tops y musculosas</option>
                    <option value="Calzas y pantalones">Calzas y pantalones</option>
                    <option value="Buzos camperas y abrigos">Buzos camperas y abrigos</option>
                    <option value="Polleras y shorts">Polleras y shorts</option>
                  </>
                )}
                {newProduct.category === 'Hombre' && (
                  <>
                    <option value="Remeras musculosa y chombas">Remeras musculosa y chombas</option>
                    <option value="Buzos camperas y abrigos">Buzos camperas y abrigos</option>
                    <option value="Pantalones y short">Pantalones y short</option>
                  </>
                )}
                {newProduct.category === 'Unisex' && (
                  <>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Gorras">Gorras</option>
                  </>
                )}
                {newProduct.category === 'Gift Card' && (
                  <option value="">No aplica</option>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label>Colores (separados por coma)</label>
              <input type="text" required value={newProduct.colors} onChange={e => setNewProduct({...newProduct, colors: e.target.value})} placeholder="Ej: Negro, Azul, Chocolate" />
            </div>
            
            <div className="form-group">
              <label>Talles (separados por coma)</label>
              <input type="text" required value={newProduct.sizes} onChange={e => setNewProduct({...newProduct, sizes: e.target.value})} placeholder="Ej: S, M, L, XL" />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Imagen del Producto</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setLoading(true);
                    try {
                      const formData = new FormData();
                      formData.append('file', file);
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      if (res.ok) {
                        const data = await res.json();
                        setNewProduct({...newProduct, imageUrl: data.url});
                      } else {
                        alert('Error al subir la imagen');
                      }
                    } catch(err) {
                      console.error(err);
                      alert('Error al subir la imagen');
                    }
                    setLoading(false);
                  }}
                />
                {newProduct.imageUrl && (
                  <img src={newProduct.imageUrl} alt="Preview" style={{ height: '50px', borderRadius: '4px' }} />
                )}
              </div>
              <small style={{ color: 'var(--text-secondary)' }}>O podés pegar una URL directamente:</small>
              <input type="text" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="Ej: https://..." />
            </div>
          </div>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Guardando...' : (editingProductId ? 'Guardar Cambios' : 'Guardar Producto')}
          </button>
        </form>
      )}

      {showAddForm && activeTab === 'giftcards' && (
        <form className="admin-form" onSubmit={handleCreateGiftcard}>
          <h2>Crear Nueva Gift Card</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Monto de la Gift Card ($)</label>
              <input type="number" required value={newGiftcard.amount} onChange={e => setNewGiftcard({...newGiftcard, amount: e.target.value})} placeholder="Ej: 50000" />
            </div>
            
            <div className="form-group">
              <label>Nombre del Destinatario (Opcional)</label>
              <input type="text" value={newGiftcard.recipientName} onChange={e => setNewGiftcard({...newGiftcard, recipientName: e.target.value})} placeholder="Ej: María" />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mensaje Dedicatoria (Opcional)</label>
              <input type="text" value={newGiftcard.message} onChange={e => setNewGiftcard({...newGiftcard, message: e.target.value})} placeholder="Ej: ¡Feliz cumple! Disfrutalo." />
            </div>
          </div>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Generando...' : 'Generar Gift Card'}
          </button>
        </form>
      )}

      {/* Floating save order button */}
      {hasUnsavedChanges && activeTab === 'products' && canReorder && (
        <div className="save-order-bar">
          <div className="save-order-bar-inner">
            <span className="save-order-text">⚠️ Tenés cambios de orden sin guardar</span>
            <button
              className="save-order-btn"
              onClick={handleSaveOrder}
              disabled={savingOrder}
            >
              {savingOrder ? 'Guardando...' : '💾 Guardar Cambios de Orden'}
            </button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {activeTab === 'products' ? (
          <>
            <h2>Productos Actuales</h2>

            {/* Category filter tabs */}
            <div className="product-category-tabs">
              {['TODOS', 'HOMBRE', 'MUJER', 'UNISEX'].map(tab => (
                <button
                  key={tab}
                  id={`product-tab-${tab.toLowerCase()}`}
                  className={`product-category-tab ${productCategoryTab === tab ? 'active' : ''}`}
                  onClick={() => handleCategoryTabChange(tab)}
                >
                  {tab === 'TODOS' && '🏷️ '}
                  {tab === 'HOMBRE' && '👔 '}
                  {tab === 'MUJER' && '👗 '}
                  {tab === 'UNISEX' && '🧢 '}
                  {tab}
                </button>
              ))}
            </div>

            {/* Subcategory chips — only visible in category views */}
            {isCategoryView && availableSubCategories.length > 1 && (
              <div className="subcategory-chips">
                {availableSubCategories.map(sub => (
                  <button
                    key={sub}
                    className={`subcategory-chip ${productSubCategoryFilter === sub ? 'active' : ''}`}
                    onClick={() => setProductSubCategoryFilter(sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {loading && <div className="admin-loading">Cargando...</div>}
            {filteredProducts.length === 0 && !loading ? (
              <div className="admin-empty">
                <p>No hay productos cargados todavía.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Categoría</th>
                      <th>Talles</th>
                      {canReorder && <th>Orden</th>}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, idx) => (
                      <tr key={product.id}>
                        <td>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="admin-thumb" />
                          ) : (
                            <div className="admin-thumb-placeholder">Sin img</div>
                          )}
                        </td>
                        <td><strong>{product.name}</strong></td>
                        <td>
                          ${product.price?.toLocaleString('es-AR')}
                          {product.originalPrice && <span className="admin-strike"> ${product.originalPrice.toLocaleString('es-AR')}</span>}
                        </td>
                        <td>{product.category}{product.subCategory ? ` > ${product.subCategory}` : ''}</td>
                        <td>{Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes}</td>
                        {canReorder && (
                          <td className="order-cell">
                            <button
                              className="reorder-btn"
                              disabled={idx === 0}
                              onClick={() => handleReorder(product.id, 'up')}
                              title="Subir"
                            >
                              ▲
                            </button>
                            <button
                              className="reorder-btn"
                              disabled={idx === filteredProducts.length - 1}
                              onClick={() => handleReorder(product.id, 'down')}
                              title="Bajar"
                            >
                              ▼
                            </button>
                          </td>
                        )}
                        <td>
                          <div className="action-cell">
                            <button className="action-icon-btn edit-icon-btn" onClick={() => handleEditProductClick(product)} title="Editar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="action-icon-btn delete-icon-btn" onClick={() => handleDeleteProduct(product.id)} title="Borrar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h2>Gift Cards Generadas</h2>
            {loading && <div className="admin-loading">Cargando...</div>}
            {giftcards.length === 0 && !loading ? (
              <div className="admin-empty">
                <p>No hay Gift Cards generadas todavía.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Código</th>
                      <th>Destinatario</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftcards.map(card => (
                      <tr key={card.id}>
                        <td>{new Date(card.createdAt).toLocaleDateString('es-AR')}</td>
                        <td><strong>${card.amount.toLocaleString('es-AR')}</strong></td>
                        <td style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{card.code}</td>
                        <td>{card.recipientName || '-'}</td>
                        <td>
                          <div className="action-cell">
                            <button className="action-icon-btn view-icon-btn" onClick={() => setSelectedGiftcard(card)} title="Ver / Descargar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button className="action-icon-btn delete-icon-btn" onClick={() => handleDeleteGiftcard(card.id)} title="Borrar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
