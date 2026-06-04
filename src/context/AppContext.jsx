import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext();

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AppProvider = ({ children }) => {
  // Theme State (Dark / Light)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme_mode') === 'dark';
  });

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('EXPO_PUBLIC_SUPABASE_URL') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('EXPO_PUBLIC_SUPABASE_ANON_KEY') || '');
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [isCloudMode, setIsCloudMode] = useState(false);

  // Core App States
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);

  const [notifications, setNotifications] = useState([]);

  // Load Supabase client
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      setSupabaseClient(supabase);
      setIsCloudMode(true);
    } else {
      setIsCloudMode(false);
      setSupabaseClient(null);
    }
  }, [supabaseUrl, supabaseKey]);

  // Initial data load
  useEffect(() => {
    if (isCloudMode && supabaseClient) {
      const fetchAll = async () => {
        const [{ data: usersData }, { data: vendedoresData }, { data: categoriesData },
          { data: productsData }, { data: ordersData }, { data: logsData }] = await Promise.all([
          supabaseClient.from('users').select('*'),
          supabaseClient.from('vendedores').select('*'),
          supabaseClient.from('categories').select('*'),
          supabaseClient.from('products').select('*'),
          supabaseClient.from('orders').select('*').order('created_at', { ascending: false }),
          supabaseClient.from('logs').select('*').order('created_at', { ascending: false })
        ]);
        setUsers(usersData || []);
        setVendedores(vendedoresData || []);
        setCategories(categoriesData || []);
        setProducts(productsData || []);
        setOrders(ordersData || []);
        setLogs(logsData || []);
      };
      fetchAll();
    }
  }, [isCloudMode, supabaseClient]);
  // Real‑time listeners (Supabase Realtime)
  useEffect(() => {
    if (!isCloudMode || !supabaseClient) return;
    const tables = ['users', 'vendedores', 'categories', 'products', 'orders', 'logs'];
    const channels = tables.map(tbl =>
      supabaseClient
        .channel(`public:${tbl}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tbl }, payload => {
          const newRecord = payload.new;
          const oldRecord = payload.old;
          if (payload.eventType === 'INSERT') {
            if (tbl === 'orders') setOrders(prev => [newRecord, ...prev]);
            else if (tbl === 'products') setProducts(prev => [newRecord, ...prev]);
            else if (tbl === 'vendedores') setVendedores(prev => [newRecord, ...prev]);
            else if (tbl === 'categories') setCategories(prev => [newRecord, ...prev]);
            else if (tbl === 'logs') setLogs(prev => [newRecord, ...prev]);
            else if (tbl === 'users') setUsers(prev => [newRecord, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updater = prev => prev.map(item => item.id === newRecord.id ? newRecord : item);
            if (tbl === 'orders') setOrders(updater);
            else if (tbl === 'products') setProducts(updater);
            else if (tbl === 'vendedores') setVendedores(updater);
            else if (tbl === 'categories') setCategories(updater);
            else if (tbl === 'logs') setLogs(updater);
            else if (tbl === 'users') setUsers(updater);
          } else if (payload.eventType === 'DELETE') {
            const remover = prev => prev.filter(item => item.id !== oldRecord.id);
            if (tbl === 'orders') setOrders(remover);
            else if (tbl === 'products') setProducts(remover);
            else if (tbl === 'vendedores') setVendedores(remover);
            else if (tbl === 'categories') setCategories(remover);
            else if (tbl === 'logs') setLogs(remover);
            else if (tbl === 'users') setUsers(remover);
          }
        })
        .subscribe()
    );
    return () => {
      channels.forEach(ch => supabaseClient.removeChannel(ch));
    };
  }, [isCloudMode, supabaseClient]);
  // Example of addLog
  const addLog = (action, description) => {
    const newLog = {
      id: generateUUID(),
      user_name: currentUser ? currentUser.full_name : 'Sistema Autónomo',
      action,
      description,
      created_at: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
    if (isCloudMode && supabaseClient) supabaseClient.from('logs').insert([newLog]);
    // broadcastState removed: real-time sync handled by Supabase Realtime
  };

  // Example: createProduct
  const createProduct = async (productData) => {
    const newP = {
      id: generateUUID(),
      ...productData,
      current_stock: parseInt(productData.current_stock) || 0,
      purchase_price: parseFloat(productData.purchase_price) || 0,
      sell_price: parseFloat(productData.sell_price) || 0,
      status: 'activo',
      created_at: new Date().toISOString()
    };
    setProducts(prev => [...prev, newP]);
    if (isCloudMode && supabaseClient) await supabaseClient.from('products').insert([newP]);
    // broadcastState removed: realtime sync handled by Supabase Realtime
  };

  // ---------- Order CRUD helpers ----------
  // Delete an order (both locally and in Supabase)
  const deleteOrder = async (orderId) => {
    // Compute new orders list
    const newOrders = orders.filter(o => o.id !== orderId);
    // Update local state
    setOrders(newOrders);
    // Sync with Supabase if online
    if (isCloudMode && supabaseClient) {
      await supabaseClient.from('orders').delete().eq('id', orderId);
    }
    addLog('Eliminación Pedido', `Pedido ${orderId} eliminado`);
    // broadcastState removed: realtime sync handled by Supabase Realtime
  };

  // Update order status (e.g., pendiente → cumplido → cancelado)
  const updateOrderStatus = async (orderId, newStatus) => {
    const prev = orders.find(o => o.id === orderId);
    if (!prev) return;
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    if (isCloudMode && supabaseClient) {
      await supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
    addLog('Actualización Estado', `Pedido ${prev.order_number} cambió a ${newStatus}`);
    // broadcastState removed: realtime sync handled by Supabase Realtime
  };

  // ---------- End of Order CRUD ----------

  // Theme effect (preserve original behavior)
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [darkMode]);

  // Broadcast channel setup (preserve original behavior)
  const [syncChannel] = useState(() => new BroadcastChannel('store_orders_sync_channel'));
  useEffect(() => {
    const handleSync = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_ALL') {
        if (payload.orders) setOrders(payload.orders);
        if (payload.products) setProducts(payload.products);
        if (payload.categories) setCategories(payload.categories);
        if (payload.logs) setLogs(payload.logs);
        if (payload.users) setUsers(payload.users);
        if (payload.vendedores) setVendedores(payload.vendedores);
      } else if (type === 'NEW_NOTIFICATION') {
        triggerLocalNotification(payload.title, payload.body, false);
      }
    };
    syncChannel.addEventListener('message', handleSync);
    return () => syncChannel.removeEventListener('message', handleSync);
  }, [syncChannel]);

  // Notification helper (preserve original behavior)
  const triggerLocalNotification = (title, body, shouldBroadcast = true) => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      body,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 20));
    // Play sound omitted for brevity
    if (shouldBroadcast) {
      syncChannel.postMessage({
        type: 'NEW_NOTIFICATION',
        payload: { title, body }
      });
    }
  };

// Broadcast state function removed as realtime updates are via Supabase


  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode,
      currentUser, setCurrentUser,
      users, setUsers,
      vendedores, setVendedores,
      categories, setCategories,
      products, setProducts,
      orders, setOrders,
      logs, setLogs,
      notifications, setNotifications,
      addLog,
      createProduct,
      deleteOrder,
      updateOrderStatus,
      // expose other functions as needed
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
