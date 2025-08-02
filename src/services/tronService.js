// Serviço para integração com APIs reais da Tron
class TronService {
  constructor() {
    // TronGrid API (oficial da Tron Foundation)
    this.tronGridUrl = 'https://api.trongrid.io';
    // TronScan API para dados complementares
    this.tronScanUrl = 'https://apilist.tronscanapi.com/api';
    // Contrato USDT TRC20
    this.usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  }

  // Validar endereço Tron
  isValidTronAddress(address) {
    // Endereços Tron começam com 'T' e têm 34 caracteres
    const tronAddressRegex = /^T[A-Za-z1-9]{33}$/;
    return tronAddressRegex.test(address);
  }

  // Buscar saldo USDT de uma carteira
  async getUSDTBalance(address) {
    try {
      if (!this.isValidTronAddress(address)) {
        throw new Error('Endereço Tron inválido');
      }

      // Usar TronGrid para buscar saldo USDT
      const response = await fetch(`${this.tronGridUrl}/v1/accounts/${address}/transactions/trc20?limit=1&contract_address=${this.usdtContract}`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar API TronGrid');
      }

      const data = await response.json();
      
      // Buscar saldo atual via TronScan (mais confiável para saldos)
      const balanceResponse = await fetch(`${this.tronScanUrl}/account?address=${address}`);
      const balanceData = await balanceResponse.json();
      
      // Procurar token USDT nos tokens da conta
      const usdtToken = balanceData.trc20token_balances?.find(
        token => token.tokenId === this.usdtContract
      );
      
      const balance = usdtToken ? parseFloat(usdtToken.balance) / Math.pow(10, usdtToken.tokenDecimal || 6) : 0;
      
      return {
        address,
        balance,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar saldo USDT:', error);
      return {
        address,
        balance: 0,
        lastUpdate: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Buscar transações USDT de uma carteira
  async getUSDTTransactions(address, limit = 50) {
    try {
      if (!this.isValidTronAddress(address)) {
        throw new Error('Endereço Tron inválido');
      }

      // Usar TronGrid API que permite CORS
      const response = await fetch(
        `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?limit=${limit}&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
      );
      
      if (!response.ok) {
        throw new Error(`Erro na API TronGrid: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data) {
        return [];
      }
      
      // Processar transações
      const transactions = data.data.map(tx => {
        const isReceived = tx.to.toLowerCase() === address.toLowerCase();
        const amount = parseFloat(tx.value) / 1000000; // USDT tem 6 decimais
        
        return {
          id: tx.transaction_id,
          hash: tx.transaction_id,
          amount: amount,
          type: isReceived ? 'received' : 'sent',
          from: tx.from,
          to: tx.to,
          timestamp: tx.block_timestamp,
          date: new Date(tx.block_timestamp).toLocaleString('pt-PT'),
          status: 'Completo', // Transações na blockchain são sempre completas
          blockNumber: tx.block,
          note: '', // Será preenchido pelo usuário
          confirmed: true
        };
      });

      return transactions;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Erro ao buscar transações: ' + error.message);
    }
  }

  // Buscar detalhes de uma transação específica
  async getTransactionDetails(txHash) {
    try {
      const response = await fetch(`${this.tronGridUrl}/v1/transactions/${txHash}`);
      
      if (!response.ok) {
        throw new Error('Transação não encontrada');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar detalhes da transação:', error);
      return null;
    }
  }

  // Detectar transações duplicadas
  detectDuplicates(transactions) {
    const duplicates = [];
    const grouped = {};

    // Agrupar por valor
    transactions.forEach(tx => {
      const key = tx.amount.toString();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(tx);
    });

    // Encontrar grupos com mais de 1 transação
    Object.entries(grouped).forEach(([amount, txs]) => {
      if (txs.length > 1) {
        // Calcular similaridade baseada em tempo, endereços, etc.
        for (let i = 0; i < txs.length - 1; i++) {
          for (let j = i + 1; j < txs.length; j++) {
            const tx1 = txs[i];
            const tx2 = txs[j];
            
            let similarity = 50; // Base: mesmo valor
            
            // Mesmo remetente/destinatário
            if (tx1.from === tx2.from) similarity += 20;
            if (tx1.to === tx2.to) similarity += 20;
            
            // Proximidade temporal (dentro de 1 hora)
            const timeDiff = Math.abs(new Date(tx1.date) - new Date(tx2.date));
            if (timeDiff < 3600000) similarity += 10; // 1 hora em ms
            
            if (similarity >= 70) {
              duplicates.push({
                id: `dup_${tx1.id}_${tx2.id}`,
                transactions: [tx1, tx2],
                similarity: Math.min(similarity, 99),
                status: 'pending'
              });
            }
          }
        }
      }
    });

    return duplicates;
  }

  // Gerar comprovante formatado
  generateReceipt(transaction) {
    const formatDate = (date) => {
      return new Date(date).toLocaleString('pt-PT');
    };

    const receipt = `🧾 COMPROVANTE USDT TRC20

💰 Valor: ${transaction.amount} USDT
📅 Data: ${formatDate(transaction.date)}

📤 De: ${transaction.from}
📥 Para: ${transaction.to}

🔗 Hash: ${transaction.hash}

🌐 Ver no TronScan:
https://tronscan.org/#/transaction/${transaction.hash}

✅ Comprovante gerado em ${formatDate(new Date())}
📱 Pronto para compartilhar`;

    return receipt;
  }
}

export default new TronService();

