import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Trash2, AlertCircle, Mail, User, Shield } from 'lucide-react';

export default function AdminPanelScreen() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingUsers(data.filter(u => u.status === 'pendiente_aprobacion'));
      setApprovedUsers(data.filter(u => u.status === 'aprobado'));
    } catch (err) {
      alert('Error al cargar usuarios: ' + err.message);
    }
    setLoading(false);
  };

  const approveUser = async (userId, email) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'aprobado' })
        .eq('id', userId);

      if (error) throw error;

      setSuccessMsg(`✅ Usuario ${email} aprobado`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const rejectUser = async (userId, email) => {
    if (!confirm(`¿Rechazar a ${email}?`)) return;

    try {
      // Delete from users table
      await supabase.from('users').delete().eq('id', userId);

      // Delete from auth
      await supabase.auth.admin.deleteUser(userId);

      setSuccessMsg(`❌ Usuario ${email} rechazado`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deactivateUser = async (userId, email) => {
    if (!confirm(`¿Desactivar a ${email}?`)) return;

    try {
      await supabase
        .from('users')
        .update({ status: 'inactivo' })
        .eq('id', userId);

      setSuccessMsg(`⛔ Usuario ${email} desactivado`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO').slice(0, 5);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', fontWeight: 800 }}>
          ⚙️ Panel de Admin
        </h2>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Aprueba o rechaza solicitudes de registro
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          fontWeight: 600,
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        backgroundColor: 'var(--bg-secondary)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: activeTab === 'pending' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'pending' ? 'white' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📋 Pendientes ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: activeTab === 'approved' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'approved' ? 'white' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ✅ Aprobados ({approvedUsers.length})
        </button>
      </div>

      {/* Pending Users */}
      {activeTab === 'pending' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>No hay usuarios pendientes de aprobación</p>
            </div>
          ) : (
            pendingUsers.map(user => (
              <div
                key={user.id}
                className="card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderLeftWidth: '4px',
                  borderLeftColor: 'var(--gold-color)',
                  marginBottom: 0
                }}
              >
                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--gold-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: 'var(--bg-primary)',
                    fontWeight: 800
                  }}>
                    {user.full_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.full_name || 'Sin nombre'}
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {user.email}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  Registrado: {formatDate(user.created_at)}
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => approveUser(user.id, user.email)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      color: '#22c55e',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="animated-scale"
                  >
                    <CheckCircle size={14} />
                    Aprobar
                  </button>
                  <button
                    onClick={() => rejectUser(user.id, user.email)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="animated-scale"
                  >
                    <XCircle size={14} />
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved Users */}
      {activeTab === 'approved' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          {approvedUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>No hay usuarios aprobados</p>
            </div>
          ) : (
            approvedUsers.map(user => (
              <div
                key={user.id}
                className="card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: 0
                }}
              >
                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: 'white',
                      fontWeight: 800
                    }}>
                      {user.full_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {user.full_name || 'Sin nombre'}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {user.email}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}>
                    <CheckCircle size={12} />
                    Aprobado
                  </div>
                </div>

                {/* Role and Date */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={12} /> {user.role}
                  </span>
                  <span>{formatDate(user.created_at)}</span>
                </div>

                {/* Deactivate Button */}
                {user.status === 'aprobado' && (
                  <button
                    onClick={() => deactivateUser(user.id, user.email)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="animated-scale"
                  >
                    <Trash2 size={14} />
                    Desactivar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
