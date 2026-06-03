import React from 'react';
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Settings } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, currentUser }) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Settings, adminOnly: true }
  ];

  return (
    <nav className="app-tabbar">
      {navItems.map((item) => {
        // Hide Admin tab for standard employees
        if (item.adminOnly && currentUser?.role !== 'admin') {
          return null;
        }

        const IconComponent = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`tabbar-item ${isActive ? 'tabbar-item-active' : ''}`}
            style={{
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <IconComponent 
              size={20} 
              style={{
                strokeWidth: isActive ? 2.5 : 2,
                color: isActive ? 'var(--gold-color)' : 'var(--text-muted)'
              }} 
            />
            <span style={{ 
              fontWeight: isActive ? 700 : 500, 
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '10px'
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
