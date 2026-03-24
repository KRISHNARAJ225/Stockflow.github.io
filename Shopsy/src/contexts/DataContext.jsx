import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer as updateCust, deleteCustomer as deleteCust } from '../Service.js/CustomerService.js';
import { getCategories, createCategory, updateCategory as updateCat, deleteCategory as deleteCat } from '../Service.js/CategoryService.js';
import { getProducts, createProduct, updateProduct as updateProd, deleteProduct as deleteProd } from '../Service.js/ProductService.js';
import { getOrders, createOrder, updateOrder as updateOrd, deleteOrder as deleteOrd } from '../Service.js/OrderService.js';
import { registerUser as apiRegisterUser } from '../Service.js/AuthService.js';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }) => {
  const [token, setToken]               = useState(() => localStorage.getItem('authToken'));
  const [customers, setCustomers]       = useState([]);
  const [categories, setCategories]     = useState([]);
  const [products, setProducts]         = useState([]);
  const [orders, setOrders]             = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [notifications, setNotifications]     = useState([]);

  const addNotification = (message) =>
    setNotifications(prev => [{ id: Date.now(), message, date: new Date().toISOString() }, ...prev]);

  // Normalize order fields from backend to match UI expectations
  const normalizeOrder = (o) => {
    // customer can be a nested object or flat fields
    const custName  = o.customerName  || o.customer_name  || o.customer?.name  || (typeof o.customer === 'string' ? o.customer : '') || '';
    const custEmail = o.customerEmail || o.customer_email || o.customer?.email || '';
    const custPhone = o.customerPhone || o.customer_phone || o.customer?.phone || o.customer?.phoneNumber || '';
    // products list — Spring Boot may call it orderItems, items, orderProducts
    const prods = Array.isArray(o.products)    ? o.products
                : Array.isArray(o.orderItems)  ? o.orderItems
                : Array.isArray(o.items)        ? o.items
                : Array.isArray(o.orderProducts)? o.orderProducts
                : [];
    return {
      ...o,
      id:              o.id              ?? o.orderId      ?? o.order_id    ?? Date.now(),
      customerName:    custName,
      customerEmail:   custEmail,
      customerPhone:   custPhone,
      shippingAddress: o.shippingAddress || o.shipping_address || o.deliveryAddress || o.address || '',
      shippingDate:    o.shippingDate    || o.shipping_date    || o.deliveryDate    || o.delivery_date || '',
      orderDate:       o.orderDate       || o.order_date       || o.createdAt       || o.created_at   || '',
      paymentStatus:   o.paymentStatus   || o.payment_status   || o.paymentMethod   || o.payment_method || 'Pending',
      orderStatus:     o.orderStatus     || o.order_status     || o.status          || 'Processing',
      totalAmount:     parseFloat(o.totalAmount ?? o.total_amount ?? o.total ?? o.amount ?? o.grandTotal ?? 0),
      products:        prods,
    };
  };

  // Normalize category fields
  const normalizeCategory = (c) => ({
    ...c,
    id:   c.id   ?? c.categoryId   ?? c.category_id,
    name: c.name || c.categoryName || c.category_name || '',
    type: c.type || c.categoryType || c.category_type || 'Physical Goods',
  });

  // Normalize product fields
  const normalizeProduct = (p) => ({
    ...p,
    id:              p.id              ?? p.productId       ?? p.product_id,
    name:            p.name            || p.productName     || p.product_name    || '',
    price:           parseFloat(p.price ?? p.unitPrice ?? p.unit_price ?? p.sellingPrice ?? p.selling_price ?? 0),
    quantity:        parseInt(p.quantity ?? p.stock ?? p.stockQuantity ?? p.stock_quantity ?? 0, 10),
    uom:             p.uom             || p.unit            || p.unitOfMeasure   || p.unit_of_measure || 'pcs',
    division:        p.division        || p.category?.name  || p.categoryName    || p.category_name   || p.divisionName || '',
    salableStock:    parseInt(p.salableStock    ?? p.salable_stock    ?? p.availableStock ?? p.available_stock ?? p.quantity ?? 0, 10),
    unsaleableStock: parseInt(p.unsaleableStock ?? p.unsaleable_stock ?? p.damagedStock   ?? p.damaged_stock  ?? 0, 10),
    expiryDate:      p.expiryDate      || p.expiry_date     || p.expiry          || '',
  });

  // Normalize customer fields
  const normalizeCustomer = (c) => ({
    ...c,
    id:      c.id      ?? c.customerId    ?? c.customer_id,
    name:    c.name    || c.customerName  || c.customer_name  || c.fullName || c.full_name || '',
    email:   c.email   || c.emailAddress  || c.email_address  || '',
    phone:   c.phone   || c.phoneNumber   || c.phone_number   || c.mobile   || c.mobileNumber || '',
    address: c.address || c.streetAddress || c.street_address || '',
    state:   c.state   || c.stateName     || c.state_name     || '',
    pincode: c.pincode || c.pinCode       || c.pin_code       || c.zipCode  || c.zip_code || c.postalCode || '',
  });

  useEffect(() => {
    if (!token) return;
    getCustomers().then(d => setCustomers((Array.isArray(d) ? d : []).map(normalizeCustomer))).catch(() => {
      const s = localStorage.getItem('customers'); if (s) setCustomers(JSON.parse(s));
    });
    getCategories().then(d => setCategories((Array.isArray(d) ? d : []).map(normalizeCategory))).catch(() => {
      const s = localStorage.getItem('categories'); if (s) setCategories(JSON.parse(s));
    });
    getProducts().then(d => setProducts((Array.isArray(d) ? d : []).map(normalizeProduct))).catch(() => {
      const s = localStorage.getItem('products'); if (s) setProducts(JSON.parse(s));
    });
    getOrders().then(d => setOrders((Array.isArray(d) ? d : []).map(normalizeOrder))).catch(() => {
      const s = localStorage.getItem('orders'); if (s) setOrders(JSON.parse(s));
    });
  }, [token]);

  const setAuthToken = (newToken) => {
    if (newToken) localStorage.setItem('authToken', newToken);
    else localStorage.removeItem('authToken');
    setToken(newToken);
  };

  const clearData = () => {
    setCustomers([]); setCategories([]); setProducts([]);
    setOrders([]); setRegisteredUsers([]); setNotifications([]);
  };

  // ── Customers ──────────────────────────────────────────────────────────────
  const addCustomer = async (customer) => {
    try {
      const n = normalizeCustomer(await createCustomer(customer));
      setCustomers(prev => [...prev, n]);
      addNotification(`New customer '${n.name}' added`);
      return n;
    } catch {
      const n = normalizeCustomer({ id: Date.now(), ...customer });
      setCustomers(prev => { const u = [...prev, n]; localStorage.setItem('customers', JSON.stringify(u)); return u; });
      addNotification(`New customer '${n.name}' added`);
      return n;
    }
  };

  const updateCustomer = async (id, data) => {
    try {
      const u = normalizeCustomer(await updateCust(id, data));
      setCustomers(prev => prev.map(c => String(c.id) === String(id) ? u : c));
    } catch {
      setCustomers(prev => { const u = prev.map(c => String(c.id) === String(id) ? { ...c, ...data } : c); localStorage.setItem('customers', JSON.stringify(u)); return u; });
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await deleteCust(id);
      setCustomers(prev => prev.filter(c => String(c.id) !== String(id)));
    } catch {
      setCustomers(prev => { const u = prev.filter(c => String(c.id) !== String(id)); localStorage.setItem('customers', JSON.stringify(u)); return u; });
    }
  };

  // ── Categories ─────────────────────────────────────────────────────────────
  const addCategory = async (category) => {
    try {
      const n = normalizeCategory(await createCategory(category));
      setCategories(prev => [...prev, n]);
      addNotification(`New category '${n.name}' created`);
      return n;
    } catch {
      const n = normalizeCategory({ id: Date.now(), ...category });
      setCategories(prev => { const u = [...prev, n]; localStorage.setItem('categories', JSON.stringify(u)); return u; });
      addNotification(`New category '${n.name}' created`);
      return n;
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const u = normalizeCategory(await updateCat(id, data));
      setCategories(prev => prev.map(c => c.id === id ? u : c));
    } catch {
      setCategories(prev => { const u = prev.map(c => c.id === id ? { ...c, ...data } : c); localStorage.setItem('categories', JSON.stringify(u)); return u; });
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteCat(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch {
      setCategories(prev => { const u = prev.filter(c => c.id !== id); localStorage.setItem('categories', JSON.stringify(u)); return u; });
    }
  };

  // ── Products ───────────────────────────────────────────────────────────────
  const addProduct = async (product) => {
    try {
      const n = normalizeProduct(await createProduct(product));
      setProducts(prev => [...prev, n]);
      addNotification(`New product '${n.name}' added`);
      return n;
    } catch {
      const n = normalizeProduct({ id: Date.now(), ...product });
      setProducts(prev => { const u = [...prev, n]; localStorage.setItem('products', JSON.stringify(u)); return u; });
      addNotification(`New product '${n.name}' added`);
      return n;
    }
  };

  const updateProduct = async (id, data) => {
    try {
      const u = normalizeProduct(await updateProd(id, data));
      setProducts(prev => prev.map(p => p.id === id ? u : p));
    } catch {
      setProducts(prev => { const u = prev.map(p => p.id === id ? { ...p, ...data } : p); localStorage.setItem('products', JSON.stringify(u)); return u; });
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteProd(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      setProducts(prev => { const u = prev.filter(p => p.id !== id); localStorage.setItem('products', JSON.stringify(u)); return u; });
    }
  };

  // ── Orders ─────────────────────────────────────────────────────────────────
  const addOrder = async (order) => {
    try {
      const n = normalizeOrder(await createOrder(order));
      setOrders(prev => [...prev, n]);
      addNotification(`New transaction #ORD-${n.id.toString().padStart(4, '0')} created`);
      return n;
    } catch {
      const n = normalizeOrder({ id: Date.now(), orderDate: new Date().toISOString().split('T')[0], ...order });
      setOrders(prev => { const u = [...prev, n]; localStorage.setItem('orders', JSON.stringify(u)); return u; });
      addNotification(`New transaction #ORD-${n.id.toString().padStart(4, '0')} created`);
      return n;
    }
  };

  const updateOrder = async (id, data) => {
    try {
      const u = normalizeOrder(await updateOrd(id, data));
      setOrders(prev => prev.map(o => o.id === id ? u : o));
    } catch {
      setOrders(prev => { const u = prev.map(o => o.id === id ? { ...o, ...data } : o); localStorage.setItem('orders', JSON.stringify(u)); return u; });
    }
  };

  const deleteOrder = async (id) => {
    try {
      await deleteOrd(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch {
      setOrders(prev => { const u = prev.filter(o => o.id !== id); localStorage.setItem('orders', JSON.stringify(u)); return u; });
    }
  };

  // ── Users ──────────────────────────────────────────────────────────────────
  const registerUser = async (userData) => {
    try {
      const result = await apiRegisterUser(userData);
      const n = {
        id: result?.id ?? result?.data?.id ?? Date.now(),
        name: userData.name,
        username: userData.username || '',
        email: userData.email,
        phone: userData.phone || '',
        role: result?.role || result?.data?.role || 'user',
        registeredAt: new Date().toISOString(),
      };
      setRegisteredUsers(prev => { const u = [...prev, n]; localStorage.setItem('registeredUsers', JSON.stringify(u)); return u; });
      addNotification(`New user '${n.name}' registered`);
      return n;
    } catch {
      const n = { id: Date.now(), name: userData.name, username: userData.username || '', email: userData.email, phone: userData.phone || '', role: 'user', registeredAt: new Date().toISOString() };
      setRegisteredUsers(prev => { const u = [...prev, n]; localStorage.setItem('registeredUsers', JSON.stringify(u)); return u; });
      addNotification(`New user '${n.name}' registered`);
      return n;
    }
  };

  const value = {
    token, setAuthToken, clearData,
    customers, categories, products, orders, registeredUsers, notifications,
    addNotification,
    addCustomer, updateCustomer, deleteCustomer,
    addCategory, updateCategory, deleteCategory,
    addProduct, updateProduct, deleteProduct,
    addOrder, updateOrder, deleteOrder,
    registerUser,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
