import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AppContext = createContext();

// Default Mock Data for Vendedores (Suppliers/Sellers)
const DEFAULT_VENDEDORES = [
  { id: 'v1', company_name: 'Distribuidora La Central', seller_name: 'Carlos Ruiz', seller_phone: '+573009876543', created_at: new Date().toISOString() },
  { id: 'v2', company_name: 'Licores del Valle', seller_name: 'Marta Gómez', seller_phone: '+573123456789', created_at: new Date().toISOString() },
  { id: 'v3', company_name: 'Abarrotes Mayoristas JR', seller_name: 'Felipe Jaramillo', seller_phone: '+573217654321', created_at: new Date().toISOString() }
];

const DEFAULT_USERS = [
  { id: 'u1', email: 'admin@tienda.com', password: 'admin123', full_name: 'Alejandro G. (Admin)', role: 'admin', status: 'activo' },
  { id: 'u2', email: 'empleado@tienda.com', password: 'empleado123', full_name: 'Sofia M. (Empleado)', role: 'empleado', status: 'activo' }
];

const DEFAULT_CATEGORIES = [
  { id: 'c1', name: 'Abarrotes' },
  { id: 'c2', name: 'Víveres & Ranchos' },
  { id: 'c3', name: 'Licores & Bebidas' },
  { id: 'c4', name: 'Limpieza & Hogar' },
  { id: 'c5', name: 'Snacks & Confitería' }
];

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Arroz Premium 5kg', current_stock: 30, purchase_price: 8.00, sell_price: 12.50, category_id: 'c1', status: 'activo' },
  { id: 'p2', name: 'Aceite Vegetal 1L', current_stock: 45, purchase_price: 3.50, sell_price: 5.99, category_id: 'c1', status: 'activo' },
  { id: 'p3', name: 'Azúcar Refinada 2kg', current_stock: 3, purchase_price: 2.80, sell_price: 4.50, category_id: 'c1', status: 'activo' },
  { id: 'p4', name: 'Harina de Maíz 1kg', current_stock: 20, purchase_price: 1.50, sell_price: 2.99, category_id: 'c2', status: 'activo' },
  { id: 'p5', name: 'Cerveza Nacional (caja 24u)', current_stock: 8, purchase_price: 18.00, sell_price: 28.00, category_id: 'c3', status: 'activo' },
  { id: 'p6', name: 'Ron Añejo 750ml', current_stock: 2, purchase_price: 12.00, sell_price: 22.00, category_id: 'c3', status: 'activo' },
  { id: 'p7', name: 'Detergente Líquido 3L', current_stock: 15, purchase_price: 5.00, sell_price: 8.99, category_id: 'c4', status: 'activo' },
  { id: 'p8', name: 'Galletas Surtidas (paquete)', current_stock: 40, purchase_price: 1.20, sell_price: 2.50, category_id: 'c5', status: 'activo' }
];

