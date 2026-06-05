import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Plus, Printer, Trash2, Edit, X, 
  Smartphone, AlertCircle, ShoppingBag, Users, Store, ClipboardList,
  Calendar, Clock, MinusCircle, PlusCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrdersScreen() {
  const { 
    orders, vendedores, createOrder, updateOrderStatus, deleteOrder, 
    updateOrder, saveVendedor, updateVendedor, deleteVendedor, currentUser 
  } = useApp();

  // Sub-Tab Switcher: 'pedidos' | 'vendedores'
  const [subTab, setSubTab] = useState('pedidos');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modals controls
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddVendedorModal, setShowAddVendedorModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showEditVendedorModal, setShowEditVendedorModal] = useState(false);
  
  // Selection States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedVendedor, setSelectedVendedor] = useState(null);

  // Forms States (Orders - seller info)
  const [companyName, setCompanyName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Dynamic Items Table State
  const [orderItems, setOrderItems] = useState([{ cantidad: '', producto: '', valor: '' }]);

  // Helper: format date
  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { fecha, hora };
  };

  // Calculate total from items
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const cant = parseFloat(item.cantidad) || 0;
      const val = parseFloat(item.valor) || 0;
      return sum + (cant * val);
    }, 0);
  };

  // Add a new empty row to items
  const addItemRow = () => {
    setOrderItems([...orderItems, { cantidad: '', producto: '', valor: '' }]);
  };

  // Remove an item row
  const removeItemRow = (index) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Update a specific field in an item row
  const updateItemField = (index, field, value) => {
    const updated = orderItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setOrderItems(updated);
  };

  // Auto-fill form fields when a saved seller is selected
  const handleSelectSavedSeller = (vId) => {
    if (!vId) {
      setCompanyName('');
      setSellerName('');
      setSellerPhone('');
      return;
    }
    const match = vendedores.find(v => v.id === vId);
    if (match) {
      setCompanyName(match.company_name);
      setSellerName(match.seller_name);
      setSellerPhone(match.seller_phone);
    }
  };

  // Submit Order Creation
  const handleCreateOrderSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!companyName || !sellerName || !sellerPhone) {
      setFormError('La empresa, vendedor y contacto son obligatorios.');
      return;
    }

    // Validate items - at least one complete row
    const validItems = orderItems.filter(i => i.cantidad && i.producto && i.valor);
    if (validItems.length === 0) {
      setFormError('Agrega al menos un producto con cantidad, nombre y valor.');
      return;
    }

    try {
      createOrder({
        company_name: companyName,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        items: validItems.map(i => ({
          cantidad: parseFloat(i.cantidad),
          producto: i.producto,
          valor: parseFloat(i.valor)
        }))
      });

      // Reset
      setCompanyName('');
      setSellerName('');
      setSellerPhone('');
      setOrderItems([{ cantidad: '', producto: '', valor: '' }]);
      setShowAddOrderModal(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Submit Order Edit
  const handleEditOrderSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!companyName || !sellerName || !sellerPhone) {
      setFormError('La empresa, vendedor y contacto son obligatorios.');
      return;
    }

    const validItems = orderItems.filter(i => i.cantidad && i.producto && i.valor);
    if (validItems.length === 0) {
      setFormError('Agrega al menos un producto con cantidad, nombre y valor.');
      return;
    }

    updateOrder(selectedOrder.id, {
      company_name: companyName,
      seller_name: sellerName,
      seller_phone: sellerPhone,
      items: validItems.map(i => ({
        cantidad: parseFloat(i.cantidad),
        producto: i.producto,
        valor: parseFloat(i.valor)
      }))
    });

    setShowEditOrderModal(false);
    setSelectedOrder(null);
  };

  // Open Edit Order Form
  const openEditOrderForm = (order) => {
    setSelectedOrder(order);
    setCompanyName(order.company_name);
    setSellerName(order.seller_name);
    setSellerPhone(order.seller_phone);
    // Load items into the form
    if (order.items && order.items.length > 0) {
      setOrderItems(order.items.map(i => ({
        cantidad: i.cantidad.toString(),
        producto: i.producto,
        valor: i.valor.toString()
      })));
    } else {
      setOrderItems([{ cantidad: '', producto: '', valor: '' }]);
    }
    setShowEditOrderModal(true);
    setShowDetailModal(false);
  };

  // Submit Vendedor Creation
  const handleCreateVendedorSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!companyName || !sellerName || !sellerPhone) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    saveVendedor({
      company_name: companyName,
      seller_name: sellerName,
      seller_phone: sellerPhone
    });

    setCompanyName('');
    setSellerName('');
    setSellerPhone('');
    setShowAddVendedorModal(false);
  };

  // Submit Vendedor Edit
  const handleEditVendedorSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!companyName || !sellerName || !sellerPhone) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    updateVendedor(selectedVendedor.id, {
      company_name: companyName,
      seller_name: sellerName,
      seller_phone: sellerPhone
    });

    setShowEditVendedorModal(false);
    setSelectedVendedor(null);
  };

  // Open Edit Vendedor Form
  const openEditVendedorForm = (vend) => {
    setSelectedVendedor(vend);
    setCompanyName(vend.company_name);
    setSellerName(vend.seller_name);
    setSellerPhone(vend.seller_phone);
    setShowEditVendedorModal(true);
  };

  // Transition Order status
  const handleStatusChange = (orderId, newStatus) => {
    try {
      updateOrderStatus(orderId, newStatus);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      if (newStatus === 'cumplido') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#0A192F', '#FFFFFF']
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Print Order Receipt
  const printOrder = (order) => {
    const printWindow = window.open('', '_blank');
    const statusText = order.status.replace('_', ' ').toUpperCase();
    const { fecha, hora } = formatDateTime(order.created_at);
    
    const itemsHtml = (order.items || []).map(i => `
      <tr>
        <td style="padding:4px 8px; border-bottom: 1px dashed #ddd; text-align:center;">${i.cantidad}</td>
        <td style="padding:4px 8px; border-bottom: 1px dashed #ddd;">${i.producto}</td>
        <td style="padding:4px 8px; border-bottom: 1px dashed #ddd; text-align:right;">$${(parseFloat(i.valor)).toFixed(2)}</td>
        <td style="padding:4px 8px; border-bottom: 1px dashed #ddd; text-align:right; font-weight:bold;">$${(i.cantidad * i.valor).toFixed(2)}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota de Pedido - ${order.order_number}</title>
          <style>
            body { font-family: monospace; padding: 25px; color: #333; line-height: 1.4; }
            .ticket { width: 360px; margin: 0 auto; border: 1px dashed #777; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .brand { font-size: 20px; font-weight: bold; }
            .divider { border-bottom: 1px dashed #777; margin: 12px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 16px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; padding: 4px 8px; border-bottom: 2px solid #333; font-size: 11px; }
            .center { text-align: center; font-size: 10px; margin-top: 20px; color: #777; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="ticket">
            <div class="header">
              <div class="brand">ORDEN DE COMPRA</div>
              <div style="font-size: 12px; margin-top: 4px;">Proveedor & Proveeduría</div>
            </div>
            <div class="row"><span>Código Pedido:</span><strong>${order.order_number}</strong></div>
            <div class="row"><span>Fecha:</span><span>${fecha} ${hora}</span></div>
            <div class="row"><span>Estado:</span><strong>${statusText}</strong></div>
            <div class="divider"></div>
            <div class="row"><strong>Empresa:</strong><span>${order.company_name}</span></div>
            <div class="row"><strong>Vendedor:</strong><span>${order.seller_name}</span></div>
            <div class="row"><strong>Contacto:</strong><span>${order.seller_phone}</span></div>
            <div class="divider"></div>
            <strong>Productos Solicitados:</strong>
            <table style="margin-top: 8px;">
              <thead>
                <tr>
                  <th style="text-align:center;">Cant.</th>
                  <th>Producto</th>
                  <th style="text-align:right;">P/U</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div class="divider"></div>
            <div class="row total"><span>VALOR TOTAL:</span><span>$${order.total_value.toFixed(2)}</span></div>
            <div class="divider"></div>
            <div class="center">
              Registro del Sistema Autónomo de Gestión
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filters logic for Orders
  const filteredOrders = orders.filter(o => {
    const s = search.toLowerCase();
    const matchesSearch = 
      (o.company_name || '').toLowerCase().includes(s) ||
      (o.seller_name || '').toLowerCase().includes(s) ||
      (o.order_number || '').toLowerCase().includes(s) ||
      (o.description || '').toLowerCase().includes(s);
      
    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter logic for Vendedores
  const filteredVendedores = vendedores.filter(v => {
    const s = search.toLowerCase();
    return (v.company_name || '').toLowerCase().includes(s) ||
      (v.seller_name || '').toLowerCase().includes(s) ||
      (v.seller_phone || '').toLowerCase().includes(s);
  });

  // ============ REUSABLE ITEMS TABLE FORM COMPONENT ============
  const renderItemsTable = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Productos del Pedido *</span>
        <span style={{ fontSize: '11px', color: 'var(--gold-color)', fontWeight: 700 }}>
          Total: ${calculateTotal(orderItems).toFixed(2)}
        </span>
      </label>

      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 80px 36px',
        gap: '6px',
        padding: '6px 0',
        borderBottom: '2px solid var(--gold-color)',
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        <span>Cant.</span>
        <span>Producto</span>
        <span>Valor $</span>
        <span></span>
      </div>

      {/* Item Rows */}
      {orderItems.map((item, idx) => {
        const subtotal = (parseFloat(item.cantidad) || 0) * (parseFloat(item.valor) || 0);
        return (
          <div key={idx} style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 80px 36px',
            gap: '6px',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <input
              type="number"
              min="1"
              placeholder="0"
              value={item.cantidad}
              onChange={(e) => updateItemField(idx, 'cantidad', e.target.value)}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                textAlign: 'center',
                fontFamily: 'var(--font-primary)',
                width: '100%'
              }}
            />
            <input
              type="text"
              placeholder="Nombre del producto"
              value={item.producto}
              onChange={(e) => updateItemField(idx, 'producto', e.target.value)}
              style={{
                padding: '8px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'var(--font-primary)',
                width: '100%'
              }}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.valor}
              onChange={(e) => updateItemField(idx, 'valor', e.target.value)}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                textAlign: 'right',
                fontFamily: 'var(--font-primary)',
                width: '100%'
              }}
            />
            <button
              type="button"
              onClick={() => removeItemRow(idx)}
              style={{
                background: 'none',
                border: 'none',
                color: orderItems.length > 1 ? 'var(--status-cancelled)' : 'var(--text-muted)',
                cursor: orderItems.length > 1 ? 'pointer' : 'not-allowed',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: orderItems.length > 1 ? 1 : 0.3
              }}
              disabled={orderItems.length <= 1}
            >
              <MinusCircle size={18} />
            </button>
            {/* Subtotal hint */}
          </div>
        );
      })}

      {/* Subtotals per row */}
      {orderItems.some(i => i.cantidad && i.valor) && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2px',
          padding: '6px 8px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          {orderItems.map((item, idx) => {
            const cant = parseFloat(item.cantidad) || 0;
            const val = parseFloat(item.valor) || 0;
            if (!cant || !val) return null;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{cant}x {item.producto || '...'}</span>
                <span style={{ fontWeight: 600 }}>${(cant * val).toFixed(2)}</span>
              </div>
            );
          })}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '4px', 
            marginTop: '4px',
            fontWeight: 800,
            color: 'var(--gold-color)',
            fontSize: '13px'
          }}>
            <span>TOTAL</span>
            <span>${calculateTotal(orderItems).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Add Row Button */}
      <button
        type="button"
        onClick={addItemRow}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px',
          borderRadius: 'var(--radius-sm)',
          border: '2px dashed var(--border-color)',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        className="animated-scale"
      >
        <PlusCircle size={16} style={{ color: 'var(--gold-color)' }} />
        Agregar otro producto
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      
      {/* Header and Toggle Switches */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', fontWeight: 800 }}>
            {subTab === 'pedidos' ? 'Pedidos Proveedores' : 'Directorio de Vendedores'}
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {subTab === 'pedidos' ? 'Pedidos realizados a proveedores' : 'Vendedores y distribuidores registrados'}
          </p>
        </div>

        {subTab === 'pedidos' ? (
          <button 
            onClick={() => {
              setFormError('');
              setCompanyName('');
              setSellerName('');
              setSellerPhone('');
              setOrderItems([{ cantidad: '', producto: '', valor: '' }]);
              setShowAddOrderModal(true);
            }}
            className="btn btn-gold animated-scale" 
            style={{ width: 'auto', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
          >
            <Plus size={16} /> Pedido
          </button>
        ) : (
          <button 
            onClick={() => {
              setFormError('');
              setCompanyName('');
              setSellerName('');
              setSellerPhone('');
              setShowAddVendedorModal(true);
            }}
            className="btn btn-gold animated-scale" 
            style={{ width: 'auto', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
          >
            <Plus size={16} /> Vendedor
          </button>
        )}
      </div>

      {/* Sub-Tab navigation bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: '4px',
        border: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => {
            setSearch('');
            setSubTab('pedidos');
          }}
          style={{
            padding: '10px 0',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: subTab === 'pedidos' ? 'var(--primary-color)' : 'transparent',
            color: subTab === 'pedidos' ? 'white' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)'
          }}
          className="animated-scale"
        >
          <ClipboardList size={14} />
          Pedidos Compra
        </button>

        <button
          onClick={() => {
            setSearch('');
            setSubTab('vendedores');
          }}
          style={{
            padding: '10px 0',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: subTab === 'vendedores' ? 'var(--primary-color)' : 'transparent',
            color: subTab === 'vendedores' ? 'white' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)'
          }}
          className="animated-scale"
        >
          <Users size={14} />
          Directorio Vendedores
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          type="text"
          className="form-input"
          placeholder={subTab === 'pedidos' ? "Buscar por empresa, vendedor, producto..." : "Buscar por empresa, vendedor, contacto..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '42px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
      </div>

      {/* VIEW: PEDIDOS COMPRA */}
      {subTab === 'pedidos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          
          {/* Quick Filters Horizontal Tags */}
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            overflowX: 'auto', 
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch'
          }}>
            {['todos', 'pendiente', 'cumplido', 'cancelado'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  backgroundColor: statusFilter === status ? 'var(--primary-color)' : 'var(--bg-secondary)',
                  color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                  border: statusFilter === status ? '1px solid transparent' : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
                className="animated-scale"
              >
                {status === 'todos' ? 'Ver Todos' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Orders Card List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>No hay pedidos registrados</p>
              </div>
            ) : (
              filteredOrders.map(o => {
                const { fecha, hora } = formatDateTime(o.created_at);
                const itemCount = (o.items || []).length;
                return (
                  <div 
                    key={o.id} 
                    className="card glow-gold" 
                    onClick={() => {
                      setSelectedOrder(o);
                      setShowDetailModal(true);
                    }}
                    style={{ cursor: 'pointer', borderLeftWidth: '5px', marginBottom: 0 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {o.order_number}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge badge-${o.status === 'en_preparacion' ? 'preparacion' : o.status}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Evita abrir el modal
                            if (confirm('¿Eliminar este pedido permanentemente?')) {
                              deleteOrder(o.id);
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--status-cancelled)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Store size={14} style={{ color: 'var(--gold-color)' }} />
                        {o.company_name}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Vendedor: {o.seller_name}
                      </p>
                      
                      {/* Items preview */}
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--text-secondary)', 
                        backgroundColor: 'var(--bg-primary)', 
                        padding: '6px 8px', 
                        borderRadius: '4px'
                      }}>
                        {itemCount > 0 ? (
                          <span>{itemCount} producto{itemCount > 1 ? 's' : ''}: {(o.description || '').substring(0, 60)}{(o.description || '').length > 60 ? '...' : ''}</span>
                        ) : (
                          <span>{(o.description || 'Sin descripción')}</span>
                        )}
                      </div>
                    </div>

                    {/* Date/Time + Total row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} /> {fecha}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} /> {hora}
                        </span>
                      </div>
                      <strong style={{ color: 'var(--gold-color)', fontSize: '13px' }}>${o.total_value.toFixed(2)}</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW: DIRECTORIO VENDEDORES */}
      {subTab === 'vendedores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Proveedores & Vendedores Guardados ({vendedores.length})
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredVendedores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>No hay vendedores en la lista</p>
              </div>
            ) : (
              filteredVendedores.map(v => (
                <div key={v.id} className="card glow-gold" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Store size={14} style={{ color: 'var(--gold-color)' }} />
                      {v.company_name}
                    </h3>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {v.seller_name}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Smartphone size={12} />
                      {v.seller_phone}
                    </p>
                  </div>

                  {/* Actions for seller */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditVendedorForm(v)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
                      className="animated-scale"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar al vendedor "${v.seller_name}" de "${v.company_name}"?`)) {
                          deleteVendedor(v.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--status-cancelled)', cursor: 'pointer', padding: '6px' }}
                      className="animated-scale"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============ CREATE ORDER MODAL ============ */}
      {showAddOrderModal && (
        <div className="modal-overlay">
          <form 
            onSubmit={handleCreateOrderSubmit} 
            className="modal-content" 
            style={{ 
              padding: '0', 
              gap: '0', 
              maxHeight: '88vh', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            {/* Cabecera Fija */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 20px', 
              borderBottom: '1px solid var(--border-color)', 
              flexShrink: 0 
            }}>
              <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)', fontWeight: 800, margin: 0 }}>
                Registrar Pedido de Compra
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddOrderModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo con Scroll */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px' 
            }}>
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

              {/* Optional Autocomplete selector */}
              <div className="form-group" style={{ marginBottom: '4px' }}>
                <label className="form-label">¿Cargar Vendedor Guardado?</label>
                <select 
                  className="form-select"
                  onChange={(e) => handleSelectSavedSeller(e.target.value)}
                  style={{ fontSize: '13px', padding: '10px 14px' }}
                >
                  <option value="">-- Ingresar Datos Manualmente --</option>
                  {vendedores.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.company_name} - {v.seller_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ borderBottom: '1px dashed var(--border-color)', margin: '4px 0' }} />

              <div className="form-group">
                <label className="form-label">Empresa *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ej: Distribuidora La Central"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Vendedor *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ej: Carlos Ruiz"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Contacto *</label>
                <input 
                  type="tel"
                  className="form-input"
                  placeholder="Ej: +573009876543"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ borderBottom: '1px dashed var(--border-color)', margin: '4px 0' }} />

              {/* Dynamic Items Table */}
              {renderItemsTable()}

              <div style={{ 
                fontSize: '11px', 
                color: 'var(--text-muted)', 
                backgroundColor: 'var(--bg-secondary)', 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm)',
                fontStyle: 'italic'
              }}>
                💾 El vendedor se guardará automáticamente en el directorio cuando guardes el pedido
              </div>
            </div>

            {/* Pie de página Fijo con Botón */}
            <div style={{ 
              padding: '16px 20px', 
              borderTop: '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-secondary)', 
              borderBottomLeftRadius: 'var(--radius-lg)', 
              borderBottomRightRadius: 'var(--radius-lg)', 
              flexShrink: 0,
              zIndex: 10
            }}>
              <button 
                type="submit" 
                className="btn btn-gold" 
                style={{ 
                  width: '100%', 
                  height: '48px', 
                  fontSize: '15px', 
                  fontWeight: 700 
                }}
              >
                Guardar Pedido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============ DETAIL MODAL (PEDIDO) ============ */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Nota de Pedido</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedOrder.order_number}</span>
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Info Card */}
            <div className="card" style={{ marginBottom: 0, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span className={`badge badge-${selectedOrder.status === 'en_preparacion' ? 'preparacion' : selectedOrder.status}`}>
                  {selectedOrder.status.replace('_', ' ')}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} /> {formatDateTime(selectedOrder.created_at).fecha}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {formatDateTime(selectedOrder.created_at).hora}
                  </span>
                </div>
              </div>

              {/* Company & Supplier Info */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Store size={14} style={{ color: 'var(--gold-color)' }} />
                  {selectedOrder.company_name}
                </h4>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Vendedor: {selectedOrder.seller_name}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Smartphone size={12} /> {selectedOrder.seller_phone}
                </p>
              </div>

              <div style={{ borderBottom: '1px dashed var(--border-color)' }} />

              {/* Items Table */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Productos Solicitados:
                </span>
                
                {(selectedOrder.items && selectedOrder.items.length > 0) ? (
                  <div style={{ marginTop: '8px' }}>
                    {/* Table header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '45px 1fr 65px 70px',
                      gap: '4px',
                      padding: '6px 8px',
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '6px 6px 0 0',
                      fontSize: '9px',
                      fontWeight: 700,
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span>Cant.</span>
                      <span>Producto</span>
                      <span style={{ textAlign: 'right' }}>P/U</span>
                      <span style={{ textAlign: 'right' }}>Subtotal</span>
                    </div>
                    
                    {/* Table rows */}
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'grid',
                        gridTemplateColumns: '45px 1fr 65px 70px',
                        gap: '4px',
                        padding: '8px 8px',
                        backgroundColor: idx % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--gold-color)' }}>{item.cantidad}</span>
                        <span>{item.producto}</span>
                        <span style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>${parseFloat(item.valor).toFixed(2)}</span>
                        <span style={{ textAlign: 'right', fontWeight: 700 }}>${(item.cantidad * item.valor).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ 
                    fontSize: '12px', 
                    backgroundColor: 'var(--bg-primary)', 
                    padding: '10px', 
                    borderRadius: 'var(--radius-sm)', 
                    color: 'var(--text-primary)', 
                    lineHeight: '1.4',
                    whiteSpace: 'pre-line',
                    marginTop: '4px'
                  }}>
                    {selectedOrder.description}
                  </p>
                )}
              </div>

              <div style={{ borderBottom: '1px solid var(--border-color)' }} />

              {/* Total Price Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                <span>Costo Total:</span>
                <span style={{ color: 'var(--gold-color)', fontSize: '17px' }}>
                  ${selectedOrder.total_value.toFixed(2)}
                </span>
              </div>

              {/* Register row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Registró: {selectedOrder.created_by_name}
                </span>
              </div>

            </div>

            {/* Quick Actions (Print) */}
            <button 
              onClick={() => printOrder(selectedOrder)}
              className="btn btn-secondary animated-scale"
              style={{ height: '40px' }}
            >
              <Printer size={16} />
              Imprimir Nota de Pedido
            </button>

            {/* Transition status block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Actualizar Estado a:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { key: 'pendiente', label: 'Pendiente' },
                  { key: 'cumplido', label: 'Cumplido' },
                  { key: 'cancelado', label: 'Cancelado' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleStatusChange(selectedOrder.id, item.key)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      border: selectedOrder.status === item.key ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      backgroundColor: selectedOrder.status === item.key ? 'var(--gold-light)' : 'var(--bg-secondary)',
                      color: selectedOrder.status === item.key ? 'var(--gold-hover)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                    className="animated-scale"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit / Delete triggers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <button 
                onClick={() => openEditOrderForm(selectedOrder)}
                className="btn btn-secondary animated-scale"
                style={{ fontSize: '12px', padding: '10px' }}
              >
                <Edit size={14} />
                Editar Pedido
              </button>
              
              <button 
                onClick={() => {
                  if (confirm('¿Eliminar este pedido permanentemente?')) {
                    deleteOrder(selectedOrder.id);
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }
                }}
                className="btn btn-danger animated-scale"
                style={{ fontSize: '12px', padding: '10px' }}
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT ORDER MODAL ============ */}
      {showEditOrderModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Editar Pedido</h3>
              <button 
                onClick={() => {
                  setShowEditOrderModal(false);
                  setSelectedOrder(null);
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

            <form onSubmit={handleEditOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Empresa *</label>
                <input 
                  type="text"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Vendedor *</label>
                <input 
                  type="text"
                  className="form-input"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Contacto *</label>
                <input 
                  type="tel"
                  className="form-input"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ borderBottom: '1px dashed var(--border-color)', margin: '4px 0' }} />

              {/* Dynamic Items Table */}
              {renderItemsTable()}

              <button type="submit" className="btn btn-gold" style={{ height: '46px', marginTop: '10px' }}>
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ CREATE VENDEDOR MODAL ============ */}
      {showAddVendedorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Registrar Vendedor</h3>
              <button 
                onClick={() => setShowAddVendedorModal(false)}
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

            <form onSubmit={handleCreateVendedorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nombre de la Empresa *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ej: Distribuidora La Central"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Vendedor *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ej: Carlos Ruiz"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Contacto *</label>
                <input 
                  type="tel"
                  className="form-input"
                  placeholder="Ej: +573009876543"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ height: '46px', marginTop: '10px' }}>
                Guardar Vendedor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ EDIT VENDEDOR MODAL ============ */}
      {showEditVendedorModal && selectedVendedor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Editar Vendedor</h3>
              <button 
                onClick={() => {
                  setShowEditVendedorModal(false);
                  setSelectedVendedor(null);
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

            <form onSubmit={handleEditVendedorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nombre de la Empresa *</label>
                <input 
                  type="text"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Vendedor *</label>
                <input 
                  type="text"
                  className="form-input"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Contacto *</label>
                <input 
                  type="tel"
                  className="form-input"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ height: '46px', marginTop: '10px' }}>
                Actualizar Vendedor
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
