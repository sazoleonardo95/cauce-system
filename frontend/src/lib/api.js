const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
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

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
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

  getTeamPerformance(params) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/dashboard/team?${query}`);
  }

  // Products
  getProducts(params) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/products?${query}`);
  }

  getProduct(id) {
    return this.get(`/products/${id}`);
  }

  createProduct(data) {
    return this.post('/products', data);
  }

  updateProduct(id, data) {
    return this.put(`/products/${id}`, data);
  }

  deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  getCategories() {
    return this.get('/products/categories');
  }

  // Warehouses
  getWarehouses() {
    return this.get('/warehouses');
  }

  createWarehouse(data) {
    return this.post('/warehouses', data);
  }

  // Inventory
  getInventory(params) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/inventory?${query}`);
  }

  adjustStock(data) {
    return this.post('/inventory/adjust', data);
  }

  getStockMovements(params) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/inventory/movements?${query}`);
  }

  // Sales
  getSales(params) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/sales?${query}`);
  }

  createSale(data) {
    return this.post('/sales', data);
  }

  getSale(id) {
    return this.get(`/sales/${id}`);
  }

  cancelSale(id) {
    return this.patch(`/sales/${id}/cancel`);
  }

  // Customers
  getCustomers(params) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/customers?${query}`);
  }

  createCustomer(data) {
    return this.post('/customers', data);
  }

  // Invitations
  getInvitations() {
    return this.get('/invitations');
  }

  createInvitation(data) {
    return this.post('/invitations', data);
  }

  acceptInvitation(data) {
    return this.post('/invitations/accept', data);
  }

  cancelInvitation(id) {
    return this.patch(`/invitations/${id}/cancel`);
  }

  resendInvitation(id) {
    return this.post(`/invitations/${id}/resend`);
  }
}

export const api = new ApiClient();
export default api;
