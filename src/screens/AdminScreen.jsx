import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, Users, ShieldAlert, KeyRound, Database, 
  Plus, UserCheck, UserMinus, ScrollText, CloudLightning,
  Trash2, X, AlertCircle
} from 'lucide-react';

export default function AdminScreen() {
  const { 
    users, logs, companyName, isCloudMode, supabaseUrl, supabaseKey,
    createUser, updateUserStatus, saveCloudConfig, clearCloudConfig, 
    updateShopName
  } = useApp();

  // Active section controls: 'users' | 'logs' | 'settings'
  const [activeSection, setActiveSection] = useState('users');

  // Add Employee Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('empleado');
  const [userFormError, setUserFormError] = useState('');

  // Branding config state
  const [tempShopName, setTempShopName] = useState(companyName);

  // Supabase state
  const [tempUrl, setTempUrl] = useState(supabaseUrl);
  const [tempKey, setTempKey] = useState(supabaseKey);
  const [showCloudSuccess, setShowCloudSuccess] = useState(false);

  // Submit User
  const handleAddUser = (e) => {
    e.preventDefault();
    setUserFormError('');

    if (!fullName || !email || !password) {
      setUserFormError('Todos los campos son obligatorios.');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setUserFormError('El correo electrónico ya está registrado.');
      return;
    }

    createUser({
      full_name: fullName,
      email: email,
      password: password,
      role: role
    });

    // Reset
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('empleado');
    setShowAddUserModal(false);
  };

  // Submit Cloud Setup
  const handleCloudSave = (e) => {
    e.preventDefault();
    if (!tempUrl || !tempKey) {
      alert('Ingresa las credenciales completas de Supabase.');
      return;
    }
    saveCloudConfig(tempUrl, tempKey);
    setShowCloudSuccess(true);
    setTimeout(() => setShowCloudSuccess(false), 3000);
  };

  // Format log timestamps
  const formatLogTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      
      {/* Header title */}
      <div>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', fontWeight: 800 }}>Administración</h2>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Configuración, auditoría e integrantes de tienda</p>
      </div>

      {/* Selector Navigation Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: '4px',
        border: '1px solid var(--border-color)',
        marginBottom: '4px'
      }}>
        {[
          { key: 'users', label: 'Empleados', icon: Users },
          { key: 'logs', label: 'Auditoría', icon: ScrollText },
          { key: 'settings', label: 'Ajustes', icon: Settings }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              style={{
                padding: '8px 0',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                transition: 'var(--transition-smooth)'
              }}
              className="animated-scale"
            >
              <Icon size={12} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* SECTION CONTENT */}
      <div style={{ flex: 1 }}>
        
        {/* USERS MANAGER */}
        {activeSection === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                Colaboradores ({users.length})
              </span>
              <button 
                onClick={() => {
                  setUserFormError('');
                  setShowAddUserModal(true);
                }}
                className="btn btn-gold animated-scale"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '11px', borderRadius: 'var(--radius-sm)' }}
              >
                <Plus size={14} /> Registrar Empleado
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map(u => (
                <div key={u.id} className="card glow-gold" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{u.full_name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{u.email}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <span style={{ fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: u.role === 'admin' ? 'var(--gold-light)' : 'rgba(79, 70, 229, 0.1)', color: u.role === 'admin' ? 'var(--gold-hover)' : 'var(--status-done)', textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                      <span style={{ fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: u.status === 'activo' ? 'var(--status-delivered-bg)' : 'var(--status-cancelled-bg)', color: u.status === 'activo' ? 'var(--status-delivered)' : 'var(--status-cancelled)', textTransform: 'uppercase' }}>
                        {u.status}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Active status */}
                  {u.id !== 'u1' && ( // Prevent deactivating system primary admin
                    <button
                      onClick={() => updateUserStatus(u.id, u.status === 'activo' ? 'inactivo' : 'activo')}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: 'var(--bg-primary)',
                        color: u.status === 'activo' ? 'var(--status-cancelled)' : 'var(--status-delivered)',
                        cursor: 'pointer'
                      }}
                      className="animated-scale"
                    >
                      {u.status === 'activo' ? <UserMinus size={14} /> : <UserCheck size={14} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT LOGS */}
        {activeSection === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              Historial de Auditoría Global
            </span>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '420px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {logs.map(log => (
                <div key={log.id} style={{
                  padding: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--gold-color)',
                  fontSize: '11px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    <span>{log.action}</span>
                    <span style={{ fontSize: '9px', fontWeight: 500, color: 'var(--text-muted)' }}>{formatLogTime(log.created_at)}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{log.description}</p>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                    Por: {log.user_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRANDING & CLOUD KEYS ADJUSTS */}
        {activeSection === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Store Branding card */}
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)' }}>
                <Settings size={14} style={{ color: 'var(--gold-color)' }} />
                Información de la Empresa
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  className="form-input"
                  value={tempShopName}
                  onChange={(e) => setTempShopName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={() => {
                    updateShopName(tempShopName);
                    alert('¡Nombre de la empresa actualizado con éxito!');
                  }}
                  className="btn btn-primary" 
                  style={{ width: 'auto', padding: '0 16px', fontSize: '12px' }}
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Cloud Sync Database (Supabase) */}
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)' }}>
                <Database size={14} style={{ color: 'var(--gold-color)' }} />
                Sincronización en la Nube (Supabase)
              </h3>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Configura un proyecto Supabase real para sincronizar múltiples dispositivos en tiempo real automáticamente.
              </p>

              {showCloudSuccess && (
                <div style={{
                  backgroundColor: 'var(--status-delivered-bg)',
                  color: 'var(--status-delivered)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 600,
                  marginBottom: '10px'
                }}>
                  ✨ ¡Conexión con Supabase establecida! Modo Cloud Activado.
                </div>
              )}

              <form onSubmit={handleCloudSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">SUPABASE URL</label>
                  <input 
                    type="url"
                    className="form-input"
                    placeholder="https://xxxx.supabase.co"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">SUPABASE ANON KEY</label>
                  <input 
                    type="password"
                    className="form-input"
                    placeholder="eyJhbGciOi..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '6px' }}>
                  <button type="submit" className="btn btn-gold" style={{ height: '40px', fontSize: '12px' }}>
                    <CloudLightning size={14} />
                    Conectar Base de Datos
                  </button>
                  {isCloudMode && (
                    <button 
                      type="button" 
                      onClick={() => {
                        clearCloudConfig();
                        setTempUrl('');
                        setTempKey('');
                        alert('¡Supabase desconectado! Volviendo a base de datos local.');
                      }}
                      className="btn btn-danger" 
                      style={{ padding: '0 12px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* REGISTER NEW EMPLOYEE MODAL */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', color: 'var(--text-primary)' }}>Registrar Colaborador</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {userFormError && (
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
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Ej: Sofia Restrepo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico *</label>
                <input 
                  type="email"
                  className="form-input"
                  placeholder="sofia@tienda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña de Acceso *</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol Asignado *</label>
                <select 
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="empleado">Empleado Estándar</option>
                  <option value="admin">Administrador General</option>
                </select>
              </div>

              <button type="submit" className="btn btn-gold" style={{ height: '46px', marginTop: '10px' }}>
                Habilitar Cuenta de Acceso
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
