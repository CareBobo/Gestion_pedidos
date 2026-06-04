import re

with open('src/context/AppContext.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add generateUUID at the top after imports
uuid_func = """
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
"""
content = re.sub(r'(const AppContext = createContext\(\);)', r'\1\n' + uuid_func, content)

# 2. Add useEffect for fetching data on mount
fetch_effect = """
  // Fetch data from Supabase on load
  useEffect(() => {
    if (!isCloudMode || !supabaseClient) return;

    const loadSupabaseData = async () => {
      try {
        const [vReq, cReq, pReq, oReq, lReq] = await Promise.all([
          supabaseClient.from('vendedores').select('*'),
          supabaseClient.from('categories').select('*'),
          supabaseClient.from('products').select('*'),
          supabaseClient.from('orders').select('*').order('created_at', { ascending: false }),
          supabaseClient.from('logs').select('*').order('created_at', { ascending: false })
        ]);

        if (vReq.data && vReq.data.length > 0) setVendedores(vReq.data);
        if (cReq.data && cReq.data.length > 0) setCategories(cReq.data);
        if (pReq.data && pReq.data.length > 0) setProducts(pReq.data);
        if (oReq.data && oReq.data.length > 0) setOrders(oReq.data);
        if (lReq.data && lReq.data.length > 0) setLogs(lReq.data);
      } catch (err) {
        console.error('Error fetching from Supabase:', err);
      }
    };

    loadSupabaseData();
  }, [isCloudMode, supabaseClient]);
"""
content = re.sub(r'(  // Notification Feed State\s*const \[notifications, setNotifications\] = useState\(\[\]\);)', r'\1\n' + fetch_effect, content)

# 3. Replace ID generators with generateUUID()
content = re.sub(r"id: 'c_' \+ Date\.now\(\)", "id: generateUUID()", content)
content = re.sub(r"id: 'p_' \+ Date\.now\(\)", "id: generateUUID()", content)
content = re.sub(r"id: 'o_' \+ Date\.now\(\)", "id: generateUUID()", content)
content = re.sub(r"id: 'v_' \+ Date\.now\(\)", "id: generateUUID()", content)
content = re.sub(r"id: 'u_' \+ Date\.now\(\)", "id: generateUUID()", content)
content = re.sub(r"id: 'l_' \+ Date\.now\(\) \+ '_' \+ Math\.random\(\)\.toString\(36\)\.substr\(2, 4\)", "id: generateUUID()", content)

# 4. Inject supabase calls into CRUD functions

# saveVendedor
content = re.sub(
    r'(const updated = \[\.\.\.vendedores, newV\];\s*setVendedores\(updated\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('vendedores').insert([newV]).then();",
    content
)

# updateVendedor
content = re.sub(
    r'(setVendedores\(updated\);\s*addLog\(\'Editar Proveedor\'.*?\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('vendedores').update(fields).eq('id', vendedorId).then();",
    content
)

# deleteVendedor
content = re.sub(
    r'(setVendedores\(updated\);\s*addLog\(\'Eliminar Proveedor\'.*?\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('vendedores').delete().eq('id', vendedorId).then();",
    content
)

# addCategory
content = re.sub(
    r'(setCategories\(updated\);\s*addLog\(\'Inventario\', `Se añadió la categoría.*?`\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('categories').insert([newCat]).then();",
    content
)

# createProduct
content = re.sub(
    r'(setProducts\(updated\);\s*addLog\(\'Inventario\', `Se creó el producto.*?`\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('products').insert([newP]).then();",
    content
)

# updateProduct
content = re.sub(
    r'(setProducts\(updated\);\s*addLog\(\'Inventario\', `Se editó el producto.*?`\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('products').update(updatedData).eq('id', productId).then();",
    content
)

# deleteProduct
content = re.sub(
    r'(setProducts\(updated\);\s*addLog\(\'Inventario\', `Se desactivó el producto.*?`\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('products').update({ status: 'inactivo' }).eq('id', productId).then();",
    content
)

# createOrder
content = re.sub(
    r'(setOrders\(updatedOrders\);\s*addLog\(\'Creación de Pedido\'.*?\);\s*triggerLocalNotification\(.*?\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('orders').insert([newO]).then();",
    content
)

# updateOrder
content = re.sub(
    r'(setOrders\(updatedOrders\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('orders').update({ company_name: updatedFields.company_name, seller_name: updatedFields.seller_name, seller_phone: updatedFields.seller_phone, items: items, description: description, total_value: totalValue }).eq('id', orderId).then();",
    content,
    count=1 # only the one in updateOrder, let's be careful
)

# updateOrderStatus
content = re.sub(
    r'(setOrders\(updatedOrders\);\s*addLog\(\'Actualización Estado\'.*?\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId).then();",
    content
)

# deleteOrder
content = re.sub(
    r'(setOrders\(updatedOrders\);\s*addLog\(\'Eliminación Pedido\'.*?\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('orders').delete().eq('id', orderId).then();",
    content
)

# addLog
content = re.sub(
    r'(setLogs\(updated\);)',
    r"\1\n    if (isCloudMode && supabaseClient) supabaseClient.from('logs').insert([newLog]).then();",
    content,
    count=1
)

with open('src/context/AppContext.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactor complete.")
