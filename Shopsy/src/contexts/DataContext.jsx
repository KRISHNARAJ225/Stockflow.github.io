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
    if (!o) return o;
    // Handle customer as object or first element of array
    const custObj = Array.isArray(o.customer) ? o.customer[0] : (o.customer || {});
    
    const cid = o.customerId || o.customer_id || custObj?.id || custObj?.customerId || custObj?.customer_id || '';
    const pid = o.productId  || o.product_id  || o.product?.id  || '';
    
    // Improved customer info extraction
    const custName  = o.customerName  || o.customer_name  || custObj?.name  || custObj?.customerName || custObj?.fullName || (typeof o.customer === 'string' ? o.customer : '') || '';
    const custEmail = o.customerEmail || o.customer_email || custObj?.email || custObj?.emailAddress || '';
    const custPhone = o.customerPhone || o.customer_phone || custObj?.phone || custObj?.phoneNumber || '';
    
    const prods = Array.isArray(o.products)    ? o.products
                : Array.isArray(o.orderItems)  ? o.orderItems
                : Array.isArray(o.items)        ? o.items
                : Array.isArray(o.orderProducts)? o.orderProducts
                : [];
    
    // Calculate total if missing or zero
    let total = parseFloat(o.totalAmount ?? o.total_amount ?? o.total ?? o.amount ?? o.grandTotal ?? 0);
    if (total <= 0 && prods.length > 0) {
      const subtotal = prods.reduce((sum, p) => sum + ((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)), 0);
      total = subtotal + parseFloat(o.gst || 0) + parseFloat(o.tax || 0) - parseFloat(o.discount || 0);
    }

    return {
      ...o,
      id:              o.id              ?? o._id ?? o.orderId      ?? o.order_id    ?? Date.now(),
      customerId:      cid,
      productId:       pid,
      customerName:    custName,
      customerEmail:   custEmail,
      customerPhone:   custPhone,
      shippingAddress: o.shippingAddress || o.shipping_address || o.deliveryAddress || o.address || custObj?.address || '',
      shippingDate:    o.shippingDate    || o.shipping_date    || o.deliveryDate    || o.delivery_date || '',
      orderDate:       o.orderDate       || o.order_date       || o.createdAt       || o.created_at   || '',
      paymentStatus:   o.paymentStatus   || o.payment_status   || o.paymentMethod   || o.payment_method || 'Pending',
      orderStatus:     o.orderStatus     || o.order_status     || o.status          || 'Processing',
      totalAmount:     total,
      products:        prods,
    };
  };

  // Normalize category fields
  const normalizeCategory = (c) => {
    if (!c) return c;
    return {
      ...c,
      id:   c.id   ?? c.categoryId   ?? c.category_id   ?? c.divisionId   ?? c.division_id   ?? `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: c.name || c.categoryName || c.category_name || c.divisionName || c.division_name || '',
      type: c.type || c.categoryType || c.category_type || 'Physical Goods',
    };
  };

  // Normalize product fields
  const normalizeProduct = (p) => {
    if (!p) return p;
    return {
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
    };
  };

  // Normalize customer fields
  const normalizeCustomer = (c) => {
    if (!c) return c;
    return {
      ...c,
      id:        c.customerId ?? c.customer_id ?? c.customer_Id ?? c.id ?? c._id ?? c.cid,
      name:      c.name    || c.customerName  || c.customer_name  || c.fullName      || c.full_name || '',
      email:     c.email   || c.emailAddress  || c.email_address  || '',
      address:   c.address || c.streetAddress || c.street_address || '',
      state:     c.state   || c.stateName     || c.state_name     || '',
      pincode:   c.pincode || c.pinCode       || c.pin_code       || c.zipCode       || c.zip_code || c.postalCode || '',
      createdAt: c.createdAt || c.created_at  || c.createdDate    || c.create_date   || null,
    };
  };

  useEffect(() => {
    if (!token) return;
    getCustomers().then(d => setCustomers((Array.isArray(d) ? d : []).map(normalizeCustomer))).catch(() => {
      const s = localStorage.getItem('customers'); if (s) setCustomers(JSON.parse(s).map(normalizeCustomer));
    });
    getCategories().then(d => setCategories((Array.isArray(d) ? d : []).map(normalizeCategory))).catch(() => {
      const s = localStorage.getItem('categories'); if (s) setCategories(JSON.parse(s).map(normalizeCategory));
    });
    getProducts().then(d => setProducts((Array.isArray(d) ? d : []).map(normalizeProduct))).catch(() => {
      const s = localStorage.getItem('products'); if (s) setProducts(JSON.parse(s).map(normalizeProduct));
    });
    getOrders().then(d => setOrders((Array.isArray(d) ? d : []).map(normalizeOrder))).catch(() => {
      const s = localStorage.getItem('orders'); if (s) setOrders(JSON.parse(s).map(normalizeOrder));
    });

    // Load registered users from localStorage
    const savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));
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
    const now = new Date().toISOString();
    try {
      const raw = await createCustomer(customer);
      const n = normalizeCustomer({ createdAt: now, ...raw });
      setCustomers(prev => [...prev, n]);
      addNotification(`New customer '${n.name}' added`);
      return n;
    } catch {
      const n = normalizeCustomer({ id: Date.now(), createdAt: now, ...customer });
      setCustomers(prev => { const u = [...prev, n]; localStorage.setItem('customers', JSON.stringify(u)); return u; });
      addNotification(`New customer '${n.name}' added`);
      return n;
    }
  };

  const updateCustomer = async (id, data) => {
    // Optimistic: update UI immediately, fire API in background
    setCustomers(prev => { const u = prev.map(c => String(c.id) === String(id) ? { ...c, ...data } : c); localStorage.setItem('customers', JSON.stringify(u)); return u; });
    updateCust(id, data).then(res => {
      const u = normalizeCustomer(res);
      setCustomers(prev => prev.map(c => String(c.id) === String(id) ? u : c));
    }).catch(() => {/* 403 etc — local update already applied */});
  };

  const deleteCustomer = async (id) => {
    // Optimistic: remove from UI immediately, fire API in background
    setCustomers(prev => { const u = prev.filter(c => String(c.id) !== String(id)); localStorage.setItem('customers', JSON.stringify(u)); return u; });
    deleteCust(id).catch(() => {/* 403 etc — local delete already applied */});
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
    setCategories(prev => { const u = prev.map(c => String(c.id) === String(id) ? { ...c, ...data } : c); localStorage.setItem('categories', JSON.stringify(u)); return u; });
    updateCat(id, data).then(res => {
      const u = normalizeCategory(res);
      setCategories(prev => prev.map(c => String(c.id) === String(id) ? u : c));
    }).catch(() => {});
  };

  const deleteCategory = async (id) => {
    setCategories(prev => { const u = prev.filter(c => String(c.id) !== String(id)); localStorage.setItem('categories', JSON.stringify(u)); return u; });
    deleteCat(id).catch(() => {});
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

  const updateProduct = async (id, data, { localOnly = false } = {}) => {
    setProducts(prev => { const u = prev.map(p => String(p.id) === String(id) ? { ...p, ...data } : p); localStorage.setItem('products', JSON.stringify(u)); return u; });
    if (localOnly) return;
    updateProd(id, data).then(res => {
      const u = normalizeProduct(res);
      setProducts(prev => prev.map(p => String(p.id) === String(id) ? u : p));
    }).catch(() => {});
  };

  const deleteProduct = async (id) => {
    setProducts(prev => { const u = prev.filter(p => String(p.id) !== String(id)); localStorage.setItem('products', JSON.stringify(u)); return u; });
    deleteProd(id).catch(() => {});
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
    setOrders(prev => { const u = prev.map(o => String(o.id) === String(id) ? { ...o, ...data } : o); localStorage.setItem('orders', JSON.stringify(u)); return u; });
    updateOrd(id, data).then(res => {
      const u = normalizeOrder(res);
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? u : o));
    }).catch(() => {});
  };

  const deleteOrder = async (id) => {
    setOrders(prev => { const u = prev.filter(o => String(o.id) !== String(id)); localStorage.setItem('orders', JSON.stringify(u)); return u; });
    deleteOrd(id).catch(() => {});
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
