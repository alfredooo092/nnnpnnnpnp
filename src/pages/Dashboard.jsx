import { useState, useEffect } from 'react';
import tronService from '../services/tronService';
import storageService from '../services/storageService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalSent: 0,
    totalReceived: 0,
    duplicates: 0,
    totalTransactions: 0,
    activeWallets: 0
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      const wallets = storageService.loadWallets();
      let totalBalance = 0;
      let totalSent = 0;
      let totalReceived = 0;
      let allTransactions = [];
      
      console.log('Carregando dados de', wallets.length, 'carteiras');
      
      // Calcular estatísticas de todas as carteiras
      for (const wallet of wallets) {
        try {
          console.log('Buscando saldo da carteira:', wallet.address);
          
          // Buscar saldo real da carteira
          const balanceResult = await tronService.getUSDTBalance(wallet.address);
          console.log('Saldo encontrado:', balanceResult);
          
          // Extrair o valor do balance do objeto retornado
          const balance = balanceResult?.balance || balanceResult || 0;
          console.log('Balance extraído:', balance);
          
          if (!isNaN(balance) && balance > 0) {
            totalBalance += balance;
          }
          
          // Buscar transações da carteira
          const transactions = await tronService.getUSDTTransactions(wallet.address);
          console.log('Transações encontradas:', transactions.length);
          
          allTransactions = allTransactions.concat(transactions);
          
        } catch (err) {
          console.error(`Erro ao carregar dados da carteira ${wallet.address}:`, err);
        }
      }
      
      console.log('Total balance calculado:', totalBalance);
      
      // Calcular totais de transações
      allTransactions.forEach(tx => {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.type === 'sent') {
          totalSent += amount;
        } else if (tx.type === 'received') {
          totalReceived += amount;
        }
      });
      
      // Detectar duplicatas (transações com mesmo valor)
      const duplicates = findDuplicateTransactions(allTransactions);
      
      // Garantir que os valores não sejam NaN
      const finalStats = {
        totalBalance: isNaN(totalBalance) ? 0 : totalBalance,
        totalSent: isNaN(totalSent) ? 0 : totalSent,
        totalReceived: isNaN(totalReceived) ? 0 : totalReceived,
        duplicates: duplicates.length,
        totalTransactions: allTransactions.length,
        activeWallets: wallets.length
      };
      
      console.log('Stats finais:', finalStats);
      setStats(finalStats);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      // Em caso de erro, mostrar valores zerados em vez de NaN
      setStats({
        totalBalance: 0,
        totalSent: 0,
        totalReceived: 0,
        duplicates: 0,
        totalTransactions: 0,
        activeWallets: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSaldos = async () => {
    setIsUpdating(true);
    await loadDashboardData();
    setIsUpdating(false);
  };

  const findDuplicateTransactions = (transactions) => {
    const duplicates = [];
    const amounts = {};
    
    transactions.forEach(tx => {
      const amount = tx.amount.toString();
      if (amounts[amount]) {
        duplicates.push(tx);
      } else {
        amounts[amount] = true;
      }
    });
    
    return duplicates;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>🔄 Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold' }}>Dashboard</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>Visão geral das suas carteiras USDT TRC20</p>
          {lastUpdate && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
              Última atualização: {lastUpdate.toLocaleString('pt-PT')}
            </p>
          )}
        </div>
        <button
          onClick={handleUpdateSaldos}
          disabled={isUpdating}
          style={{
            backgroundColor: isUpdating ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1rem' }}>{isUpdating ? '⏳' : '🔄'}</span>
          {isUpdating ? 'Atualizando...' : 'Atualizar Saldos'}
        </button>
      </div>

      {/* Cards de estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Saldo Total */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Saldo Total</h3>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {formatCurrency(stats.totalBalance)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {stats.activeWallets} carteiras ativas
          </div>
        </div>

        {/* Total Enviado */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Total Enviado</h3>
            <span style={{ fontSize: '1.5rem' }}>📤</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#dc2626' }}>
            {formatCurrency(stats.totalSent)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Transações de saída
          </div>
        </div>

        {/* Total Recebido */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Total Recebido</h3>
            <span style={{ fontSize: '1.5rem' }}>📥</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#16a34a' }}>
            {formatCurrency(stats.totalReceived)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Transações de entrada
          </div>
        </div>

        {/* Transações Duplicadas */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Transações Duplicadas</h3>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.duplicates}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Possíveis duplicatas
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>Resumo Geral</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {formatCurrency(stats.totalBalance)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Balanço Líquido
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280' }}>
              {stats.totalTransactions}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Total de Transações
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280' }}>
              {stats.activeWallets}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Carteiras Ativas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

