import React, { useState } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, Eye, Search, X, Save, Calendar, MapPin, CreditCard, Package, User } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const OrdersPage = () => {
  const { orders, addOrder, updateOrder, deleteOrder, customers, products } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingDate: '',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
    products: [{ name: '', quantity: 1, price: '' }],
    gst: 0,
    tax: 0,
    discount: 0
  });

  const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
  const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const s = searchTerm.toLowerCase();
    return (
      (order.customerName  || '').toLowerCase().includes(s) ||
      (order.customerEmail || '').toLowerCase().includes(s) ||
      String(order.id || '').includes(s) ||
      (order.paymentStatus || '').toLowerCase().includes(s) ||
      (order.orderStatus   || '').toLowerCase().includes(s)
    );
  });

  const handleAddOrder = () => {
    if (formData.customerName && formData.customerEmail && formData.shippingAddress) {
      const subtotal = formData.products.reduce((sum, product) => 
        sum + (product.quantity * parseFloat(product.price || 0)), 0
      );
      const totalAmount = subtotal + parseFloat(formData.gst || 0) + parseFloat(formData.tax || 0) - parseFloat(formData.discount || 0);
      
      addOrder({
        ...formData,
        orderDate: new Date().toISOString().split('T')[0],
        products: formData.products.filter(p => p.name && p.price),
        totalAmount
      });
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        shippingAddress: '',
        shippingDate: '',
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        products: [{ name: '', quantity: 1, price: '' }],
        gst: 0,
        tax: 0,
        discount: 0
      });
      setShowAddModal(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setFormData({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      shippingDate: order.shippingDate,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      products: [...order.products],
      gst: order.gst || 0,
      tax: order.tax || 0,
      discount: order.discount || 0
    });
  };

  const handleUpdateOrder = () => {
    const subtotal = formData.products.reduce((sum, product) => 
      sum + (product.quantity * parseFloat(product.price || 0)), 0
    );
    const totalAmount = subtotal + parseFloat(formData.gst || 0) + parseFloat(formData.tax || 0) - parseFloat(formData.discount || 0);
    
    updateOrder(editingOrder.id, { ...formData, totalAmount });
    setEditingOrder(null);
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      shippingDate: '',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      products: [{ name: '', quantity: 1, price: '' }],
      gst: 0,
      tax: 0,
      discount: 0
    });
  };

  const handleDeleteOrder = (id) => {
    deleteOrder(id);
  };

  const handleCustomerSelect = (e) => {
    const custName = e.target.value;
    const customer = customers.find(c => c.name === custName);
    if (customer) {
      setFormData({
        ...formData,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address ? `${customer.address}, ${customer.state || ''} ${customer.pincode || ''}`.trim() : ''
      });
    } else {
      setFormData({
        ...formData,
        customerName: custName
      });
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
      case 'Paid': return 'green';
      case 'Pending': return 'yellow';
      case 'Failed': return 'red';
      case 'Refunded': return 'gray';
      default: return 'gray';
    }
  };

  const getOrderStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'green';
      case 'Shipped': return 'blue';
      case 'Processing': return 'yellow';
      case 'Cancelled': return 'red';
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
            className="bg-blue-900 text-white px-6 py-3 rounded-xl hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center gap-2 font-semibold text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400">Total Transactions</p>
          <h3 className="text-xl font-bold text-gray-900">{orders.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400">Pending Orders</p>
          <h3 className="text-xl font-bold text-gray-900">{orders.filter(o => o.orderStatus === 'Processing').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400">Paid Orders</p>
          <h3 className="text-xl font-bold text-gray-900">{orders.filter(o => o.paymentStatus === 'Paid').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400">Total Revenue</p>
          <h3 className="text-xl font-bold text-gray-900">${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}</h3>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-900 text-gray-400 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Order Status</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded">#ORD-{order.id.toString().padStart(4, '0')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs uppercase border border-gray-100">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-[10px] text-gray-400">{order.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.orderDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${getPaymentStatusColor(order.paymentStatus)}-50 text-${getPaymentStatusColor(order.paymentStatus)}-600`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${getOrderStatusColor(order.orderStatus)}-50 text-${getOrderStatusColor(order.orderStatus)}-600`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditOrder(order)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  </div>
      </div>

        {/* Add Order Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 ">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Order</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 ">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      list="customer-suggestions"
                      value={formData.customerName}
                      onChange={handleCustomerSelect}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                      placeholder="Select or enter customer name"
                      autoComplete="off"
                    />
                    <datalist id="customer-suggestions">
                      {customers.map(c => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                      placeholder="Enter email"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Date
                    </label>
                    <input
                      type="date"
                      value={formData.shippingDate}
                      onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                    placeholder="Enter shipping address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Status
                    </label>
                    <select
                      value={formData.orderStatus}
                      onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500  bg-black text-white"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Products Section */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order ID
                    </label>
                    <p className="text-gray-900">#{viewingOrder.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Date
                    </label>
                    <p className="text-gray-900">{viewingOrder.orderDate}</p>
                  </div>
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
