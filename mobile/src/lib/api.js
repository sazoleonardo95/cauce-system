import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://cauce-system-production.up.railway.app/api';

class ApiClient {
  constructor() {
    this.token = null;
  }

  async setToken(token) {
    this.token = token;
    await SecureStore.setItemAsync('token', token);
  }

  async clearToken() {
    this.token = null;
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  async loadToken() {
    this.token = await SecureStore.getItemAsync('token');
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error en la peticion');
    }

    return data;
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // Auth
  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  register(data) {
    return this.post('/auth/register', data);
  }

  getProfile() {
    return this.get('/auth/profile');
  }

  // Dashboard
  getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  // Products
  getProducts(params) {
    const query = new URLSearchParams(params || {}).toString();
    return this.get(`/products?${query}`);
  }

  // Warehouses
  getWarehouses() {
    return this.get('/warehouses');
  }

  // Inventory
  getInventory(params) {
    const query = new URLSearchParams(params || {}).toString();
    return this.get(`/inventory?${query}`);
  }

  adjustStock(data) {
    return this.post('/inventory/adjust', data);
  }

  // Sales
  getSales(params) {
    const query = new URLSearchParams(params || {}).toString();
    return this.get(`/sales?${query}`);
  }

  createSale(data) {
    return this.post('/sales', data);
  }

  // Customers
  getCustomers(params) {
    const query = new URLSearchParams(params || {}).toString();
    return this.get(`/customers?${query}`);
  }
}

export const api = new ApiClient();
export default api;
