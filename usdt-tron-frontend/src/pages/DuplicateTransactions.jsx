import { useState, useEffect } from 'react';

const DuplicateTransactions = () => {
  const [duplicates, setDuplicates] = useState([
    {
      id: 1,
      transactions: [
        {
          id: 'tx1',
          amount: 2347.34,
          date: '2025-08-01 17:44:48',
          from: 'THPyFKcHb7...U4w6fEN94x',
          to: 'TBqAP9nzYB...Qb1SSRaHfS',
          hash: '1377b1c0fe65425c0959...6ff183389fea38d406b7',
          type: 'sent'
        },
        {
          id: 'tx2',
          amount: 2347.34,
          date: '2025-08-01 17:45:12',
          from: 'THPyFKcHb7...U4w6fEN94x',
          to: 'TBqAP9nzYB...Qb1SSRaHfS',
          hash: '2488c2d1gf76536d1060...7gg294490gfb49e517c8',
          type: 'sent'
        }
      ],
      similarity: 95,
      status: 'pending'
    },
    {
      id: 2,
      transactions: [
        {
          id: 'tx3',
          amount: 19000.00,
          date: '2025-08-01 16:07:57',
          from: 'TTozbikn...vAXK9wUS1y',
          to: 'THPyFKcHb7...U4w6fEN94x',
          hash: '19359bc095d64d645f73...7a69a76246e88ad625fd',
          type: 'received'
        },
        {
          id: 'tx4',
          amount: 19000.00,
          date: '2025-08-01 16:08:23',
          from: 'TTozbikn...vAXK9wUS1y',
          to: 'THPyFKcHb7...U4w6fEN94x',
          hash: '20460cd106e75e756g84...8b70b87357f99be736ge',
          type: 'received'
        }
      ],
      similarity: 87,
      status: 'pending'
    },
    {
      id: 3,
      transactions: [
        {
          id: 'tx5',
          amount: 13200.00,
          date: '2025-08-01 17:21:36',
          from: 'TBt4YgTPrz...7q4agLkckY',
          to: 'TXRLVtDz4E...9kcQnhtdbF',
          hash: 'b6e8542a2514f414b1c9...48c0980ce44db85ccd55',
          type: 'sent'
        },
        {
          id: 'tx6',
          amount: 13200.00,
          date: '2025-08-01 17:22:01',
          from: 'TBt4YgTPrz...7q4agLkckY',
          to: 'TXRLVtDz4E...9kcQnhtdbF',
          hash: 'c7f9653b3625g525c2d0...59d1091df55ec96dde66',
          type: 'sent'
        }
      ],
      similarity: 92,
      status: 'pending'
    }
  ]);

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

  const getSimilarityColor = (similarity) => {
    if (similarity >= 90) return '#dc2626'; // Red
    if (similarity >= 80) return '#ea580c'; // Orange
    return '#ca8a04'; // Yellow
  };

  const getSimilarityBgColor = (similarity) => {
    if (similarity >= 90) return '#fee2e2'; // Red bg
    if (similarity >= 80) return '#fed7aa'; // Orange bg
    return '#fef3c7'; // Yellow bg
  };

  const handleMarkAsLegitimate = (duplicateId) => {
    if (confirm('Tem certeza que deseja marcar este grupo como legítimo?')) {
      setDuplicates(duplicates.map(d => 
        d.id === duplicateId 
          ? { ...d, status: 'legitimate' }
          : d
      ));
    }
  };

  const getTypeLabel = (type) => {
    return type === 'sent' ? 'SAÍDA' : 'ENTRADA';
  };

  const getTypeColor = (type) => {
    return type === 'sent' ? '#dc2626' : '#16a34a';
  };

  const getTypeBgColor = (type) => {
    return type === 'sent' ? '#fee2e2' : '#dcfce7';
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem' }}>
          Transações Duplicadas
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Possíveis transações duplicadas detectadas automaticamente
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
          Filtrar por similaridade:
        </label>
        <select style={{
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <option value="all">Todas</option>
          <option value="high">Alta (≥90%)</option>
          <option value="medium">Média (80-89%)</option>
          <option value="low">Baixa (&lt;80%)</option>
        </select>
        
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginLeft: '1rem' }}>
          Status:
        </label>
        <select style={{
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="legitimate">Legítimas</option>
        </select>
      </div>

      {/* Duplicates List */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {duplicates.filter(d => d.status === 'pending').map((duplicate) => (
          <div
            key={duplicate.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: '2px solid #fbbf24'
            }}
          >
            {/* Header */}
            <div style={{
              backgroundColor: getSimilarityBgColor(duplicate.similarity),
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    Possível Duplicata Detectada
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                    {duplicate.transactions.length} transações com valor idêntico
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  backgroundColor: getSimilarityBgColor(duplicate.similarity),
                  color: getSimilarityColor(duplicate.similarity),
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {duplicate.similarity}% Similaridade
                </div>
                <button
                  onClick={() => handleMarkAsLegitimate(duplicate.id)}
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Marcar como Legítima
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      Tipo
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      Data/Hora
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      Quantia
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      De/Para
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      Hash da Transação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {duplicate.transactions.map((transaction, index) => (
                    <tr key={transaction.id} style={{ 
                      borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                    }}>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontWeight: '600',
                          backgroundColor: getTypeBgColor(transaction.type),
                          color: getTypeColor(transaction.type)
                        }}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#374151' }}>
                        {formatDate(transaction.date)}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        fontSize: '0.875rem', 
                        fontWeight: '600',
                        color: transaction.type === 'sent' ? '#dc2626' : '#16a34a'
                      }}>
                        {transaction.type === 'sent' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#374151', fontFamily: 'monospace' }}>
                        <div>De: {transaction.from}</div>
                        <div>Para: {transaction.to}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#3b82f6', fontFamily: 'monospace' }}>
                        <a 
                          href={`https://tronscan.org/#/transaction/${transaction.hash.replace('...', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: '#3b82f6' }}
                        >
                          {transaction.hash}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {duplicates.filter(d => d.status === 'pending').length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Nenhuma duplicata pendente
          </h3>
          <p style={{ color: '#6b7280' }}>
            Todas as possíveis duplicatas foram analisadas
          </p>
        </div>
      )}
    </div>
  );
};

export default DuplicateTransactions;