// Orders to Suppliers (Pedidos de Compra a Proveedores)
const DEFAULT_ORDERS = [
  {
    id: 'o1',
    order_number: 'PED-1001',
    company_name: 'Distribuidora La Central',
    seller_name: 'Carlos Ruiz',
    seller_phone: '+573009876543',
    items: [
      { cantidad: 10, producto: 'Arroz Premium 5kg', valor: 8.00 },
      { cantidad: 24, producto: 'Aceite Vegetal 1L', valor: 3.50 },
      { cantidad: 15, producto: 'Azúcar Refinada 2kg', valor: 2.80 }
    ],
    description: '10x Arroz Premium 5kg, 24x Aceite Vegetal 1L, 15x Azúcar Refinada 2kg',
    total_value: 206.00,
    status: 'pendiente',
    created_by_name: 'Sofia M.',
    created_at: new Date(Date.now() - 3.5 * 3600000).toISOString()
  },
  {
    id: 'o2',
    order_number: 'PED-1002',
    company_name: 'Licores del Valle',
    seller_name: 'Marta Gómez',
    seller_phone: '+573123456789',
    items: [
      { cantidad: 5, producto: 'Cerveza Nacional (caja 24u)', valor: 18.00 },
      { cantidad: 3, producto: 'Ron Añejo 750ml', valor: 12.00 }
    ],
    description: '5x Cerveza Nacional (caja 24u), 3x Ron Añejo 750ml',
    total_value: 126.00,
    status: 'en_preparacion',
    created_by_name: 'Sofia M.',
    created_at: new Date(Date.now() - 1.2 * 3600000).toISOString()
  },
  {
    id: 'o3',
    order_number: 'PED-1003',
    company_name: 'Abarrotes Mayoristas JR',
    seller_name: 'Felipe Jaramillo',
    seller_phone: '+573217654321',
    items: [
      { cantidad: 50, producto: 'Harina de Maíz 1kg', valor: 1.50 },
      { cantidad: 30, producto: 'Galletas Surtidas (paquete)', valor: 1.20 }
    ],
    description: '50x Harina de Maíz 1kg, 30x Galletas Surtidas (paquete)',
    total_value: 111.00,
    status: 'cumplido',
    created_by_name: 'Alejandro G.',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

const DEFAULT_LOGS = [
  { id: 'l1', user_name: 'Sofia M. (Empleado)', action: 'Registro Pedido Proveedor', description: 'Creó pedido PED-1001 a Distribuidora La Central', created_at: new Date(Date.now() - 3.5 * 3600000).toISOString() },
  { id: 'l2', user_name: 'Sofia M. (Empleado)', action: 'Actualización Estado', description: 'Cambió el estado del pedido PED-1002 a "En preparación"', created_at: new Date(Date.now() - 1.2 * 3600000).toISOString() },
  { id: 'l3', user_name: 'Alejandro G. (Admin)', action: 'Cumplimiento Pedido', description: 'Marcó el pedido PED-1003 como "Cumplido"', created_at: new Date(Date.now() - 24 * 3600000).toISOString() }
];

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

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('db_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [vendedores, setVendedores] = useState(() => {
    const saved = localStorage.getItem('db_vendedores');
    return saved ? JSON.parse(saved) : DEFAULT_VENDEDORES;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('db_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('db_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('db_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('db_logs');
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  // Settings Configuration
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('company_name') || 'Golden Boutique');

  // Real-time synchronization channel for multi-tab testing
  const [syncChannel] = useState(() => new BroadcastChannel('store_orders_sync_channel'));

  // Notification Feed State
  const [notifications, setNotifications] = useState([]);

  // Initialize Theme
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

  // Persist States locally
  useEffect(() => {
    localStorage.setItem('db_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('db_vendedores', JSON.stringify(vendedores));
  }, [vendedores]);

  useEffect(() => {
    localStorage.setItem('db_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('db_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('db_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('db_logs', JSON.stringify(logs));
  }, [logs]);

  // Real-time local syncing listener
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

  // Broadcast function to all tabs
  const broadcastState = (updatedOrders, updatedProducts, updatedCategories, updatedLogs, updatedUsers, updatedVendedores) => {
    syncChannel.postMessage({
      type: 'SYNC_ALL',
      payload: {
        orders: updatedOrders || orders,
        products: updatedProducts || products,
        categories: updatedCategories || categories,
        logs: updatedLogs || logs,
        users: updatedUsers || users,
        vendedores: updatedVendedores || vendedores
      }
    });
  };

  // Notification helper
  const triggerLocalNotification = (title, body, shouldBroadcast = true) => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      body,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 20));

    // Play subtle audio tone
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio could not be played:', e);
    }

    if (shouldBroadcast) {
      syncChannel.postMessage({
        type: 'NEW_NOTIFICATION',
        payload: { title, body }
      });
    }
  };

  // Setup Supabase Client
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      try {
        const client = createClient(supabaseUrl, supabaseKey);
        setSupabaseClient(client);
        setIsCloudMode(true);
        console.log('Supabase Cloud Sync active');
      } catch (err) {
        console.error('Error loading Supabase:', err);
        setIsCloudMode(false);
      }
    } else {
      setIsCloudMode(false);
      setSupabaseClient(null);
    }
  }, [supabaseUrl, supabaseKey]);

  // Auth Operations
  const loginUser = (email, password) => {
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'activo');
    if (!matched) {
      throw new Error('El usuario no existe o está inactivo.');
    }
    if (matched.password !== password) {
      throw new Error('Contraseña incorrecta.');
    }
    setCurrentUser(matched);
    localStorage.setItem('current_user', JSON.stringify(matched));
    addLog('Inicio de Sesión', `El usuario ${matched.full_name} inició sesión.`);
    return matched;
  };

  const logoutUser = () => {
    if (currentUser) {
      addLog('Cierre de Sesión', `El usuario ${currentUser.full_name} cerró sesión.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  const recoverPassword = (email) => {
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      throw new Error('El correo electrónico no está registrado.');
    }
    return `Contraseña enviada (Simulación). Clave actual: ${matched.password}`;
  };

  const addLog = (action, description) => {
    const newLog = {
      id: 'l_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      user_name: currentUser ? currentUser.full_name : 'Sistema Autónomo',
      action,
      description,
      created_at: new Date().toISOString()
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    broadcastState(null, null, null, updated, null, null);
  };

  // User Management
  const createUser = (userData) => {
    const newU = {
      id: 'u_' + Date.now(),
      ...userData,
      status: 'activo'
    };
    const updated = [...users, newU];
    setUsers(updated);
    addLog('Gestión de Usuarios', `Admin creó al usuario ${userData.full_name}`);
    broadcastState(null, null, null, null, updated, null);
  };

  const updateUserStatus = (userId, status) => {
    const target = users.find(u => u.id === userId);
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    setUsers(updated);
    addLog('Gestión de Usuarios', `Admin cambió estado de ${target?.full_name} a ${status}`);
    broadcastState(null, null, null, null, updated, null);
  };

  // VENDEDORES CRUD (DIRECTORY)
  const saveVendedor = (vendData) => {
    // Check if seller already exists by name/company to avoid duplicates
    const matched = vendedores.find(v => 
      v.company_name.toLowerCase() === vendData.company_name.toLowerCase() &&
      v.seller_name.toLowerCase() === vendData.seller_name.toLowerCase()
    );

    if (matched) {
      // Update phone if matches
      const updated = vendedores.map(v => v.id === matched.id ? { ...v, seller_phone: vendData.seller_phone } : v);
      setVendedores(updated);
      broadcastState(null, null, null, null, null, updated);
      return matched;
    }

    const newV = {
      id: 'v_' + Date.now(),
      company_name: vendData.company_name,
      seller_name: vendData.seller_name,
      seller_phone: vendData.seller_phone,
      created_at: new Date().toISOString()
    };
    const updated = [...vendedores, newV];
    setVendedores(updated);
    addLog('Registro Proveedor', `Se guardó al vendedor ${vendData.seller_name} (${vendData.company_name}) en el directorio`);
    broadcastState(null, null, null, null, null, updated);
    return newV;
  };

  const updateVendedor = (vendedorId, fields) => {
    const prev = vendedores.find(v => v.id === vendedorId);
    const updated = vendedores.map(v => v.id === vendedorId ? { ...v, ...fields } : v);
    setVendedores(updated);
    addLog('Editar Proveedor', `Se actualizaron los datos de ${prev?.seller_name} (${prev?.company_name})`);
    
    // Also cascade update seller details in orders!
    const updatedOrders = orders.map(o => {
      if (o.company_name === prev?.company_name && o.seller_name === prev?.seller_name) {
        return {
          ...o,
          company_name: fields.company_name || o.company_name,
          seller_name: fields.seller_name || o.seller_name,
          seller_phone: fields.seller_phone || o.seller_phone
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    broadcastState(updatedOrders, null, null, null, null, updated);
  };

  const deleteVendedor = (vendedorId) => {
    const target = vendedores.find(v => v.id === vendedorId);
    const updated = vendedores.filter(v => v.id !== vendedorId);
    setVendedores(updated);
    addLog('Eliminar Proveedor', `Se eliminó al vendedor ${target?.seller_name} del directorio`);
    broadcastState(null, null, null, null, null, updated);
  };

  // Category Operations
  const addCategory = (name) => {
    const newCat = { id: 'c_' + Date.now(), name };
    const updated = [...categories, newCat];
    setCategories(updated);
    addLog('Inventario', `Se añadió la categoría "${name}"`);
    broadcastState(null, null, updated, null, null, null);
    return newCat;
  };

  // Product CRUD
  const createProduct = (productData) => {
    const newP = {
      id: 'p_' + Date.now(),
      ...productData,
      current_stock: parseInt(productData.current_stock) || 0,
      purchase_price: parseFloat(productData.purchase_price) || 0,
      sell_price: parseFloat(productData.sell_price) || 0,
      status: 'activo'
    };
    const updated = [...products, newP];
    setProducts(updated);
    addLog('Inventario', `Se creó el producto "${newP.name}"`);
    broadcastState(null, updated, null, null, null, null);

    if (newP.current_stock <= 4) {
      triggerLocalNotification('Stock Bajo', `El producto "${newP.name}" tiene stock crítico.`);
    }
  };

  const updateProduct = (productId, updatedData) => {
    const prevProduct = products.find(p => p.id === productId);
    const updated = products.map(p => p.id === productId ? {
      ...p,
      ...updatedData,
      current_stock: parseInt(updatedData.current_stock),
      purchase_price: parseFloat(updatedData.purchase_price),
      sell_price: parseFloat(updatedData.sell_price)
    } : p);
    setProducts(updated);
    addLog('Inventario', `Se editó el producto "${prevProduct.name}"`);
    broadcastState(null, updated, null, null, null, null);
  };

  const deleteProduct = (productId) => {
    const target = products.find(p => p.id === productId);
    const updated = products.map(p => p.id === productId ? { ...p, status: 'inactivo' } : p);
    setProducts(updated);
    addLog('Inventario', `Se desactivó el producto "${target?.name}"`);
    broadcastState(null, updated, null, null, null, null);
  };

  // Supplier Order Operations
  const createOrder = (orderData) => {
    const count = orders.length + 1001;
    const orderNumber = `PED-${count}`;

    // Build description from items
    const items = orderData.items || [];
    const description = items.map(i => `${i.cantidad}x ${i.producto}`).join(', ');
    const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.cantidad) || 0) * (parseFloat(i.valor) || 0), 0);

    const newO = {
      id: 'o_' + Date.now(),
      order_number: orderNumber,
      company_name: orderData.company_name,
      seller_name: orderData.seller_name,
      seller_phone: orderData.seller_phone,
      items: items,
      description: description,
      total_value: totalValue,
      status: 'pendiente',
      created_by_name: currentUser ? currentUser.full_name.split(' ')[0] : 'Empleado',
      created_at: new Date().toISOString()
    };

    // Auto save seller details in directory!
    saveVendedor({
      company_name: orderData.company_name,
      seller_name: orderData.seller_name,
      seller_phone: orderData.seller_phone
    });

    const updatedOrders = [newO, ...orders];
    setOrders(updatedOrders);
    
    addLog('Creación de Pedido', `Creó el pedido de compra ${orderNumber} para ${orderData.company_name} (${items.length} productos)`);
    triggerLocalNotification('Nuevo Pedido a Proveedor', `Se registró el pedido ${orderNumber} a ${orderData.company_name} por $${newO.total_value.toFixed(2)}`);
    
    broadcastState(updatedOrders, null, null, null, null, null);
  };

  const updateOrder = (orderId, updatedFields) => {
    const prevOrder = orders.find(o => o.id === orderId);
    if (!prevOrder) return;

    const items = updatedFields.items || [];
    const description = items.map(i => `${i.cantidad}x ${i.producto}`).join(', ');
    const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.cantidad) || 0) * (parseFloat(i.valor) || 0), 0);

    const updatedOrders = orders.map(o => o.id === orderId ? { 
      ...o, 
      company_name: updatedFields.company_name,
      seller_name: updatedFields.seller_name,
      seller_phone: updatedFields.seller_phone,
      items: items,
      description: description,
      total_value: totalValue
    } : o);
    setOrders(updatedOrders);

    // Also auto update directory if matches
    saveVendedor({
      company_name: updatedFields.company_name,
      seller_name: updatedFields.seller_name,
      seller_phone: updatedFields.seller_phone
    });

    addLog('Edición de Pedido', `Editó los datos del pedido ${prevOrder.order_number}`);
    broadcastState(updatedOrders, null, null, null, null, null);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const prevOrder = orders.find(o => o.id === orderId);
    if (!prevOrder) return;

    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);

    addLog('Actualización Estado', `Cambió estado del pedido ${prevOrder.order_number} a "${newStatus.replace('_', ' ')}"`);
    
    if (newStatus === 'cumplido') {
      triggerLocalNotification('Pedido Completado', `El pedido ${prevOrder.order_number} de ${prevOrder.company_name} ha sido cumplido con éxito.`);
    }

    broadcastState(updatedOrders, null, null, null, null, null);
  };

  const deleteOrder = (orderId) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);

    addLog('Eliminación Pedido', `Eliminó el pedido ${target.order_number}`);
    broadcastState(updatedOrders, null, null, null, null, null);
  };

  // Configure Cloud Supabase Credentials
  const saveCloudConfig = (url, key) => {
    localStorage.setItem('EXPO_PUBLIC_SUPABASE_URL', url);
    localStorage.setItem('EXPO_PUBLIC_SUPABASE_ANON_KEY', key);
    setSupabaseUrl(url);
    setSupabaseKey(key);
    addLog('Configuración Cloud', 'Se actualizaron las credenciales de Supabase');
  };

  const clearCloudConfig = () => {
    localStorage.removeItem('EXPO_PUBLIC_SUPABASE_URL');
    localStorage.removeItem('EXPO_PUBLIC_SUPABASE_ANON_KEY');
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsCloudMode(false);
    setSupabaseClient(null);
    addLog('Configuración Cloud', 'Se eliminaron las credenciales de Supabase. Regresando a modo local.');
  };

  // Config Shop Info
  const updateShopName = (name) => {
    setCompanyName(name);
    localStorage.setItem('company_name', name);
    addLog('Configuración Tienda', `Se actualizó el nombre de la tienda a "${name}"`);
  };

  return (
    <AppContext.Provider value={{
      darkMode,
      setDarkMode,
      currentUser,
      companyName,
      isCloudMode,
      supabaseUrl,
      supabaseKey,
      users,
      vendedores,
      categories,
      products,
      orders,
      logs,
      notifications,
      loginUser,
      logoutUser,
      recoverPassword,
      createUser,
      updateUserStatus,
      saveVendedor,
      updateVendedor,
      deleteVendedor,
      addCategory,
      createProduct,
      updateProduct,
      deleteProduct,
      createOrder,
      updateOrder,
      updateOrderStatus,
      deleteOrder,
      saveCloudConfig,
      clearCloudConfig,
      updateShopName,
      triggerLocalNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
