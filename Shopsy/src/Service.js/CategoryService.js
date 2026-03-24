import apiFetch from './apiClient.js';

const BASE = '/api/v1/categories';

export const getCategories   = ()         => apiFetch(BASE);
export const getCategory     = (id)       => apiFetch(`${BASE}/${id}`);
export const createCategory  = (data)     => apiFetch(BASE,           { method: 'POST',   body: JSON.stringify(data) });
export const updateCategory  = (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteCategory  = (id)       => apiFetch(`${BASE}/${id}`, { method: 'DELETE' });

export default { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
