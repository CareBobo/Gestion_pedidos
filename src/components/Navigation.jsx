import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Settings, X, Menu } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Settings, adminOnly: true }
  ];

  const visibleItems = navItems.filter(
    item => !(item.adminOnly && currentUser?.role !== 'admin')
  );

  const activeItem = visibleItems.find(i => i.id === activeTab);
  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  const handleSelect = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Overlay oscuro detrás del menú desplegable */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 9998,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Menú desplegable */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          zIndex: 9999,
          padding: '8px 0',
          minWidth: '180px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          animation: 'slideUpFade 0.22s ease-out',
        }}>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  background: isActive ? 'var(--gold-light, rgba(212,175,55,0.12))' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  margin: '0 6px',
                  color: isActive ? 'var(--gold-color)' : 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  fontFamily: 'var(--font-main)',
                  transition: 'background 0.15s',
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--gold-color)' : 'var(--text-muted)' }} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Barra inferior — sólo muestra la sección activa + botón de menú */}
      <nav className="app-tabbar" style={{ justifyContent: 'space-between', padding: '0 20px' }}>

        {/* Pantalla activa actual */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--gold-color)',
          fontWeight: 700,
          fontSize: '13px',
        }}>
          <ActiveIcon size={20} style={{ color: 'var(--gold-color)' }} />
          {activeItem?.label}
        </div>

        {/* Botón hamburger / cerrar */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: menuOpen ? 'var(--gold-color)' : 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '8px 14px',
            cursor: 'pointer',
            color: menuOpen ? '#fff' : 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '11px',
            transition: 'all 0.2s ease',
          }}
        >
          {menuOpen
            ? <X size={20} />
            : <Menu size={20} />
          }
          <span style={{ fontSize: '10px', marginTop: '1px' }}>
            {menuOpen ? 'Cerrar' : 'Menú'}
          </span>
        </button>
      </nav>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
}
