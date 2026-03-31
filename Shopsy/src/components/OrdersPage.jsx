import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, Eye, Search, X, Calendar, MapPin, CreditCard, Package, User } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Pagination from './Pagination';

const OrdersPage = () => {
  const { orders, orderPageData, fetchOrdersPage, addOrder, updateOrder, deleteOrder, customers, products, updateProduct } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  const emptyForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingDate: '',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
    customerId: '',
    productId: '',
    products: [{ name: '', quantity: 1, price: '' }],
    gst: 0,
    tax: 0,
    discount: 0
  };

  const [formData, setFormData] = useState(emptyForm);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrdersPage(currentPage - 1, itemsPerPage, searchTerm);
  }, [currentPage, searchTerm]);

  const paymentStatuses = ['PENDING' ,'SUCCESS'];
  const orderStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED' ,'CANCELLED'];

  const displayedOrders = orderPageData.content.filter(order => {
    const s = searchTerm.toLowerCase();
    return (
      (order.customerName  || '').toLowerCase().includes(s) ||
      (order.customerEmail || '').toLowerCase().includes(s) ||
      String(order.id || '').includes(s) ||
      (order.paymentStatus || '').toLowerCase().includes(s) ||
      (order.orderStatus   || '').toLowerCase().includes(s)
    );
  });

  const calcTotal = (fd) => {
    const subtotal = fd.products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.price || 0)), 0);
    return subtotal + parseFloat(fd.gst || 0) + parseFloat(fd.tax || 0) - parseFloat(fd.discount || 0);
  };

  const buildPayload = (fd) => {
    const cid = fd.customerId;
    const pid = fd.productId ? Number(fd.productId) : null;
    const orderItems = fd.products
      .filter(p => p.price)
      .map(p => ({
        productId: pid,
        name:      p.name || '',
        quantity:  Number(p.quantity) || 1,
        price:     parseFloat(p.price)
      }));
    const finalItems = orderItems.length > 0 ? orderItems
      : [{ productId: pid, name: fd.products[0]?.name || '', quantity: 1, price: 0 }];
    const payload = {
      customerName:    fd.customerName || '',
      customerEmail:   fd.customerEmail || '',
      customerPhone:   fd.customerPhone || '',
      shippingAddress: fd.shippingAddress || '',
      shippingDate:    fd.shippingDate || '',
      paymentStatus:   fd.paymentStatus,
      orderStatus:     fd.orderStatus,
      orderItems:      finalItems,
      gst:         parseFloat(fd.gst      || 0),
      tax:         parseFloat(fd.tax      || 0),
      discount:    parseFloat(fd.discount || 0),
      totalAmount: calcTotal(fd),
    };
    if (cid) payload.customerId = isNaN(Number(cid)) ? cid : Number(cid);
    if (pid) payload.productId = pid;
    return payload;
  };

  const handleAddOrder = () => {
    if (!formData.customerId) { alert('Please select a valid Customer ID'); return; }
    if (!formData.productId)  { alert('Please select a valid Product ID');  return; }
    if (!formData.shippingAddress) { alert('Please enter a valid shipping address'); return; }
    if (!formData.customerName) { alert('Please select a customer with valid details'); return; }
    addOrder({ ...buildPayload(formData), orderDate: new Date().toISOString().split('T')[0] });
    setFormData(emptyForm);
    setShowAddModal(false);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setFormData({
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      shippingAddress: order.shippingAddress || '',
      shippingDate: order.shippingDate || '',
      paymentStatus: order.paymentStatus || 'PENDING',
      orderStatus: order.orderStatus || 'PENDING',
      customerId: order.customerId || '',
      productId: order.productId || '',
      products: order.products?.length ? [...order.products] : [{ name: '', quantity: 1, price: '' }],
      gst: order.gst || 0,
      tax: order.tax || 0,
      discount: order.discount || 0
    });
  };

  const handleUpdateOrder = () => {
    updateOrder(editingOrder.id, buildPayload(formData));
    setEditingOrder(null);
    setFormData(emptyForm);
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    const order = orders.find(o => String(o.id) === String(id));
    if (order && order.products) {
      for (const item of order.products) {
        const product = products.find(p => String(p.id) === String(item.productId));
        if (product) {
          const newQty = parseInt(product.quantity || 0) + parseInt(item.quantity || 0);
          await updateProduct(product.id, { ...product, quantity: newQty }, { localOnly: true });
        }
      }
    }
    deleteOrder(id);
  };

  const handleCustomerSelect = (e) => {
    const custName = e.target.value;
    const customer = customers.find(c => c.name === custName);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address ? `${customer.address}, ${customer.state || ''} ${customer.pincode || ''}`.trim() : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, customerName: custName }));
    }
  };

  const handleCustomerIdSelect = (e) => {
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({ ...prev, customerId: '', customerName: '', customerEmail: '', customerPhone: '', shippingAddress: '' }));
      return;
    }
    const customer = customers.find(c =>
      String(c.id || '') === String(val) ||
      String(c.customerId || '') === String(val) ||
      String(c.customer_id || '') === String(val) ||
      String(c._id || '') === String(val) ||
      String(c.cid || '') === String(val)
    );
    if (customer) {
      const name    = customer.name    || customer.customerName  || customer.customer_name  || customer.fullName || customer.full_name || '';
      const email   = customer.email   || customer.emailAddress  || customer.email_address  || '';
      const phone   = customer.phone   || customer.phoneNumber   || customer.phone_number   || customer.mobile   || customer.mobileNumber || '';
      const address = customer.address || customer.streetAddress || customer.street_address || '';
      const state   = customer.state   || customer.stateName     || customer.state_name     || '';
      const pincode = customer.pincode || customer.pinCode       || customer.pin_code       || customer.zipCode  || customer.zip_code || '';
      
      const addressParts = [address, state, pincode].filter(part => part && part.trim());
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';
      
      setFormData(prev => ({
        ...prev,
        customerId:      val,
        customerName:    name,
        customerEmail:   email,
        customerPhone:   phone,
        shippingAddress: fullAddress
      }));
    } else {
      setFormData(prev => ({ ...prev, customerId: val, customerName: '', customerEmail: '', customerPhone: '', shippingAddress: '' }));
    }
  };

  const handleProductIdSelect = (e) => {
    const val = e.target.value;
    const product = products.find(p =>
      String(p.id || '') === String(val) ||
      String(p.productId || '') === String(val) ||
      String(p.product_id || '') === String(val)
    );
    if (product) {
      const productName = product.name || product.productName || '';
      const productPrice = product.price || product.unitPrice || product.sellingPrice || '';
      setFormData(prev => ({
        ...prev,
        productId: val,
        products: [
          { name: productName, quantity: prev.products[0]?.quantity || 1, price: productPrice },
          ...prev.products.slice(1)
        ]
      }));
    } else {
      setFormData(prev => ({ ...prev, productId: val }));
    }
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
  };

  const addProductField = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', quantity: 1, price: '' }]
    });
  };

  const updateProductField = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setFormData({ ...formData, products: updatedProducts });
  };

  const removeProductField = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'SUCCESS': return 'green';
      case 'PENDING': return 'red';
      default: return 'gray';
    }
  };

  const getOrderStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'PENDING': return 'yellow';
      case 'CANCELLED': return 'red';
      case  'SHIPPED': return 'orange'
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-400">Transactions</h1>
          <p className="text-sm text-gray-400">Manage your order transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-6 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm cursor-pointer"
          >
            <Plus className="w-5 h-5 font-bold" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors">
                <ShoppingCart className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-blue-500 transition-colors">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{orders.length.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-600 transition-colors">
                <Calendar className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-orange-500 transition-colors">Pending Orders</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">{orders.filter(o => o.orderStatus === 'Processing').length.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-600 transition-colors">
                <CreditCard className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-emerald-500 transition-colors">Paid Orders</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">{orders.filter(o => o.paymentStatus === 'Paid').length.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-200 transition-all duration-300 group cursor-pointer w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-600 transition-colors">
                <Package className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-purple-500 transition-colors">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-purple-600 transition-colors">
              ${orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-900 text-gray-400 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer ID</th>
                <th className="px-6 py-4 font-semibold">Customer Name</th>
                <th className="px-6 py-4 font-semibold">Product ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>

            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {displayedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/50 hover:outline hover:outline-2 hover:outline-blue-400 hover:-translate-y-0.5 transition-all text-sm group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #ORD-{String(order.id).padStart(4, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{order.customerId || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{order.customerName || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{order.productId || (order.products && order.products[0]?.productId) || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">
                      {(order.products && order.products[0]?.name) || (order.products && order.products[0]?.productName) || 'Product'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ${(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleViewOrder(order)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEditOrder(order)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={orderPageData.totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

        {/* Add Order Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Order</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID <span className="text-red-500">*</span></label>
                    <select
                      value={formData.customerId}
                      onChange={handleCustomerIdSelect}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => {
                        const cid = c.id || c.customerId || c.customer_id || c._id || c.cid || '';
                        const cname = c.name || c.customerName || c.fullName || 'Unknown';
                        return <option key={String(cid || cname)} value={String(cid)}>{cname} (ID: {cid})</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID <span className="text-red-500">*</span></label>
                    <select
                      value={formData.productId}
                      onChange={handleProductIdSelect}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => {
                        const pid = p.id || p.productId || p.product_id || p._id || '';
                        const pname = p.name || p.productName || 'Unknown';
                        const pprice = p.price || p.unitPrice || p.sellingPrice || '';
                        return <option key={String(pid || pname)} value={String(pid)}>{pname} (ID: {pid}) {pprice ? `- $${pprice}` : ''}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-black text-white cursor-not-allowed"
                      placeholder="Auto-filled from Customer ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-black text-white cursor-not-allowed"
                      placeholder="Auto-filled from Customer ID"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.shippingAddress}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-black text-white cursor-not-allowed"
                    placeholder="Auto-filled from Customer ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                    <input
                      type="date"
                      value={formData.shippingDate}
                      onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Products
                    </label>
                    <button
                      type="button"
                      onClick={addProductField}
                      className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4  text-gray-400"/>
                      Add Product
                    </button>
                  </div>
                  <datalist id="product-suggestions">
                    {products.map(p => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                  {formData.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <input
                        type="text"
                        list="product-suggestions"
                        value={product.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateProductField(index, 'name', val);
                          const matchedProduct = products.find(p => p.name === val);
                          if (matchedProduct) {
                            updateProductField(index, 'price', matchedProduct.price);
                          }
                        }}
                        className="col-span-5 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                        placeholder="Select or enter product"
                      />
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProductField(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProductField(index, 'price', e.target.value)}
                        className="col-span-3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                        placeholder="Price"
                      />
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductField(index)}
                          className="col-span-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.gst}
                      onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddOrder}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Add Order
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Order #{editingOrder.id}</h2>
                <button onClick={() => { setEditingOrder(null); setFormData(emptyForm); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                    <select
                      value={formData.customerId}
                      onChange={handleCustomerIdSelect}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => {
                        const cid = c.id || c.customerId || c.customer_id || c._id || c.cid || '';
                        const cname = c.name || c.customerName || c.fullName || 'Unknown';
                        return <option key={String(cid || cname)} value={String(cid)}>{cname} (ID: {cid})</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                    <select
                      value={formData.productId}
                      onChange={handleProductIdSelect}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => {
                        const pid = p.id || p.productId || p.product_id || p._id || '';
                        const pname = p.name || p.productName || 'Unknown';
                        const pprice = p.price || p.unitPrice || p.sellingPrice || '';
                        return <option key={String(pid || pname)} value={String(pid)}>{pname} (ID: {pid}) {pprice ? `- $${pprice}` : ''}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" list="edit-customer-suggestions" value={formData.customerName} onChange={handleCustomerSelect}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" />
                    <datalist id="edit-customer-suggestions">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                    <input type="email" value={formData.customerEmail} onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                  <input type="text" value={formData.shippingAddress} onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Date</label>
                    <input type="date" value={formData.shippingDate} onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select value={formData.paymentStatus} onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white">
                      {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <select value={formData.orderStatus} onChange={(e) => setFormData(prev => ({ ...prev, orderStatus: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white">
                      {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Products</label>
                    <button type="button" onClick={addProductField} className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4 text-gray-400" /> Add Product
                    </button>
                  </div>
                  <datalist id="edit-product-suggestions">{products.map(p => <option key={p.id} value={p.name} />)}</datalist>
                  {formData.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <input type="text" list="edit-product-suggestions" value={product.name}
                        onChange={(e) => { const val = e.target.value; updateProductField(index, 'name', val); const m = products.find(p => p.name === val); if (m) updateProductField(index, 'price', m.price); }}
                        className="col-span-5 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" placeholder="Product" />
                      <input type="number" value={product.quantity} onChange={(e) => updateProductField(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" placeholder="Qty" />
                      <input type="number" step="0.01" value={product.price} onChange={(e) => updateProductField(index, 'price', e.target.value)}
                        className="col-span-3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" placeholder="Price" />
                      {formData.products.length > 1 && (
                        <button type="button" onClick={() => removeProductField(index)} className="col-span-2 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST ($)</label>
                    <input type="number" step="0.01" value={formData.gst} onChange={(e) => setFormData(prev => ({ ...prev, gst: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ($)</label>
                    <input type="number" step="0.01" value={formData.tax} onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount ($)</label>
                    <input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleUpdateOrder} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Update Order
                  </button>
                  <button onClick={() => { setEditingOrder(null); setFormData(emptyForm); }} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                    <p className="text-gray-900 font-mono font-bold text-blue-900">#ORD-{String(viewingOrder.id).padStart(4,'0')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                    <p className="text-gray-900">{viewingOrder.orderDate}</p>
                  </div>
                  {viewingOrder.customerId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                      <p className="text-gray-900">{viewingOrder.customerId}</p>
                    </div>
                  )}
                  {viewingOrder.productId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                      <p className="text-gray-900">{viewingOrder.productId}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900">{viewingOrder.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{viewingOrder.customerEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">{viewingOrder.customerPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Address
                      </label>
                      <p className="text-gray-900">{viewingOrder.shippingAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Date
                      </label>
                      <p className="text-gray-900">{viewingOrder.shippingDate}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Products
                  </h3>
                  <div className="space-y-2">
                    {viewingOrder.products.map((product, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                        </div>
                        <p className="font-medium">${(product.price * product.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ${viewingOrder.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  {parseFloat(viewingOrder.gst || 0) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">GST</span>
                      <span className="font-medium text-gray-900">${parseFloat(viewingOrder.gst).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(viewingOrder.tax || 0) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">${parseFloat(viewingOrder.tax).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(viewingOrder.discount || 0) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-red-600">-${parseFloat(viewingOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <h3 className="font-medium text-gray-900">Total Amount</h3>
                    <p className="text-xl font-bold text-gray-900">${viewingOrder.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getPaymentStatusColor(viewingOrder.paymentStatus)}-100 text-${getPaymentStatusColor(viewingOrder.paymentStatus)}-800`}>
                        {viewingOrder.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                      </label>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getOrderStatusColor(viewingOrder.orderStatus)}-100 text-${getOrderStatusColor(viewingOrder.orderStatus)}-800`}>
                        {viewingOrder.orderStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default OrdersPage;
