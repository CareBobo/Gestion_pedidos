import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, TrendingUp, Users, AlertTriangle, Sparkles, Clock, CheckCircle, Store } from 'lucide-react';

export default function DashboardScreen({ setActiveTab }) {
  const { currentUser, orders, products, companyName } = useApp();
  
  const [timeStr, setTimeStr] = useState('');

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Metrics
  const pendingOrdersCount = orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion').length;
  const completedOrdersCount = orders.filter(o => o.status === 'cumplido' || o.status === 'entregado' || o.status === 'realizado').length;
  
  // Calculate today's purchases/orders value
  const todaySales = orders
    .filter(o => {
      if (o.status === 'cancelado') return false;
      const orderDate = new Date(o.created_at);
      const today = new Date();
      return orderDate.getDate() === today.getDate() &&
             orderDate.getMonth() === today.getMonth() &&
             orderDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, o) => sum + o.total_value, 0);

  // Compute low stock products
  const lowStockProducts = products.filter(p => p.current_stock <= 4 && p.status === 'activo');

  // Compute Top Supplier Companies by Purchase Value
  const getTopSuppliers = () => {
    const counts = {};
    orders.forEach(o => {
      if (o.status === 'cancelado') return;
      counts[o.company_name] = (counts[o.company_name] || 0) + o.total_value;
    });

    return Object.entries(counts)
      .map(([name, val]) => ({ name, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 3);
  };

  const topSuppliers = getTopSuppliers();

  // Compute Active Sellers
  const getActiveSellers = () => {
    const sellers = {};
    orders.forEach(o => {
      if (o.status === 'cancelado') return;
      if (!sellers[o.seller_name]) {
        sellers[o.seller_name] = { name: o.seller_name, company: o.company_name, count: 0, total: 0 };
      }
      sellers[o.seller_name].count += 1;
      sellers[o.seller_name].total += o.total_value;
    });

    return Object.values(sellers)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const activeSellers = getActiveSellers();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Greetings Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
        color: 'white',
        borderRadius: 'var(--radius-md)',
        padding: '20px 16px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)'
        }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-color)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Sesión de Compras
            </span>
            <h2 style={{ fontSize: '20px', margin: '4px 0 2px 0', fontFamily: 'var(--font-accent)', fontWeight: 800 }}>
              Hola, {currentUser?.full_name.split(' ')[0]}
            </h2>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              Manejo de Suministros y Pedidos a Proveedores
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--gold-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {timeStr || '--:--:--'}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert */}
      {lowStockProducts.length > 0 && (
        <div 
          onClick={() => setActiveTab('inventory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
          className="stock-alert animated-scale glow-red"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>¡Alerta de Stock Crítico!</div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                Hay {lowStockProducts.length} producto(s) con inventario bajo (≤ 4 u).
              </div>
            </div>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', textDecoration: 'underline' }}>
            Ver
          </span>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="kpi-grid">
        {/* Pending Orders */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--status-pending)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Pendientes</span>
            <ShoppingBag size={16} style={{ color: 'var(--status-pending)' }} />
          </div>
          <div className="kpi-num">{pendingOrdersCount}</div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Por recibir</span>
        </div>

        {/* Completed Orders */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--status-delivered)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Recibidos</span>
            <CheckCircle size={16} style={{ color: 'var(--status-delivered)' }} />
          </div>
          <div className="kpi-num">{completedOrdersCount}</div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Pedidos cumplidos</span>
        </div>

        {/* Daily Purchases Value */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--gold-color)', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Pedidos del Día</span>
            <TrendingUp size={18} style={{ color: 'var(--gold-color)' }} />
          </div>
          <div className="kpi-num" style={{ fontSize: '24px', color: 'var(--gold-color)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>$</span>
            {todaySales.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Monto solicitado hoy</span>
        </div>
      </div>

      {/* Top Suppliers Section */}
      <div className="card">
        <h3 style={{ fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Store size={16} style={{ color: 'var(--gold-color)' }} />
          Empresas con Mayor Volumen
        </h3>
        
        {topSuppliers.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            Aún no hay registros de pedidos cargados
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topSuppliers.map((s, idx) => {
              const maxVal = topSuppliers[0].val;
              const percent = maxVal > 0 ? (s.val / maxVal) * 100 : 0;
              
              return (
                <div key={idx} style={{ fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span>{s.name}</span>
                    <span style={{ color: 'var(--gold-color)', fontWeight: 700 }}>${s.val.toFixed(2)}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-color)',
                      backgroundImage: 'linear-gradient(90deg, var(--primary-color) 0%, var(--gold-color) 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.8s ease-in-out'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Sellers Section */}
      <div className="card">
        <h3 style={{ fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Users size={16} style={{ color: 'var(--gold-color)' }} />
          Vendedores Activos
        </h3>

        {activeSellers.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            No hay registros de vendedores activos aún
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeSellers.map((v, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: idx === 0 ? '3px solid var(--gold-color)' : '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{v.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Empresa: {v.company}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: 'var(--gold-light)',
                    color: 'var(--gold-hover)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    textTransform: 'uppercase'
                  }}>
                    {v.count} Visita(s)
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Total: ${v.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
