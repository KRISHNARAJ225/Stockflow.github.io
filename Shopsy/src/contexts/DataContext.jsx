import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const API_BASE_URL = "https://5thq69dw-8080.inc1.devtunnels.ms/";

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    const savedCategories = localStorage.getItem('categories');
    const savedProducts = localStorage.getItem('products');
    const savedOrders = localStorage.getItem('orders');
    const savedUsers = localStorage.getItem('registeredUsers');

    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    } else {
      const sampleUsers = [
        { id: 1, name: 'Manisha', email: 'Manisha@example.com', phone: '9890878989', role: 'admin' }
      ];
      setRegisteredUsers(sampleUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(sampleUsers));
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Initialize with sample data
      const sampleCustomers = [
        { id: 1, name: 'Ramesh', email: 'ramesh@gmail.com', phone: '9876543210' },
        { id: 2, name: 'stuart', email: 'stuart@gmail.com', phone: '9878987890' },
        { id: 3, name: 'suresh', email: 'suresh@gmail.com', phone: '9213456789' }
      ];
      setCustomers(sampleCustomers);
      localStorage.setItem('customers', JSON.stringify(sampleCustomers));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Initialize with sample data
      const sampleCategories = [
        { id: 1, name: 'Electronics', type: 'Physical Goods' },
        { id: 2, name: 'Clothing', type: 'Physical Goods' },
        { id: 3, name: 'Books', type: 'Physical Goods' }
      ];
      setCategories(sampleCategories);
      localStorage.setItem('categories', JSON.stringify(sampleCategories));
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Initialize with sample data
      const sampleProducts = [
        { id: 1, name: 'Laptop Pro 15"', price: 1299.99, quantity: 45 },
        { id: 2, name: 'Wireless Mouse', price: 29.99, quantity: 120 },
        { id: 3, name: 'USB-C Hub', price: 49.99, quantity: 78 }
      ];
      setProducts(sampleProducts);
      localStorage.setItem('products', JSON.stringify(sampleProducts));
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Initialize with sample data
      const sampleOrders = [
        {
          id: 1,
          customerName: 'Ramesh',
          customerEmail: 'ramesh@gmail.com',
          customerPhone: '9876543210',
          orderDate: '2024-01-15',
          shippingDate: '2024-01-17',
          shippingAddress: '57,New Cross cut,Bangalore',
          paymentStatus: 'Paid',
          orderStatus: 'Shipped',
          products: [
            { name: 'Laptop Pro 15"', quantity: 1, price: 1299.99 },
            { name: 'Wireless Mouse', quantity: 2, price: 29.99 }
          ],
          totalAmount: 1359.97
        }
      ];
      setOrders(sampleOrders);
      localStorage.setItem('orders', JSON.stringify(sampleOrders));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('customers', JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (registeredUsers.length > 0) {
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
  }, [registeredUsers]);

  // Notifications
  const addNotification = (message) => {
    setNotifications(prev => [{ id: Date.now(), message, date: new Date().toISOString() }, ...prev]);
  };

  // Customer operations
  const addCustomer = (customer) => {
    const newCustomer = {
      id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
      ...customer
    };
    setCustomers([...customers, newCustomer]);
    addNotification(`New customer '${newCustomer.name}' added`);
    return newCustomer;
  };

  const updateCustomer = (id, updatedCustomer) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updatedCustomer } : c));
  };

  const deleteCustomer = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Category operations
  const addCategory = (category) => {
    const newCategory = {
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      ...category
    };
    setCategories([...categories, newCategory]);
    addNotification(`New category '${newCategory.name}' created`);
    return newCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...updatedCategory } : c));
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // Product operations
  const addProduct = (product) => {
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      ...product
    };
    setProducts([...products, newProduct]);
    addNotification(`New product '${newProduct.name}' added`);
    return newProduct;
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Order operations
  const addOrder = (order) => {
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      orderDate: new Date().toISOString().split('T')[0],
      ...order
    };
    setOrders([...orders, newOrder]);
    addNotification(`New transaction #ORD-${newOrder.id.toString().padStart(4, '0')} created`);
    return newOrder;
  };

  const updateOrder = (id, updatedOrder) => {
    setOrders(orders.map(o => o.id === id ? { ...o, ...updatedOrder } : o));
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  // User operations
  const registerUser = (userData) => {
    const newUser = {
      id: registeredUsers.length > 0 ? Math.max(...registeredUsers.map(u => u.id)) + 1 : 1,
      ...userData,
      role: 'user',
      registeredAt: new Date().toISOString()
    };
    setRegisteredUsers([...registeredUsers, newUser]);
    return newUser;
  };

  const value = {
    customers,
    categories,
    products,
    orders,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    deleteOrder,
    registeredUsers,
    registerUser,
    notifications
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
