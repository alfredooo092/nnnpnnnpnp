// Serviço para persistência de dados no localStorage
class StorageService {
  constructor() {
    this.keys = {
      WALLETS: 'usdt_wallets',
      TRANSACTIONS: 'usdt_transactions',
      DUPLICATES: 'usdt_duplicates',
      NOTES: 'usdt_notes',
      USER_SETTINGS: 'usdt_settings'
    };
  }

  // Salvar dados no localStorage
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  }

  // Carregar dados do localStorage
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return defaultValue;
    }
  }

  // Remover dados do localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      return false;
    }
  }

  // Limpar todos os dados
  clear() {
    try {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }

  // === CARTEIRAS ===
  saveWallets(wallets) {
    return this.save(this.keys.WALLETS, wallets);
  }

  loadWallets() {
    return this.load(this.keys.WALLETS, []);
  }

  addWallet(wallet) {
    const wallets = this.loadWallets();
    const newWallet = {
      id: Date.now().toString(),
      address: wallet.address,
      nickname: wallet.nickname || `Carteira ${wallets.length + 1}`,
      balance: 0,
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    wallets.push(newWallet);
    this.saveWallets(wallets);
    return newWallet;
  }

  removeWallet(walletId) {
    const wallets = this.loadWallets();
    const filteredWallets = wallets.filter(w => w.id !== walletId);
    return this.saveWallets(filteredWallets);
  }

  updateWallet(walletId, updates) {
    const wallets = this.loadWallets();
    const walletIndex = wallets.findIndex(w => w.id === walletId);
    
    if (walletIndex !== -1) {
      wallets[walletIndex] = { ...wallets[walletIndex], ...updates };
      this.saveWallets(wallets);
      return wallets[walletIndex];
    }
    
    return null;
  }

  // === TRANSAÇÕES ===
  saveTransactions(transactions) {
    return this.save(this.keys.TRANSACTIONS, transactions);
  }

  loadTransactions() {
    return this.load(this.keys.TRANSACTIONS, []);
  }

  addTransactions(newTransactions) {
    const existingTransactions = this.loadTransactions();
    
    // Evitar duplicatas baseado no hash
    const existingHashes = new Set(existingTransactions.map(tx => tx.hash));
    const uniqueTransactions = newTransactions.filter(tx => !existingHashes.has(tx.hash));
    
    const allTransactions = [...existingTransactions, ...uniqueTransactions];
    
    // Ordenar por data (mais recente primeiro)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    this.saveTransactions(allTransactions);
    return uniqueTransactions.length;
  }

  updateTransactionStatus(txHash, status) {
    const transactions = this.loadTransactions();
    const txIndex = transactions.findIndex(tx => tx.hash === txHash);
    
    if (txIndex !== -1) {
      transactions[txIndex].status = status;
      this.saveTransactions(transactions);
      return true;
    }
    
    return false;
  }

  // === NOTAS ===
  saveNotes(notes) {
    return this.save(this.keys.NOTES, notes);
  }

  loadNotes() {
    return this.load(this.keys.NOTES, {});
  }

  addNote(txHash, note) {
    const notes = this.loadNotes();
    notes[txHash] = {
      text: note,
      createdAt: new Date().toISOString()
    };
    return this.saveNotes(notes);
  }

  getNote(txHash) {
    const notes = this.loadNotes();
    return notes[txHash]?.text || '';
  }

  // === DUPLICADAS ===
  saveDuplicates(duplicates) {
    return this.save(this.keys.DUPLICATES, duplicates);
  }

  loadDuplicates() {
    return this.load(this.keys.DUPLICATES, []);
  }

  markDuplicateAsLegitimate(duplicateId) {
    const duplicates = this.loadDuplicates();
    const dupIndex = duplicates.findIndex(d => d.id === duplicateId);
    
    if (dupIndex !== -1) {
      duplicates[dupIndex].status = 'legitimate';
      this.saveDuplicates(duplicates);
      return true;
    }
    
    return false;
  }

  // === CONFIGURAÇÕES ===
  saveSettings(settings) {
    return this.save(this.keys.USER_SETTINGS, settings);
  }

  loadSettings() {
    return this.load(this.keys.USER_SETTINGS, {
      autoSync: true,
      syncInterval: 30000, // 30 segundos
      notifications: true,
      theme: 'light'
    });
  }

  // === ESTATÍSTICAS ===
  getStatistics() {
    const wallets = this.loadWallets();
    const transactions = this.loadTransactions();
    const duplicates = this.loadDuplicates();

    const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
    
    const sentTransactions = transactions.filter(tx => tx.type === 'sent');
    const receivedTransactions = transactions.filter(tx => tx.type === 'received');
    
    const totalSent = sentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalReceived = receivedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    const pendingDuplicates = duplicates.filter(d => d.status === 'pending').length;

    return {
      totalBalance,
      totalSent,
      totalReceived,
      totalTransactions: transactions.length,
      pendingDuplicates,
      walletsCount: wallets.length
    };
  }
}

export default new StorageService();

