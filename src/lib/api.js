// API Client simplificado para desenvolvimento
const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async register(username, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async checkAuth() {
    return this.request('/auth/check');
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Wallet methods
  async getWallets() {
    return this.request('/wallets');
  }

  async addWallet(nickname, address) {
    return this.request('/wallets', {
      method: 'POST',
      body: JSON.stringify({ nickname, address }),
    });
  }

  async deleteWallet(walletId) {
    return this.request(`/wallets/${walletId}`, { method: 'DELETE' });
  }

  async syncWallet(walletId) {
    return this.request(`/wallets/${walletId}/sync`, { method: 'POST' });
  }

  async syncAllWallets() {
    return this.request('/wallets/sync-all', { method: 'POST' });
  }

  async refreshBalances() {
    return this.request('/wallets/refresh-balances', { method: 'POST' });
  }

  async validateAddress(address) {
    return this.request('/wallets/validate-address', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  // Transaction methods
  async getSentTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions/sent?${query}`);
  }

  async getReceivedTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions/received?${query}`);
  }

  async getDuplicateTransactions() {
    return this.request('/transactions/duplicates');
  }

  async updateTransaction(transactionId, data) {
    return this.request(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTransactionReceipt(transactionId) {
    return this.request(`/transactions/${transactionId}/receipt`);
  }

  async detectDuplicates() {
    return this.request('/transactions/detect-duplicates', { method: 'POST' });
  }
}

export const apiClient = new ApiClient();

