import { useState, useEffect } from 'react';
import tronService from '../services/tronService';
import storageService from '../services/storageService';

const ReceivedTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const wallets = storageService.loadWallets();
      let allTransactions = [];
      
      // Buscar transações de todas as carteiras
      for (const wallet of wallets) {
        try {
          const txs = await tronService.getUSDTTransactions(wallet.address);
          const receivedTxs = txs.filter(tx => tx.type === 'received');
          allTransactions = allTransactions.concat(receivedTxs);
        } catch (err) {
          console.error(`Erro ao buscar transações da carteira ${wallet.address}:`, err);
        }
      }
      
      // Ordenar por data (mais recente primeiro)
      allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setTransactions(allTransactions);
      
      // Salvar no storage
      storageService.addTransactions(allTransactions);
      
    } catch (error) {
      setError('Erro ao carregar transações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addNote = (txHash) => {
    const note = prompt('Adicionar nota:');
    if (note) {
      storageService.addNote(txHash, note);
      // Atualizar transação local
      setTransactions(prev => prev.map(tx => 
        tx.hash === txHash ? { ...tx, note } : tx
      ));
    }
  };

  const markComplete = (txHash) => {
    storageService.updateTransactionStatus(txHash, 'Completo');
    setTransactions(prev => prev.map(tx => 
      tx.hash === txHash ? { ...tx, status: 'Completo' } : tx
    ));
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
        <div>🔄 Carregando transações...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ color: '#dc2626', marginBottom: '1rem' }}>❌ {error}</div>
        <button onClick={loadTransactions} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold' }}>Transações de Entrada</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>USDT TRC20 recebido nas suas carteiras</p>
        </div>
        <button 
          onClick={loadTransactions}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Atualizar
        </button>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
          <h3>Nenhuma transação recebida</h3>
          <p>As transações recebidas nas suas carteiras aparecerão aqui</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Data/Hora</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Quantia</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>De</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Hash</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={tx.hash} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{tx.date}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#16a34a' }}>
                    +{formatCurrency(tx.amount)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    {tx.from.substring(0, 8)}...{tx.from.substring(tx.from.length - 8)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <a 
                      href={`https://tronscan.org/#/transaction/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                    </a>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: tx.status === 'Completo' ? '#dcfce7' : '#fef3c7',
                      color: tx.status === 'Completo' ? '#166534' : '#92400e'
                    }}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => addNote(tx.hash)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                        title="Adicionar Nota"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => markComplete(tx.hash)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                        title="Marcar como Completo"
                      >
                        ✅
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReceivedTransactions;

