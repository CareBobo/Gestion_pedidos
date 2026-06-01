import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Bell, LogOut, Shield, Award, Sliders, ChevronDown } from 'lucide-react';

export default function Header() {
  const { 
    darkMode, 
    setDarkMode, 
    currentUser, 
    logoutUser, 
    companyName, 
    notifications,
    isCloudMode
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="app-header">
      {/* Brand Section */}
      <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--gold-color)',
          display: 'flex',
          alignItems: 'center',
          justifycontent: 'center',
          justifyContent: 'center',
          color: '#0A192F',
          fontWeight: 'bold',
          fontSize: '18px',
          fontFamily: 'var(--font-accent)',
          boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)'
        }}>
          G
        </div>
        <div>
          <h2 style={{ fontSize: '15px', margin: 0, fontWeight: 800, fontFamily: 'var(--font-accent)', color: 'var(--text-primary)' }}>
            {companyName}
          </h2>
          <span style={{ fontSize: '10px', color: isCloudMode ? 'var(--status-delivered)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isCloudMode ? '● Nube Realtime' : '○ Modo Local'}
          </span>
        </div>
      </div>

      {/* Utility Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
          className="animated-scale"
        >
          {darkMode ? <Sun size={20} style={{ color: 'var(--gold-color)' }} /> : <Moon size={20} style={{ color: 'var(--primary-color)' }} />}
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', padding: '4px', position: 'relative' }}
            className="animated-scale"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--status-cancelled)',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px var(--bg-secondary)'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              top: '32px',
              right: '-10px',
              width: '280px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              padding: '12px',
              zIndex: 100,
              maxHeight: '350px',
              overflowY: 'auto'
            }}>
              <h4 style={{ fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-primary)' }}>
                Notificaciones ({notifications.length})
              </h4>
              {notifications.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  No hay notificaciones recientes
                </p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    fontSize: '11px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span>{n.title}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{formatDate(n.created_at)}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{n.body}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile Circle Menu */}
        {currentUser && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                color: 'var(--bg-secondary)',
                border: '2px solid var(--gold-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {getInitials(currentUser.full_name)}
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-primary)' }} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: '36px',
                right: '0',
                width: '180px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                padding: '8px',
                zIndex: 100
              }}>
                <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentUser.full_name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--gold-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    {currentUser.role === 'admin' ? <Shield size={10} /> : <Award size={10} />}
                    {currentUser.role.toUpperCase()}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    logoutUser();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    fontSize: '12px',
                    color: 'var(--status-cancelled)',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  className="animated-scale"
                >
                  <LogOut size={14} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
