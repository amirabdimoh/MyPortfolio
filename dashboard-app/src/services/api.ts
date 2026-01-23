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

export const projectsAPI = {
  getAll: (params?: string) => {
    const query = params ? `?${params}` : '';
    return apiRequest(`/projects${query}`);
  },
  
  getOne: (id: number) => apiRequest(`/projects/${id}`),
  
  create: (data: any) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    apiRequest(`/projects/${id}`, { method: 'DELETE' }),
};

export const tasksAPI = {
  getAll: (params?: string) => {
    const query = params ? `?${params}` : '';
    return apiRequest(`/tasks${query}`);
  },
  
  getOne: (id: number) => apiRequest(`/tasks/${id}`),
  
  create: (data: any) =>
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
};

export const usersAPI = {
  getAll: (params?: string) => {
    const query = params ? `?${params}` : '';
    return apiRequest(`/users${query}`);
  },
  
  getOne: (id: number) => apiRequest(`/users/${id}`),
  
  create: (data: any) =>
    apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateRole: (id: number, role: string) =>
    apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  
  updateStatus: (id: number, isActive: boolean) =>
    apiRequest(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    }),
  
  delete: (id: number) =>
    apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats'),
  getMyDashboard: () => apiRequest('/dashboard/my-dashboard'),
};
