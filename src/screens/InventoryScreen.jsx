import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Package, Search, Plus, Edit, Trash2, X, AlertTriangle, 
  ChevronRight, Tag, Coins, FolderHeart, AlertCircle
} from 'lucide-react';

export default function InventoryScreen() {
  const { 
    products, categories, createProduct, updateProduct, deleteProduct, addCategory 
  } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  // Modals controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState(10);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formError, setFormError] = useState('');

  // Handle create product
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || currentStock < 0 || purchasePrice <= 0 || sellPrice <= 0 || !categoryId) {
      setFormError('Por favor completa todos los campos obligatorios.');
      return;
    }

    createProduct({
      name,
      current_stock: parseInt(currentStock),
      purchase_price: parseFloat(purchasePrice),
      sell_price: parseFloat(sellPrice),
      category_id: categoryId
    });

    // Reset
    setName('');
    setCurrentStock(10);
    setPurchasePrice(0);
    setSellPrice(0);
    setCategoryId('');
    setShowAddModal(false);
  };

  // Handle edit product
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || currentStock < 0 || purchasePrice <= 0 || sellPrice <= 0 || !categoryId) {
      setFormError('Por favor completa todos los campos obligatorios.');
      return;
    }

    updateProduct(selectedProduct.id, {
      name,
      current_stock: parseInt(currentStock),
      purchase_price: parseFloat(purchasePrice),
      sell_price: parseFloat(sellPrice),
      category_id: categoryId
    });

    setShowEditModal(false);
    setSelectedProduct(null);
  };

  // Open Edit Form
  const openEditForm = (prod) => {
    setSelectedProduct(prod);
    setName(prod.name);
    setCurrentStock(prod.current_stock);
    setPurchasePrice(prod.purchase_price);
    setSellPrice(prod.sell_price);
    setCategoryId(prod.category_id);
    setShowEditModal(true);
  };

  // Quick Inline Stock increment/decrement
  const adjustStock = (prod, amt) => {
    const nextStock = Math.max(0, prod.current_stock + amt);
    updateProduct(prod.id, {
      name: prod.name,
      current_stock: nextStock,
      purchase_price: prod.purchase_price,
      sell_price: prod.sell_price,
      category_id: prod.category_id
    });
  };

  // Handle add category
  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    addCategory(newCategoryName);
    setNewCategoryName('');
    setShowCategoryDrawer(false);
  };

  // Filters logic
  const filteredProducts = products.filter(p => {
    if (p.status !== 'activo') return false;
    
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || p.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      
      {/* Header and actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', fontWeight: 800 }}>Inventario</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administración y control de existencias</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => setShowCategoryDrawer(true)}
            className="btn btn-secondary animated-scale"
            style={{ width: 'auto', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}
          >
            <FolderHeart size={18} />
          </button>
          
          <button 
            onClick={() => {
              setFormError('');
              setShowAddModal(true);
            }}
            className="btn btn-gold animated-scale" 
            style={{ width: 'auto', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
          >
            <Plus size={18} />
            Producto
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          type="text"
          className="form-input"
          placeholder="Buscar producto por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '42px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
      </div>

      {/* Category Tags scrollable row */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        overflowX: 'auto', 
        paddingBottom: '4px',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          onClick={() => setCategoryFilter('todos')}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            border: 'none',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            backgroundColor: categoryFilter === 'todos' ? 'var(--primary-color)' : 'var(--bg-secondary)',
            color: categoryFilter === 'todos' ? 'white' : 'var(--text-secondary)',
            border: categoryFilter === 'todos' ? '1px solid transparent' : '1px solid var(--border-color)',
            transition: 'all 0.2s ease'
          }}
          className="animated-scale"
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: categoryFilter === cat.id ? 'var(--primary-color)' : 'var(--bg-secondary)',
              color: categoryFilter === cat.id ? 'white' : 'var(--text-secondary)',
              border: categoryFilter === cat.id ? '1px solid transparent' : '1px solid var(--border-color)',
              transition: 'all 0.2s ease'
            }}
            className="animated-scale"
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Row list */}
      <div style={{ flex: 1 }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>No hay productos en inventario</p>
          </div>
        ) : (
          filteredProducts.map(p => {
            const isLowStock = p.current_stock <= 4;
            const categoryName = categories.find(c => c.id === p.category_id)?.name || 'General';
            
            return (
              <div 
                key={p.id} 
                className={`card ${isLowStock ? 'glow-red' : 'glow-gold'}`}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  borderLeftWidth: '5px'
                }}
              >
                {/* Header of product */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.name}
                    </h3>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <Tag size={10} /> {categoryName}
                    </span>
                  </div>
                  
                  {/* Stock status indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isLowStock ? (
                      <span className="badge badge-cancelado" style={{ fontSize: '10px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={10} /> Crítico: {p.current_stock}
                      </span>
                    ) : (
                      <span className="badge badge-entregado" style={{ fontSize: '10px', padding: '4px 8px' }}>
                        Stock: {p.current_stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing info */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  backgroundColor: 'var(--bg-primary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Costo Compra</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>${p.purchase_price.toFixed(2)}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Precio Venta</span>
                    <strong style={{ color: 'var(--gold-color)', fontSize: '13px' }}>${p.sell_price.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Stock Controls and edit/delete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  
                  {/* Increment / Decrement quick buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => adjustStock(p, -1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      className="animated-scale"
                    >
                      -
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
                      {p.current_stock}
                    </span>
                    <button 
                      onClick={() => adjustStock(p, 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      className="animated-scale"
                    >
                      +
                    </button>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => openEditForm(p)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                      className="animated-scale"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`¿Desactivar el producto "${p.name}"?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--status-cancelled)', cursor: 'pointer', padding: '4px' }}
                      className="animated-scale"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Nuevo Producto</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--status-cancelled-bg)',
                color: 'var(--status-cancelled)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600
              }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ej: Camisa Seda Oro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select 
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Selecciona categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stock Inicial *</label>
                <input 
                  type="number"
                  min="0"
                  className="form-input"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Costo de Compra ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precio de Venta al Público ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ height: '46px', marginTop: '10px' }}>
                Crear e Guardar Stock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Editar Producto</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--status-cancelled-bg)',
                color: 'var(--status-cancelled)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600
              }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input 
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select 
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stock de Existencias *</label>
                <input 
                  type="number"
                  min="0"
                  className="form-input"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Costo de Compra ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precio de Venta ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ height: '46px', marginTop: '10px' }}>
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORIES DRAWER */}
      {showCategoryDrawer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '70%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderHeart size={18} style={{ color: 'var(--gold-color)' }} />
                Categorías de Tienda
              </h3>
              <button 
                onClick={() => setShowCategoryDrawer(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Existing Categories list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
              {categories.map(c => (
                <span key={c.id} style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '9999px'
                }}>
                  {c.name}
                </span>
              ))}
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Nueva Categoría..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 16px' }}>
                Agregar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
