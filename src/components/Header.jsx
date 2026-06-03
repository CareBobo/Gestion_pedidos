import React, { useState } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';

export default function Header({ currentUser, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="app-header">
      {/* Brand Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--gold-color)',
          display: 'flex',
          alignItems: 'center',
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
            Gestión de Pedidos
          </h2>
          <span style={{ fontSize: '10px', color: 'var(--status-delivered)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ● Conectado
          </span>
        </div>
      </div>

      {/* User Profile Menu */}
      {currentUser && (
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 0
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: '2px solid var(--gold-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
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
              width: '200px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              padding: '12px',
              zIndex: 100
            }}>
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {currentUser.full_name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {currentUser.email}
                </div>
                {currentUser.role === 'admin' && (
                  <div style={{ fontSize: '10px', color: 'var(--gold-color)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>
                    ⚙️ Administrador
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  onLogout();
                  setShowProfileMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
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
    </header>
  );
}
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
