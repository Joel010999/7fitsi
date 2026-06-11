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
      fetchProducts();
      fetchGiftcards();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
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
      const res = await fetch('/api/products', {
        method: 'POST',
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
        await fetchProducts();
        setShowAddForm(false);
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
      console.error('Error adding product:', err);
      alert('Error al agregar producto');
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts();
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
          <h1>Panel de Administración</h1>
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('products'); setShowAddForm(false); }}
            >
              Productos ({products.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'giftcards' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('giftcards'); setShowAddForm(false); }}
            >
              Gift Cards ({giftcards.length})
            </button>
          </div>
        </div>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Cancelar' : (activeTab === 'products' ? '+ Agregar Producto' : '+ Crear Gift Card')}
        </button>
      </div>

      {showAddForm && activeTab === 'products' && (
        <form className="admin-form" onSubmit={handleAddProduct}>
          <h2>Nuevo Producto</h2>
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
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option>Mujer</option>
                <option>Hombre</option>
                <option>Unisex</option>
                <option>Gift Card</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Subcategoría</label>
              <input type="text" value={newProduct.subCategory} onChange={e => setNewProduct({...newProduct, subCategory: e.target.value})} placeholder="Ej: Calzas y pantalones" />
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
              <label>URL de la Imagen</label>
              <input type="text" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="Ej: https://... o /images/foto1.jpg" />
            </div>
          </div>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Producto'}
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

      <div className="admin-list">
        {activeTab === 'products' ? (
          <>
            <h2>Productos Actuales</h2>
            {loading && <div className="admin-loading">Cargando...</div>}
            {products.length === 0 && !loading ? (
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
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
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
                        <td>
                          <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>Borrar</button>
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
                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="view-btn" onClick={() => setSelectedGiftcard(card)}>Ver / Descargar</button>
                          <button className="delete-btn" onClick={() => handleDeleteGiftcard(card.id)}>Borrar</button>
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
