import { useState, useEffect } from 'react';
import tronService from '../services/tronService';
import storageService from '../services/storageService';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWallet, setNewWallet] = useState({ nickname: '', address: '' });
  const [error, setError] = useState('');

  // Carregar carteiras do localStorage ao inicializar
  useEffect(() => {
    loadWallets();
  }, []);

  // Carregar carteiras salvas
  const loadWallets = () => {
    setLoading(true);
    const savedWallets = storageService.loadWallets();
    setWallets(savedWallets);
    setLoading(false);
  };

  // Sincronizar saldos com a blockchain
  const syncWallets = async () => {
    if (wallets.length === 0) return;
    
    setSyncing(true);
    setError('');
    
    try {
      const updatedWallets = [];
      
      for (const wallet of wallets) {
        try {
          const balanceData = await tronService.getUSDTBalance(wallet.address);
          const updatedWallet = {
            ...wallet,
            balance: balanceData.balance,
            lastSync: balanceData.lastUpdate,
            error: balanceData.error || null
          };
          updatedWallets.push(updatedWallet);
          
          // Atualizar no storage
          storageService.updateWallet(wallet.id, {
            balance: balanceData.balance,
            lastSync: balanceData.lastUpdate
          });
        } catch (error) {
          console.error(`Erro ao sincronizar carteira ${wallet.address}:`, error);
          updatedWallets.push({
            ...wallet,
            error: error.message
          });
        }
      }
      
      setWallets(updatedWallets);
    } catch (error) {
      setError('Erro ao sincronizar carteiras: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Adicionar nova carteira
  const handleAddWallet = async (e) => {
    e.preventDefault();
    
    if (!newWallet.address.trim()) {
      setError('Endereço da carteira é obrigatório');
      return;
    }

    if (!tronService.isValidTronAddress(newWallet.address)) {
      setError('Endereço Tron inválido. Deve começar com "T" e ter 34 caracteres.');
      return;
    }

    // Verificar se já existe
    const existingWallet = wallets.find(w => w.address === newWallet.address);
    if (existingWallet) {
      setError('Esta carteira já foi adicionada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Adicionar ao storage
      const addedWallet = storageService.addWallet({
        address: newWallet.address,
        nickname: newWallet.nickname || `Carteira ${wallets.length + 1}`
      });

      // Buscar saldo inicial
      const balanceData = await tronService.getUSDTBalance(newWallet.address);
      const walletWithBalance = {
        ...addedWallet,
        balance: balanceData.balance,
        lastSync: balanceData.lastUpdate
      };

      // Atualizar no storage
      storageService.updateWallet(addedWallet.id, {
        balance: balanceData.balance,
        lastSync: balanceData.lastUpdate
      });

      // Atualizar estado
      setWallets([...wallets, walletWithBalance]);
      setNewWallet({ nickname: '', address: '' });
      setShowAddForm(false);
    } catch (error) {
      setError('Erro ao adicionar carteira: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remover carteira
  const handleRemoveWallet = (walletId) => {
    if (confirm('Tem certeza que deseja remover esta carteira?')) {
      storageService.removeWallet(walletId);
      setWallets(wallets.filter(w => w.id !== walletId));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-PT');
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem' }}>
            Minhas Carteiras
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Gerencie suas carteiras USDT TRC20
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ➕ Adicionar Carteira
        </button>
      </div>

      {/* Add Wallet Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Adicionar Nova Carteira
          </h3>
          <form onSubmit={handleAddWallet} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Apelido
              </label>
              <input
                type="text"
                value={newWallet.nickname}
                onChange={(e) => setNewWallet({ ...newWallet, nickname: e.target.value })}
                placeholder="Ex: Carteira Principal"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Endereço TRC20
              </label>
              <input
                type="text"
                value={newWallet.address}
                onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                placeholder="Ex: THPyFKcHb7...U4w6fEN94x"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6b7280' : '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? '⏳ Adicionando...' : '➕ Adicionar'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Wallets List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem' }}>
                {wallet.nickname}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem', fontFamily: 'monospace' }}>
                {wallet.address}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
                Última sincronização: {wallet.last_sync}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a' }}>
                  {formatCurrency(wallet.balance)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Saldo USDT
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSyncWallet(wallet.id)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                  title="Sincronizar"
                >
                  🔄
                </button>
                <button
                  onClick={() => handleDeleteWallet(wallet.id)}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                  title="Remover"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wallets.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Nenhuma carteira adicionada
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Adicione sua primeira carteira USDT TRC20 para começar o monitoramento
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Adicionar Primeira Carteira
          </button>
        </div>
      )}
    </div>
  );
};

export default Wallets;

