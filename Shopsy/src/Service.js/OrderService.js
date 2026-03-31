import apiFetch from './apiClient.js';

const BASE = '/api/v1/orders';

export const getOrders   = (page = 0, size = 1000, search = '') => 
  apiFetch(`${BASE}?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
export const getOrder    = (id)       => apiFetch(`${BASE}/${id}`);
export const createOrder = (data)     => apiFetch(BASE,           { method: 'POST',   body: JSON.stringify(data) });
export const updateOrder = (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteOrder = (id)       => apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getOrders, getOrder, createOrder, updateOrder, deleteOrder };
