const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const getAuthToken = () => localStorage.getItem('token');

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (name: string, email: string, password: string, department?: string, position?: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, department, position }),
    }),
  
  getMe: () => apiRequest('/auth/me'),
  
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

export const productsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/products${query}`);
  },
  
  getOne: (id: number) => apiRequest(`/products/${id}`),
  
  create: (data: any) =>
    apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

export const cartAPI = {
  getCart: () => apiRequest('/cart'),
  
  addItem: (productId: number, quantity: number) =>
    apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  
  updateItem: (itemId: number, quantity: number) =>
    apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  
  removeItem: (itemId: number) =>
    apiRequest(`/cart/${itemId}`, { method: 'DELETE' }),
  
  clearCart: () => apiRequest('/cart', { method: 'DELETE' }),
};

export const ordersAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/orders${query}`);
  },
  
  getOne: (id: number) => apiRequest(`/orders/${id}`),
  
  create: (data: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const eCommerceAPI = {
  getStats: () => apiRequest('/ecommerce/stats'),
  getMyECommerce: () => apiRequest('/ecommerce/my-ecommerce'),
};
