import React, { useEffect, useState } from 'react';
import { fetchBalances } from '../services/api';

const Balance = () => {
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBalances = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBalances();
        if (data) {
          setBalances(data);
        } else {
          setError('Unable to fetch balance data');
        }
      } catch (err) {
        setError(err.message || 'Failed to load balance data');
      } finally {
        setIsLoading(false);
      }
    };
    getBalances();
  }, []);

  const formatBalance = (value) => {
    if (value === undefined || value === null) return '0.00';
    const num = parseFloat(value);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const getExchangeBalance = (exchangeData) => {
    // Handle different exchange formats
    if (exchangeData.free !== undefined && exchangeData.locked !== undefined) {
      // Binance, MEXC format
      return {
        free: exchangeData.free,
        locked: exchangeData.locked,
        total: parseFloat(exchangeData.free) + parseFloat(exchangeData.locked || 0)
      };
    } else if (exchangeData.free !== undefined && exchangeData.total !== undefined) {
      // Bybit, Gate format
      return {
        free: exchangeData.free,
        locked: exchangeData.total - exchangeData.free,
        total: exchangeData.total
      };
    } else if (exchangeData.balance) {
      // HTX format
      return {
        free: exchangeData.balance.available,
        locked: (parseFloat(exchangeData.balance.balance) - parseFloat(exchangeData.balance.available)).toString(),
        total: exchangeData.balance.balance
      };
    }
    return {
      free: '0',
      locked: '0',
      total: '0'
    };
  };

  const calculateTotalBalance = (balances) => {
    if (!balances) return 0;
    
    return Object.values(balances).reduce((total, exchange) => {
      if (exchange.error) return total;
      
      const balance = getExchangeBalance(exchange);
      return total + parseFloat(balance.total || 0);
    }, 0);
  };

  return (
    <div className="balance-container">
      <div className="balance-header">
        <h2>Account Balances</h2>
        <div className="total-balance">
          <span>Total Across Exchanges:</span>
          <span className="amount">
            {balances ? 
              `$${calculateTotalBalance(balances).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}` 
              : '--'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading balance data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
          <button 
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>
      ) : (
        <div className="balance-grid">
          {balances && Object.keys(balances).map((exchange) => {
            const exchangeData = balances[exchange];
            
            if (exchangeData.error) {
              return (
                <div key={exchange} className="balance-card error">
                  <div className="card-header">
                    <h3>{exchange}</h3>
                    <span className="status-badge error">Error</span>
                  </div>
                  <div className="card-body">
                    <p className="error-message">{exchangeData.error}</p>
                    {exchangeData.message && (
                      <p className="error-detail">{exchangeData.message}</p>
                    )}
                  </div>
                </div>
              );
            }

            const balance = getExchangeBalance(exchangeData);
            const asset = exchangeData.asset || (exchangeData.balance?.currency || 'USDT').toUpperCase();
            
            return (
              <div key={exchange} className="balance-card">
                <div className="card-header">
                  <h3>{exchange}</h3>
                  <span className="status-badge success">Connected</span>
                </div>
                <div className="card-body">
                  <div className="balance-row">
                    <span>Asset:</span>
                    <span className="asset-name">{asset}</span>
                  </div>
                  <div className="balance-row">
                    <span>Available:</span>
                    <span className="balance-amount free">{formatBalance(balance.free)}</span>
                  </div>
                  <div className="balance-row">
                    <span>Locked:</span>
                    <span className="balance-amount locked">{formatBalance(balance.locked)}</span>
                  </div>
                  <div className="total-row">
                    <span>Total:</span>
                    <span className="total-amount">{formatBalance(balance.total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline CSS remains the same */}
      <style>
        {`
          .balance-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            padding: 24px;
            margin-bottom: 30px;
          }

          .balance-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }

          .balance-header h2 {
            color: #1a237e;
            font-size: 1.5rem;
            margin: 0;
            font-weight: 600;
          }

          .total-balance {
            display: flex;
            align-items: center;
            background: #f8fafc;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.95rem;
          }

          .total-balance span:first-child {
            color: #64748b;
            margin-right: 10px;
          }

          .amount {
            font-weight: 600;
            color: #1e293b;
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: #64748b;
          }

          .spinner {
            border: 3px solid rgba(99, 102, 241, 0.2);
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            color: #ef4444;
            text-align: center;
          }

          .error-state .material-icons {
            font-size: 2rem;
            margin-bottom: 12px;
          }

          .refresh-button {
            background: #6366f1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            margin-top: 16px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
          }

          .refresh-button:hover {
            background: #4f46e5;
          }

          .balance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }

          .balance-card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 20px;
            border-left: 4px solid #6366f1;
            transition: transform 0.2s;
          }

          .balance-card:hover {
            transform: translateY(-3px);
          }

          .balance-card.error {
            border-left-color: #ef4444;
            background: #fef2f2;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
          }

          .card-header h3 {
            font-size: 1.1rem;
            color: #1e293b;
            margin: 0;
            font-weight: 600;
          }

          .status-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 12px;
          }

          .status-badge.success {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }

          .status-badge.error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }

          .card-body {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .balance-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .balance-row span:first-child {
            color: #64748b;
            font-size: 0.9rem;
          }

          .balance-amount {
            font-weight: 500;
          }

          .balance-amount.free {
            color: #10b981;
          }

          .balance-amount.locked {
            color: #f59e0b;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e0;
          }

          .total-row span:first-child {
            color: #334155;
            font-weight: 600;
          }

          .total-amount {
            font-weight: 700;
            color: #1e293b;
            font-size: 1.1rem;
          }

          .error-message {
            color: #ef4444;
            font-weight: 500;
            margin: 5px 0;
          }

          .error-detail {
            color: #94a3b8;
            font-size: 0.85rem;
            margin: 5px 0 0;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .balance-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }

            .balance-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Balance;