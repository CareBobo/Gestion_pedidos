import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import Navigation from './components/Navigation';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import OrdersScreen from './screens/OrdersScreen';
import InventoryScreen from './screens/InventoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';

function MainApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch user data from database
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData && userData.status === 'aprobado') {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            full_name: userData.full_name,
            role: userData.role,
            status: userData.status
          });
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  // Login guard
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Active Screen Selector
  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen setActiveTab={setActiveTab} />;
      case 'orders':
        return <OrdersScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'admin':
        // Guard admin route
        if (currentUser.role !== 'admin') {
          setActiveTab('dashboard');
          return <DashboardScreen setActiveTab={setActiveTab} />;
        }
        return <AdminPanelScreen />;
      default:
        return <DashboardScreen setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Premium Header */}
      <Header currentUser={currentUser} onLogout={handleLogout} />

      {/* Main app body view area */}
      <main className="app-content">
        {renderScreen()}
      </main>

      {/* Mobile-first bottom navigational tabs bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
    </div>
  );
}

export default MainApp;
