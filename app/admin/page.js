'use client';

import { useState, useEffect, useMemo } from 'react';
import './admin.css';
import GiftCardVisual from '../../components/GiftCardVisual';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'giftcards'
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [giftcards, setGiftcards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState((new Date().getMonth() + 1).toString());
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

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
    listPrice: '',
    price: '',
    imageUrl: '',
    images: [],
    category: 'Mujer',
    subCategory: 'Remeras tops y musculosas',
    variants: [],
    description: ''
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);

  // POS States
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [posCatalog, setPosCatalog] = useState([]);
  const [posItems, setPosItems] = useState([]);
  const [posSelectedProductId, setPosSelectedProductId] = useState('');
  const [posSelectedSize, setPosSelectedSize] = useState('');
  const [posSelectedColor, setPosSelectedColor] = useState('');
  const [posQuantity, setPosQuantity] = useState(1);
  const [posSearchTerm, setPosSearchTerm] = useState('');
  const [posShowDropdown, setPosShowDropdown] = useState(false);
  const [posPriceType, setPosPriceType] = useState('cash');

  // Variant Builder Temporary States
  const [newVariantSize, setNewVariantSize] = useState('M');
  const [newVariantColor, setNewVariantColor] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('');

  // Available sizes
  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

  // Color management
  const DEFAULT_COLORS = ['Negro', 'Rojo', 'Amarillo', 'Azul', 'Chocolate'];
  const [customColorOptions, setCustomColorOptions] = useState([]);
  const allColorOptions = [...DEFAULT_COLORS, ...customColorOptions];

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
      fetchCategories();
      fetchProducts(productCategoryTab);
      fetchAllProducts();
      fetchGiftcards();
    }
  }, [isAuthenticated]);

  // Derive subcategories for the product form dropdown (from ALL products, filtered by form category)
  const formSubCategories = useMemo(() => {
    const selectedCat = (newProduct.category || '').toLowerCase();
    if (!selectedCat || selectedCat === 'gift card') return [];
    const safeAll = Array.isArray(allProducts) ? allProducts : [];
    const subs = new Set();
    safeAll.forEach(p => {
      if ((p?.category || '').toLowerCase() === selectedCat && p?.subCategory) {
        subs.add(p.subCategory);
      }
    });
    return [...subs];
  }, [allProducts, newProduct.category]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      alert('Ingresá un nombre para la sección.');
      return;
    }
    setSavingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await fetchCategories();
        setNewCategoryName('');
        setShowCategoryModal(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al crear la sección');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      alert('Error al crear la sección');
    }
    setSavingCategory(false);
  };

  const fetchProducts = async (categoryTab) => {
    setLoading(true);
    try {
      const param = categoryTab && categoryTab !== 'TODOS' ? `?category=${categoryTab}` : '';
      const res = await fetch(`/api/products${param}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching all products:', err);
    }
  };

  const fetchGiftcards = async () => {
    try {
      const res = await fetch('/api/giftcards');
      const data = await res.json();
      setGiftcards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching giftcards:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput.trim() === '7cerofit') {
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

  // Delete a category from the database and unlink its products
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoryName}" y desvincular sus productos?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?id=${categoryId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
        // If we were viewing the deleted category, fall back to TODOS
        if (productCategoryTab === categoryName.toUpperCase()) {
          setProductCategoryTab('TODOS');
          setProductSubCategoryFilter('Todos');
          await fetchProducts('TODOS');
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la categoría');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Error al eliminar la categoría');
    }
    setLoading(false);
  };

  // Delete a subcategory: clear the subCategory field on all matching products in the DB
  const handleDeleteSubCategory = async (subCategoryName) => {
    // Derive the actual category name from the current tab (tabs are uppercased)
    const actualCategory = categories.find(c => (c.name || '').toUpperCase() === productCategoryTab);
    if (!actualCategory) return;

    if (!confirm(`¿Estás seguro de eliminar la subcategoría "${subCategoryName}" de ${actualCategory.name}? Los productos de esta subcategoría quedarán sin subcategoría asignada.`)) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/subcategory?category=${encodeURIComponent(actualCategory.name)}&subCategory=${encodeURIComponent(subCategoryName)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setProductSubCategoryFilter('Todos');
        await fetchProducts(productCategoryTab);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la subcategoría');
      }
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      alert('Error al eliminar la subcategoría');
    }
    setLoading(false);
  };

  // Reorder: swap product with its neighbor locally (without API call)
  const handleReorder = (productId, direction) => {
    const safeProducts = Array.isArray(products) ? products : [];
    const idx = safeProducts.findIndex(p => p.id === productId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= safeProducts.length) return;

    const newProducts = [...safeProducts];
    // Swap positions in the array
    [newProducts[idx], newProducts[targetIdx]] = [newProducts[targetIdx], newProducts[idx]];
    setProducts(newProducts);
    setHasUnsavedChanges(true);
  };

  // Save the current order to the database in bulk
  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = (Array.isArray(products) ? products : []).map((product, index) => ({
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
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="login-logo-container">
            <img src="/7cerosports.png" alt="7Cero Sports" className="login-logo" />
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

    if (!newProduct.variants || newProduct.variants.length === 0) {
      alert('Por favor, agregá al menos una variante (Talle + Color + Stock).');
      return;
    }

    setLoading(true);

    try {
      const isEditing = !!editingProductId;
      const endpoint = isEditing ? `/api/products/${editingProductId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const firstImage = newProduct.images && newProduct.images.length > 0 ? newProduct.images[0] : newProduct.imageUrl;

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          originalPrice: newProduct.originalPrice || null,
          listPrice: newProduct.listPrice || null,
          price: newProduct.price,
          imageUrl: firstImage,
          images: newProduct.images || [],
          category: newProduct.category,
          subCategory: newProduct.subCategory,
          variants: newProduct.variants,
          description: newProduct.description,
        })
      });

      if (res.ok) {
        await fetchProducts(productCategoryTab);
        await fetchAllProducts();
        setShowAddForm(false);
        setEditingProductId(null);
        setIsCustomSubCategory(false);
        setNewProduct({
          name: '',
          originalPrice: '',
          listPrice: '',
          price: '',
          imageUrl: '',
          images: [],
          category: 'Mujer',
          subCategory: 'Remeras tops y musculosas',
          variants: [],
          description: '',
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al guardar producto: ${errData.error || res.statusText || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error al guardar producto');
    }
    setLoading(false);
  };

  const handleEditProductClick = (product) => {
    setEditingProductId(product.id);

    let parsedVariants = [];
    if (product.variants) {
      try {
        parsedVariants = JSON.parse(product.variants);
      } catch (err) {
        console.error('Error parsing product variants:', err);
      }
    }

    if (Array.isArray(parsedVariants)) {
      const variantColors = parsedVariants.map(v => v.color).filter(Boolean);
      const extraColors = variantColors.filter(c => !DEFAULT_COLORS.includes(c) && !customColorOptions.includes(c));
      if (extraColors.length > 0) {
        setCustomColorOptions(prev => [...prev, ...extraColors]);
      }
    }

    const sub = product.subCategory || '';
    const cat = product.category || '';
    // Dynamically check if this subcategory already exists for this category
    const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];
    const knownSubs = safeAllProducts
      .filter(p => (p.category || '').toLowerCase() === cat.toLowerCase())
      .map(p => p.subCategory)
      .filter(Boolean);
    const isKnown = sub === '' || knownSubs.includes(sub);
    setIsCustomSubCategory(!isKnown);

    let parsedImages = [];
    if (product.images) {
      try {
        parsedImages = JSON.parse(product.images);
      } catch (err) {
        console.error('Error parsing product images:', err);
      }
    }
    if ((!parsedImages || parsedImages.length === 0) && product.imageUrl) {
      parsedImages = [product.imageUrl];
    }

    setNewProduct({
      name: product.name || '',
      originalPrice: product.originalPrice || '',
      listPrice: product.listPrice || '',
      price: product.price || '',
      imageUrl: product.imageUrl || '',
      images: parsedImages,
      category: product.category || (categories.length > 0 ? categories[0].name : ''),
      subCategory: product.subCategory || '',
      variants: parsedVariants,
      description: product.description || '',
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setNewProduct(prev => ({
          ...prev,
          images: [...(prev.images || []), data.url]
        }));
      } else {
        alert('Error al subir la imagen');
      }
    } catch (err) {
      console.error(err);
      alert('Error al subir la imagen');
    }
    setLoading(false);
  };

  const handleAddVariant = () => {
    const size = newVariantSize.trim();
    const color = newVariantColor.trim();
    const stock = parseInt(newVariantStock);

    if (!size) {
      alert('Por favor seleccioná un talle.');
      return;
    }
    if (!color) {
      alert('Por favor ingresá un color.');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      alert('Por favor ingresá un stock válido (0 o mayor).');
      return;
    }

    const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);

    const isDuplicate = (newProduct.variants || []).some(
      v => v.size.toUpperCase() === size.toUpperCase() && v.color.toLowerCase() === capitalizedColor.toLowerCase()
    );

    if (isDuplicate) {
      alert(`La variante para talle ${size} y color ${capitalizedColor} ya existe.`);
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { size, color: capitalizedColor, stock }]
    }));

    if (!allColorOptions.some(c => c.toLowerCase() === capitalizedColor.toLowerCase())) {
      setCustomColorOptions(prev => [...prev, capitalizedColor]);
    }

    setNewVariantColor('');
    setNewVariantStock('');
  };

  const handleRemoveVariant = (index) => {
    setNewProduct(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts(productCategoryTab);
        await fetchAllProducts();
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

  const handleExportStock = async () => {
    setLoading(true);
    try {
      const productsRes = await fetch('/api/products');
      if (!productsRes.ok) {
        throw new Error('No se pudo obtener el inventario de productos.');
      }
      const productsList = await productsRes.json();

      const XLSX = await import('xlsx');

      const stockRows = [];
      (Array.isArray(productsList) ? productsList : []).forEach(p => {
        let variants = [];
        try {
          variants = JSON.parse(p.variants || '[]');
        } catch (e) {
          variants = [];
        }
        variants.forEach(v => {
          stockRows.push({
            name: p.name || '',
            color: v.color || '',
            size: v.size || '',
            stock: parseInt(v.stock) || 0
          });
        });
      });

      const sheetData = [];
      sheetData.push(["7CERO SPORTS - INVENTARIO DE STOCK"]);
      sheetData.push([]);
      sheetData.push([
        "Producto", "Color", "Talle", "Cantidad en Stock"
      ]);

      stockRows.forEach(s => {
        sheetData.push([
          s.name, s.color, s.size, s.stock
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wscols = sheetData[2].map((_, colIdx) => {
        let maxLen = 10;
        sheetData.forEach(row => {
          const val = row[colIdx];
          if (val !== undefined && val !== null) {
            const str = val.toString();
            if (str.length > maxLen) {
              maxLen = str.length;
            }
          }
        });
        return { wch: maxLen + 2 };
      });
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stock");

      const dateStr = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
      XLSX.writeFile(wb, `7cero_Inventario_${dateStr}.xlsx`);

      alert('✅ Excel de inventario exportado con éxito.');
    } catch (err) {
      console.error('Error exporting Stock Excel:', err);
      alert(`❌ Error al exportar Stock: ${err.message || 'Error desconocido'}`);
    }
    setLoading(false);
  };

  const handleExportSalesByMonth = async () => {
    setLoading(true);
    try {
      const salesRes = await fetch(`/api/sales?month=${exportMonth}&year=${exportYear}`);
      if (!salesRes.ok) {
        throw new Error('No se pudo obtener el historial de ventas para ese mes.');
      }
      const sales = await salesRes.json();

      if (sales.length === 0) {
        alert(`No hay ventas registradas en el mes seleccionado (${exportMonth}/${exportYear}).`);
        setLoading(false);
        return;
      }

      const XLSX = await import('xlsx');

      const salesRows = sales.map(s => ({
        name: s.productName || '',
        color: s.color || '',
        size: s.size || '',
        quantity: parseInt(s.quantity) || 0,
        date: new Date(s.createdAt).toLocaleDateString('es-AR'),
        priceType: s.priceType || 'Efectivo',
        totalPrice: parseFloat(s.totalPrice) || 0
      }));

      const sheetData = [];
      sheetData.push([`7CERO SPORTS - VENTAS (${exportMonth}/${exportYear})`]);
      sheetData.push([]);
      sheetData.push([
        "Producto Vendido", "Color", "Talle", "Cantidad", "Fecha de Venta", "Tipo de Cobro", "Precio Total"
      ]);

      salesRows.forEach(sa => {
        sheetData.push([
          sa.name, sa.color, sa.size, sa.quantity, sa.date, sa.priceType, sa.totalPrice
        ]);
      });

      const totalRowIndex = sheetData.length + 1;
      sheetData.push([
        "TOTALES", "", "", 0, "", "", 0
      ]);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      ws[`D${totalRowIndex}`] = { t: 'n', f: `SUM(D4:D${totalRowIndex - 1})` };
      ws[`G${totalRowIndex}`] = { t: 'n', f: `SUM(G4:G${totalRowIndex - 1})` };

      const wscols = sheetData[2].map((_, colIdx) => {
        let maxLen = 10;
        sheetData.forEach(row => {
          const val = row[colIdx];
          if (val !== undefined && val !== null) {
            const str = val.toString();
            if (str.length > maxLen) {
              maxLen = str.length;
            }
          }
        });
        return { wch: maxLen + 2 };
      });
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ventas");

      XLSX.writeFile(wb, `7cero_Ventas_${exportMonth}_${exportYear}.xlsx`);

      alert('✅ Excel de ventas exportado con éxito.');
    } catch (err) {
      console.error('Error exporting Sales Excel:', err);
      alert(`❌ Error al exportar Ventas: ${err.message || 'Error desconocido'}`);
    }
    setLoading(false);
  };

  // POS Functions
  const fetchPOSCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setPosCatalog(data);
    } catch (err) {
      console.error('Error fetching POS catalog:', err);
    }
    setLoading(false);
  };

  const handleAddToPOS = () => {
    if (!posSelectedProductId || !posSelectedSize || !posSelectedColor) return;

    // Determine unit price based on selected price type
    let unitPrice = posSelectedProduct.price;
    if (posPriceType === 'list' && posSelectedProduct.listPrice) {
      unitPrice = posSelectedProduct.listPrice;
    }

    const qty = parseInt(posQuantity, 10) || 1;

    const existingIndex = posItems.findIndex(
      item => item.productId === posSelectedProductId && item.size === posSelectedSize && item.color === posSelectedColor && item.priceType === posPriceType
    );

    if (existingIndex !== -1) {
      const newQty = posItems[existingIndex].quantity + qty;
      if (newQty > posMaxStock) {
        alert(`No podés agregar más de ${posMaxStock} unidades en total para esta combinación.`);
        return;
      }
      const updated = [...posItems];
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = newQty * updated[existingIndex].price;
      setPosItems(updated);
    } else {
      setPosItems([
        ...posItems,
        {
          productId: posSelectedProductId,
          name: posSelectedProduct.name,
          size: posSelectedSize,
          color: posSelectedColor,
          quantity: qty,
          price: unitPrice,
          priceType: posPriceType,
          subtotal: qty * unitPrice
        }
      ]);
    }

    setPosSelectedProductId('');
    setPosSelectedSize('');
    setPosSelectedColor('');
    setPosQuantity(1);
    setPosSearchTerm('');
    setPosPriceType('cash');
  };

  const handleRemoveFromPOS = (idx) => {
    setPosItems(posItems.filter((_, i) => i !== idx));
  };

  const handleProcessSale = async () => {
    if (posItems.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: posItems.map(item => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            priceType: item.priceType,
            totalPrice: item.subtotal
          }))
        })
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        // Dynamic import to prevent compilation error of window is not defined
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('7CERO SPORTS', 15, 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('RECIBO DE COMPRA — VENTA INTERNA POS', 15, 26);

        doc.setFontSize(9);
        const fecha = new Date();
        doc.text(`Fecha: ${fecha.toLocaleDateString('es-AR')}`, 140, 15);
        doc.text(`Hora: ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`, 140, 21);
        doc.text(`Nro Recibo: POS-${Date.now().toString().slice(-6)}`, 140, 27);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalle de Artículos:', 15, 52);

        const tableBody = posItems.map(item => [
          item.name,
          item.size,
          item.color,
          item.quantity.toString(),
          `$${item.price.toLocaleString('es-AR')}`,
          `$${item.subtotal.toLocaleString('es-AR')}`
        ]);

        autoTable(doc, {
          startY: 56,
          head: [['Prenda', 'Talle', 'Color', 'Cantidad', 'Precio Unit.', 'Subtotal']],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30 },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 30, halign: 'right' }
          },
          styles: {
            font: 'helvetica',
            fontSize: 10
          }
        });

        const finalY = doc.lastAutoTable.finalY + 12;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL FACTURADO: $${posTotalAmount.toLocaleString('es-AR')}`, 120, finalY);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('¡Gracias por tu compra en 7Cero Sports!', 15, finalY + 20);
        doc.text('Este documento sirve como comprobante de entrega y compra.', 15, finalY + 25);

        doc.save(`Recibo_7Cero_POS_${Date.now()}.pdf`);

        alert('✅ Venta procesada con éxito y recibo emitido.');
        setPosItems([]);
        setShowPOSModal(false);
        await fetchProducts(productCategoryTab);
      } else {
        alert(`❌ Error al procesar venta: ${resData.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Ocurrió un error inesperado al procesar la venta.');
    }
    setLoading(false);
  };

  // Derive subcategories from current products list (for the product list filter chips)
  const safeProducts = Array.isArray(products) ? products : [];
  const availableSubCategories = ['Todos'];
  if (productCategoryTab !== 'TODOS') {
    safeProducts.forEach(p => {
      if (p?.subCategory && !availableSubCategories.includes(p.subCategory)) {
        availableSubCategories.push(p.subCategory);
      }
    });
  }



  // Filter products by subcategory (category is already filtered by the API)
  const filteredProducts = productSubCategoryFilter === 'Todos'
    ? safeProducts
    : safeProducts.filter(p => p?.subCategory === productSubCategoryFilter);

  const isCategoryView = productCategoryTab !== 'TODOS';
  const isSubFiltered = productSubCategoryFilter !== 'Todos';
  // Only allow reordering when viewing a full category (not a subcategory subset)
  const canReorder = isCategoryView && !isSubFiltered;

  // POS Derived Values
  const posSelectedProduct = (Array.isArray(posCatalog) ? posCatalog : []).find(p => p?.id === posSelectedProductId);
  const posProductVariants = posSelectedProduct ? (() => {
    try {
      return JSON.parse(posSelectedProduct.variants || '[]');
    } catch (e) {
      return [];
    }
  })() : [];
  const posAvailableSizes = Array.from(new Set(
    (posProductVariants || []).filter(v => v.stock > 0).map(v => v.size)
  ));
  const posAvailableColors = (posProductVariants || [])
    .filter(v => v.size === posSelectedSize && v.stock > 0)
    .map(v => v.color);
  const posSelectedVariant = (posProductVariants || []).find(
    v => v.size === posSelectedSize && v.color === posSelectedColor
  );
  const posMaxStock = posSelectedVariant ? posSelectedVariant.stock : 0;
  const posTotalAmount = (Array.isArray(posItems) ? posItems : []).reduce((acc, item) => acc + (item.subtotal || 0), 0);

  // POS Search Filtered Catalog
  const posFilteredCatalog = (Array.isArray(posCatalog) ? posCatalog : []).filter(p =>
    (p?.name || '').toLowerCase().includes((posSearchTerm || '').toLowerCase()) ||
    (p?.category || '').toLowerCase().includes((posSearchTerm || '').toLowerCase())
  );

  // POS Current Unit Price (derived from price type)
  const posCurrentUnitPrice = posSelectedProduct
    ? (posPriceType === 'list' && posSelectedProduct.listPrice
        ? posSelectedProduct.listPrice
        : posSelectedProduct.price)
    : 0;

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

      <div className="admin-header" style={{ flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
        {/* Title */}
        <h1 style={{ textAlign: 'center', margin: '0 auto', fontSize: '1.8rem', width: '100%' }}>
          Panel de Administración
        </h1>

        {/* Row 1: Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          {activeTab === 'products' && (
            <>
              <button
                className="add-btn"
                style={{ background: 'transparent', border: '1px solid #22c55e', color: '#22c55e' }}
                onClick={() => setIsExportModalOpen(true)}
              >
                📊 Exportar
              </button>
              <button
                className="add-btn"
                style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6' }}
                onClick={() => { setShowPOSModal(true); fetchPOSCatalog(); }}
              >
                🛒 Registrar Venta
              </button>
              <button className="add-btn" style={{ background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }} onClick={() => setShowCategoryModal(true)}>
                + Agregar Sección
              </button>
            </>
          )}
          <button className="add-btn" onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingProductId(null);
              setIsCustomSubCategory(false);
            } else {
              setShowAddForm(true);
              setIsCustomSubCategory(false);
              setNewProduct({
                name: '',
                originalPrice: '',
                price: '',
                imageUrl: '',
                images: [],
                category: categories.length > 0 ? categories[0].name : '',
                subCategory: '',
                variants: [],
                description: '',
              });
            }
          }}>
            {showAddForm ? '✕ Cancelar' : (activeTab === 'products' ? '+ Agregar Producto' : '+ Generar Gift Card')}
          </button>
        </div>

        {/* Row 2: Tabs (Navegación) */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div className="admin-tabs" style={{ marginTop: 0 }}>
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => { setActiveTab('products'); setShowAddForm(false); setEditingProductId(null); setIsCustomSubCategory(false); }}
            >
              📦 Productos ({products.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'giftcards' ? 'active' : ''}`}
              onClick={() => { setActiveTab('giftcards'); setShowAddForm(false); setEditingProductId(null); setIsCustomSubCategory(false); }}
            >
              🎁 Administrar Gift Cards ({giftcards.length})
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="category-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="category-modal" onClick={e => e.stopPropagation()}>
            <h3>Nueva Sección</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Creá una nueva categoría/sección para tu tienda.
            </p>
            <div className="form-group">
              <label>Nombre de la Sección</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Ej: Niños, Accesorios, Outlet..."
                onKeyDown={e => { if (e.key === 'Enter') handleCreateCategory(); }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                className="save-btn"
                style={{ flex: 1 }}
                onClick={handleCreateCategory}
                disabled={savingCategory}
              >
                {savingCategory ? 'Guardando...' : 'Guardar Sección'}
              </button>
              <button
                className="add-btn"
                style={{ flex: 0, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
                onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="category-modal-overlay" onClick={() => setIsExportModalOpen(false)}>
          <div className="category-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>📊 Exportar Datos</h3>
              <button type="button" className="pos-close-btn" onClick={() => setIsExportModalOpen(false)}>✕</button>
            </div>
            
            <div className="export-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>A) Inventario</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Descargá el stock actual de todos tus productos y sus variantes.
              </p>
              <button className="add-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleExportStock} disabled={loading}>
                📦 Descargar Stock Actual
              </button>
            </div>

            <div className="export-section">
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>B) Historial de Ventas</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Seleccioná el mes y año para exportar las ventas de ese período.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <select style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} value={exportMonth} onChange={e => setExportMonth(e.target.value)}>
                  <option value="1">Enero</option>
                  <option value="2">Febrero</option>
                  <option value="3">Marzo</option>
                  <option value="4">Abril</option>
                  <option value="5">Mayo</option>
                  <option value="6">Junio</option>
                  <option value="7">Julio</option>
                  <option value="8">Agosto</option>
                  <option value="9">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
                <select style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} value={exportYear} onChange={e => setExportYear(e.target.value)}>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>
              <button className="add-btn" style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleExportSalesByMonth} disabled={loading}>
                💰 Exportar Ventas del Mes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Modal */}
      {showPOSModal && (
        <div className="pos-modal-overlay" onClick={() => {
          setShowPOSModal(false);
          setPosItems([]);
        }}>
          <div className="pos-modal" onClick={e => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h2>🛒 Punto de Venta (POS)</h2>
              <button type="button" className="pos-close-btn" onClick={() => { setShowPOSModal(false); setPosItems([]); }}>✕</button>
            </div>

            <div className="pos-modal-content">
              {/* Add item section */}
              <div className="pos-builder-card">
                <h3>Agregar Artículo</h3>

                {/* Interactive Product Search */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Buscar Producto</label>
                  {posSelectedProductId && posSelectedProduct ? (
                    <div className="pos-selected-product">
                      <span className="pos-selected-name">{posSelectedProduct.name}</span>
                      <span className="pos-selected-category">[{posSelectedProduct.category}]</span>
                      <button
                        type="button"
                        className="pos-clear-search"
                        onClick={() => {
                          setPosSelectedProductId('');
                          setPosSelectedSize('');
                          setPosSelectedColor('');
                          setPosQuantity(1);
                          setPosSearchTerm('');
                          setPosPriceType('cash');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Escribí el nombre del producto..."
                        value={posSearchTerm}
                        onChange={e => {
                          setPosSearchTerm(e.target.value);
                          setPosShowDropdown(true);
                        }}
                        onFocus={() => setPosShowDropdown(true)}
                      />
                      {posShowDropdown && posSearchTerm.length > 0 && (
                        <div className="pos-search-dropdown">
                          {posFilteredCatalog.length === 0 ? (
                            <div className="pos-search-empty">No se encontraron productos</div>
                          ) : (
                            posFilteredCatalog.map(p => (
                              <div
                                key={p.id}
                                className="pos-search-item"
                                onClick={() => {
                                  setPosSelectedProductId(p.id);
                                  setPosSearchTerm(p.name);
                                  setPosShowDropdown(false);
                                  setPosSelectedSize('');
                                  setPosSelectedColor('');
                                  setPosQuantity(1);
                                  setPosPriceType('cash');
                                }}
                              >
                                <div className="pos-search-item-name">{p.name}</div>
                                <div className="pos-search-item-meta">
                                  <span className="pos-search-item-cat">{p.category}</span>
                                  <span className="pos-search-item-price">${p.price?.toLocaleString('es-AR')}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {posSelectedProductId && (
                  <>
                    <div className="pos-variants-grid">
                      <div className="form-group">
                        <label>Talle</label>
                        <select
                          value={posSelectedSize}
                          onChange={e => {
                            setPosSelectedSize(e.target.value);
                            setPosSelectedColor('');
                            setPosQuantity(1);
                          }}
                        >
                          <option value="">— Seleccionar Talle —</option>
                          {posAvailableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Color</label>
                        <select
                          value={posSelectedColor}
                          disabled={!posSelectedSize}
                          onChange={e => {
                            setPosSelectedColor(e.target.value);
                            setPosQuantity(1);
                          }}
                        >
                          <option value="">— Seleccionar Color —</option>
                          {posAvailableColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price Type Selector */}
                    <div className="pos-price-type-section">
                      <label className="pos-price-type-label">Tipo de Precio</label>
                      <div className="pos-price-type-options">
                        <label className={`pos-price-radio ${posPriceType === 'cash' ? 'pos-price-radio-active' : ''}`}>
                          <input
                            type="radio"
                            name="posPriceType"
                            value="cash"
                            checked={posPriceType === 'cash'}
                            onChange={() => setPosPriceType('cash')}
                          />
                          <span className="pos-radio-content">
                            <span className="pos-radio-title">💵 Efectivo / Transferencia</span>
                            <span className="pos-radio-price">${posSelectedProduct?.price?.toLocaleString('es-AR') || '—'}</span>
                          </span>
                        </label>
                        <label className={`pos-price-radio ${posPriceType === 'list' ? 'pos-price-radio-active' : ''}`} style={{ opacity: posSelectedProduct?.listPrice ? 1 : 0.4, pointerEvents: posSelectedProduct?.listPrice ? 'auto' : 'none' }}>
                          <input
                            type="radio"
                            name="posPriceType"
                            value="list"
                            checked={posPriceType === 'list'}
                            onChange={() => setPosPriceType('list')}
                            disabled={!posSelectedProduct?.listPrice}
                          />
                          <span className="pos-radio-content">
                            <span className="pos-radio-title">💳 Precio de Lista</span>
                            <span className="pos-radio-price">${posSelectedProduct?.listPrice?.toLocaleString('es-AR') || 'No disponible'}</span>
                          </span>
                        </label>
                      </div>
                      <div className="pos-unit-price-preview">
                        Precio unitario: <strong>${posCurrentUnitPrice.toLocaleString('es-AR')}</strong>
                      </div>
                    </div>

                    {posSelectedSize && posSelectedColor && (
                      <div className="pos-stock-quantity-row">
                        <div className="pos-stock-badge">
                          Stock Disponible: <strong>{posMaxStock}</strong>
                        </div>
                        <div className="form-group">
                          <label>Cantidad</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={posQuantity}
                            onChange={e => {
                              const valStr = e.target.value.replace(/\D/g, '');
                              if (valStr === '') {
                                setPosQuantity('');
                                return;
                              }
                              let val = parseInt(valStr, 10);
                              if (val > posMaxStock) val = posMaxStock;
                              if (val < 1) val = 1;
                              setPosQuantity(val);
                            }}
                            onBlur={() => {
                              if (posQuantity === '' || posQuantity === 0) {
                                setPosQuantity(1);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  className="save-btn"
                  style={{ marginTop: '1rem', background: '#3b82f6', color: '#fff' }}
                  disabled={!posSelectedProductId || !posSelectedSize || !posSelectedColor || posMaxStock === 0}
                  onClick={handleAddToPOS}
                >
                  Agregar a la venta
                </button>
              </div>

              {/* Cart section */}
              <div className="pos-cart-card">
                <h3>Detalle de la Venta</h3>
                {posItems.length === 0 ? (
                  <div className="pos-empty-cart">
                    No hay productos agregados a la venta todavía.
                  </div>
                ) : (
                  <>
                    <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'auto' }}>
                      <table className="admin-table pos-table" style={{ marginTop: 0 }}>
                        <thead>
                          <tr>
                            <th>Prenda</th>
                            <th>Talle</th>
                            <th>Color</th>
                            <th>Cant.</th>
                            <th>Tipo</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                            <th style={{ textAlign: 'center' }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posItems.map((item, idx) => (
                            <tr key={idx}>
                              <td><strong>{item.name}</strong></td>
                              <td><span className="badge-size">{item.size}</span></td>
                              <td>{item.color}</td>
                              <td>{item.quantity}</td>
                              <td><span className={`pos-type-badge ${item.priceType === 'list' ? 'pos-type-list' : 'pos-type-cash'}`}>{item.priceType === 'list' ? 'Lista' : 'Efect.'}</span></td>
                              <td>${item.price.toLocaleString('es-AR')}</td>
                              <td><strong>${item.subtotal.toLocaleString('es-AR')}</strong></td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="remove-variant-btn"
                                  onClick={() => handleRemoveFromPOS(idx)}
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pos-totals">
                      <div className="pos-total-label">PRECIO TOTAL:</div>
                      <div className="pos-total-amount">${posTotalAmount.toLocaleString('es-AR')}</div>
                    </div>

                    <button
                      type="button"
                      className="save-btn"
                      style={{ background: '#22c55e', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
                      onClick={handleProcessSale}
                      disabled={loading}
                    >
                      {loading ? 'Procesando...' : '💰 Procesar Venta y Emitir Recibo'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && activeTab === 'products' && (
        <form className="admin-form" onSubmit={handleAddProduct}>
          <h2>{editingProductId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del Producto</label>
              <input type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ej: Calza Active" />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select value={newProduct.category} onChange={e => {
                const newCat = e.target.value;
                // Dynamically pick the first known subcategory for this category, or empty
                const newCatLower = newCat.toLowerCase();
                const safeAllProds = Array.isArray(allProducts) ? allProducts : [];
                const subsForCat = safeAllProds
                  .filter(p => (p?.category || '').toLowerCase() === newCatLower && p?.subCategory)
                  .map(p => p.subCategory);
                const uniqueSubs = [...new Set(subsForCat)];
                const defaultSub = uniqueSubs.length > 0 ? uniqueSubs[0] : '';
                setIsCustomSubCategory(false);
                setNewProduct({ ...newProduct, category: newCat, subCategory: defaultSub });
              }}>
                {categories.length === 0 && (
                  <option value="">— Sin categorías —</option>
                )}
                {(categories || []).map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subcategoría</label>
              {!isCustomSubCategory ? (
                <select
                  value={newProduct.subCategory}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setIsCustomSubCategory(true);
                      setNewProduct({ ...newProduct, subCategory: '' });
                    } else {
                      setNewProduct({ ...newProduct, subCategory: e.target.value });
                    }
                  }}
                  disabled={!newProduct.category || newProduct.category === 'Gift Card'}
                >
                  {newProduct.category === 'Gift Card' ? (
                    <option value="">No aplica</option>
                  ) : (formSubCategories || []).length > 0 ? (
                    (formSubCategories || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                  ) : (
                    <option value="">— Sin subcategorías —</option>
                  )}
                  {newProduct.category && newProduct.category !== 'Gift Card' && (
                    <option value="__custom__">+ Agregar nueva subcategoría...</option>
                  )}
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    value={newProduct.subCategory}
                    onChange={e => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                    placeholder="Nombre de la subcategoría"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSubCategory(false);
                      // Pick the first known subcategory for this category, or empty
                      const defaultSub = (formSubCategories || []).length > 0 ? formSubCategories[0] : '';
                      setNewProduct({ ...newProduct, subCategory: defaultSub });
                    }}
                    className="add-btn"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      padding: '0.75rem 1rem',
                      height: 'auto',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Precio Efectivo/Transferencia</label>
                <input
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Ej: 25000"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Precio Anterior (Tachado)</label>
                <input
                  type="number"
                  value={newProduct.originalPrice}
                  onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                  placeholder="Ej: 30000"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Precio de Lista</label>
                <input
                  type="number"
                  value={newProduct.listPrice}
                  onChange={e => setNewProduct({ ...newProduct, listPrice: e.target.value })}
                  placeholder="Ej: 28500"
                />
              </div>
            </div>

            <div className="form-group variant-builder-container" style={{ gridColumn: '1 / -1' }}>
              <label className="section-label">Constructor de Variantes (Talle + Color = Stock)</label>

              <div className="variant-builder-row">
                <div className="builder-input-group flex-1">
                  <label htmlFor="variant-size">Talle</label>
                  <select
                    id="variant-size"
                    value={newVariantSize}
                    onChange={e => setNewVariantSize(e.target.value)}
                  >
                    {AVAILABLE_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="builder-input-group flex-2">
                  <label htmlFor="variant-color">Color</label>
                  <input
                    id="variant-color"
                    type="text"
                    list="variant-colors-list"
                    value={newVariantColor}
                    onChange={e => setNewVariantColor(e.target.value)}
                    placeholder="Ej: Negro, Rojo..."
                  />
                  <datalist id="variant-colors-list">
                    {allColorOptions.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </datalist>
                </div>

                <div className="builder-input-group flex-1">
                  <label htmlFor="variant-stock">Stock</label>
                  <input
                    id="variant-stock"
                    type="number"
                    min="0"
                    value={newVariantStock}
                    onChange={e => setNewVariantStock(e.target.value)}
                    placeholder="Cant."
                  />
                </div>

                <button
                  type="button"
                  className="add-variant-btn"
                  onClick={handleAddVariant}
                >
                  + Agregar Variante
                </button>
              </div>

              {/* Variants table/list inside form */}
              {Array.isArray(newProduct.variants) && newProduct.variants.length > 0 ? (
                <div className="added-variants-container">
                  <span className="added-variants-title">Variantes agregadas ({newProduct.variants.length})</span>
                  <div className="variants-mini-table-wrapper">
                    <table className="variants-mini-table">
                      <thead>
                        <tr>
                          <th>Talle</th>
                          <th>Color</th>
                          <th>Stock</th>
                          <th style={{ textAlign: 'center' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(newProduct.variants || []).map((v, index) => (
                          <tr key={index}>
                            <td><span className="badge-size">{v.size}</span></td>
                            <td>{v.color}</td>
                            <td><strong>{v.stock}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="remove-variant-btn"
                                onClick={() => handleRemoveVariant(index)}
                                title="Eliminar variante"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="no-variants-message">
                  ⚠️ No se agregaron variantes todavía. Agregá al menos una variante para configurar el stock de este producto.
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea
                value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Breve descripción del producto..."
                rows={3}
                className="description-textarea"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Imágenes del Producto</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              {newProduct.images && newProduct.images.length > 0 && (
                <div className="images-gallery-grid">
                  {newProduct.images.map((url, idx) => (
                    <div key={idx} className="image-gallery-item">
                      <img src={url} alt={`Preview ${idx}`} />
                      <button
                        type="button"
                        className="image-gallery-delete"
                        onClick={() => {
                          setNewProduct(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx)
                          }));
                        }}
                        title="Eliminar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              <input type="number" required value={newGiftcard.amount} onChange={e => setNewGiftcard({ ...newGiftcard, amount: e.target.value })} placeholder="Ej: 50000" />
            </div>

            <div className="form-group">
              <label>Nombre del Destinatario (Opcional)</label>
              <input type="text" value={newGiftcard.recipientName} onChange={e => setNewGiftcard({ ...newGiftcard, recipientName: e.target.value })} placeholder="Ej: María" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mensaje Dedicatoria (Opcional)</label>
              <input type="text" value={newGiftcard.message} onChange={e => setNewGiftcard({ ...newGiftcard, message: e.target.value })} placeholder="Ej: ¡Feliz cumple! Disfrutalo." />
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
              {['TODOS', ...(categories || []).map(c => (c?.name || '').toUpperCase())].map(tab => {
                const isActive = productCategoryTab === tab;
                const isProtected = tab === 'TODOS';
                // Find the original category object to get its id
                const catObj = (categories || []).find(c => (c?.name || '').toUpperCase() === tab);
                return (
                  <div key={tab} className={`category-tab-wrapper${isActive ? ' active' : ''}`}>
                    <button
                      id={`product-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`product-category-tab ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategoryTabChange(tab)}
                    >
                      {tab === 'TODOS' && '🏷️ '}
                      {tab}
                    </button>
                    {isActive && !isProtected && catObj && (
                      <button
                        type="button"
                        className="tab-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(catObj.id, catObj.name);
                        }}
                        title={`Eliminar categoría ${catObj.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subcategory chips — only visible in category views */}
            {isCategoryView && availableSubCategories.length > 1 && (
              <div className="subcategory-chips">
                {availableSubCategories.map(sub => {
                  const isSubActive = productSubCategoryFilter === sub;
                  const isSubProtected = sub === 'Todos';
                  return (
                    <div key={sub} className={`subcategory-chip-wrapper${isSubActive ? ' active' : ''}`}>
                      <button
                        className={`subcategory-chip ${isSubActive ? 'active' : ''}`}
                        onClick={() => setProductSubCategoryFilter(sub)}
                      >
                        {sub}
                      </button>
                      {isSubActive && !isSubProtected && (
                        <button
                          type="button"
                          className="chip-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubCategory(sub);
                          }}
                          title={`Quitar filtro ${sub}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
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
                      <th>Stock Total</th>
                      {canReorder && <th>Orden</th>}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredProducts || []).map((product, idx) => (
                      <tr key={product?.id}>
                        <td>
                          {product?.imageUrl ? (
                            <img src={product.imageUrl} alt={product?.name} className="admin-thumb" />
                          ) : (
                            <div className="admin-thumb-placeholder">Sin img</div>
                          )}
                        </td>
                        <td><strong>{product?.name}</strong></td>
                        <td>
                          <div style={{ fontWeight: '600' }}>${product?.price?.toLocaleString('es-AR')}</div>
                          {product?.originalPrice && <div style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ant: ${product.originalPrice.toLocaleString('es-AR')}</div>}
                          {product?.listPrice && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lista: ${product.listPrice.toLocaleString('es-AR')}</div>}
                        </td>
                        <td>{product?.category}{product?.subCategory ? ` > ${product.subCategory}` : ''}</td>
                        <td>{Array.isArray(product?.sizes) ? product.sizes.join(', ') : product?.sizes}</td>
                        <td><strong>{product?.stock}</strong></td>
                        {canReorder && (
                          <td className="order-cell">
                            <button
                              className="reorder-btn"
                              disabled={idx === 0}
                              onClick={() => handleReorder(product?.id, 'up')}
                              title="Subir"
                            >
                              ▲
                            </button>
                            <button
                              className="reorder-btn"
                              disabled={idx === (filteredProducts || []).length - 1}
                              onClick={() => handleReorder(product?.id, 'down')}
                              title="Bajar"
                            >
                              ▼
                            </button>
                          </td>
                        )}
                        <td>
                          <div className="action-cell">
                            <button className="action-icon-btn edit-icon-btn" onClick={() => handleEditProductClick(product)} title="Editar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                            <button className="action-icon-btn delete-icon-btn" onClick={() => handleDeleteProduct(product?.id)} title="Borrar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
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
                    {(giftcards || []).map(card => (
                      <tr key={card?.id}>
                        <td>{card?.createdAt ? new Date(card.createdAt).toLocaleDateString('es-AR') : ''}</td>
                        <td><strong>${card?.amount?.toLocaleString('es-AR')}</strong></td>
                        <td style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{card?.code}</td>
                        <td>{card?.recipientName || '-'}</td>
                        <td>
                          <div className="action-cell">
                            <button className="action-icon-btn view-icon-btn" onClick={() => setSelectedGiftcard(card)} title="Ver / Descargar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button className="action-icon-btn delete-icon-btn" onClick={() => handleDeleteGiftcard(card?.id)} title="Borrar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
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
