import React, { useEffect, useState } from 'react';
import { fetchArbitrageData } from '../services/api';

const Arbitrage = () => {
  const [arbitrageData, setArbitrageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getArbitrageData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchArbitrageData();
        setArbitrageData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getArbitrageData();
    const interval = setInterval(getArbitrageData, 180000); // API call every 3 minutes

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0.00';
    return parseFloat(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  };

  const getProfitColor = (percent) => {
    if (!percent) return 'text-red-500';
    if (percent > 0.5) return 'text-green-600';
    if (percent > 0.2) return 'text-green-500';
    if (percent > 0) return 'text-green-400';
    return 'text-red-500';
  };

  const getStatusColor = (status) => {
    if (!status) return 'inactive';
    return status.toLowerCase();
  };

  const isVolumeInRange = (data) => {
    if (!data) return false;
    const volume = data.total_volume;
    return volume >= 500000 && volume <= 1000000;
  };

  const getVolumeStatus = (data) => {
    if (!data) return 'N/A';
    const volume = data.total_volume;
    if (volume < 500000) return 'Below minimum volume (500K)';
    if (volume > 1000000) return 'Above maximum volume (1M)';
    return 'Within trading range (500K-1M)';
  };

  const getVolumeStatusColor = (data) => {
    if (!data) return 'text-gray-500';
    const volume = data.total_volume;
    if (volume >= 500000 && volume <= 1000000) return 'text-green-500';
    return 'text-red-500';
  };

  return (
    <div className="arbitrage-container">
      <div className="arbitrage-header">
        <h2 className="arbitrage-title">Arbitrage Opportunities</h2>
        <div className="refresh-indicator">
          <span className="material-icons">refresh</span>
          <span>Updates every 3 minutes</span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Scanning exchanges for opportunities...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : arbitrageData ? (
        <div className="arbitrage-grid">
          {/* Main Opportunity Card */}
          <div className="opportunity-card">
            <div className="card-header">
              <h3>{arbitrageData.pair || 'N/A'}</h3>
              <span className={`profit-badge ${getProfitColor(arbitrageData.profit_percent)}`}>
                {arbitrageData.profit_percent > 0 ? '+' : ''}
                {arbitrageData.profit_percent ? (arbitrageData.profit_percent * 100).toFixed(2) : '0.00'}%
              </span>
            </div>
            
            <div className="price-comparison">
              <div className="buy-info">
                <div className="exchange-label">Best Buy</div>
                <div className="exchange-name">{arbitrageData.best_buy?.exchange || 'N/A'}</div>
                <div className="price">${formatNumber(arbitrageData.best_buy?.price)}</div>
              </div>
              
              <div className="vs-separator">
                <div className="line"></div>
                <span>VS</span>
                <div className="line"></div>
              </div>
              
              <div className="sell-info">
                <div className="exchange-label">Best Sell</div>
                <div className="exchange-name">{arbitrageData.best_sell?.exchange || 'N/A'}</div>
                <div className="price">${formatNumber(arbitrageData.best_sell?.price)}</div>
              </div>
            </div>
            
            <div className="spread-info">
              <div className="spread-item">
                <span>Spread:</span>
                <span>${formatNumber(arbitrageData.spread)}</span>
              </div>
              <div className="spread-item">
                <span>Profit Percentage:</span>
                <span>
                  {arbitrageData.profit_percent > 0 ? '+' : ''}
                  {(arbitrageData.profit_percent * 100).toFixed(2)}%
                </span>
              </div>
              <div className="spread-item">
                <span>Total Volume:</span>
                <span className={getVolumeStatusColor(arbitrageData)}>
                  ${formatNumber(arbitrageData.total_volume)}
                </span>
              </div>
              <div className="spread-item">
                <span>Volume Status:</span>
                <span className={getVolumeStatusColor(arbitrageData)}>
                  {getVolumeStatus(arbitrageData)}
                </span>
              </div>
            </div>

            {/* Execute Trade Button - Only shown when volume is in range */}
            {isVolumeInRange(arbitrageData) && (
              <button className="execute-button">
                <span className="material-icons">bolt</span>
                Execute Arbitrage Trade
              </button>
            )}
          </div>
          
          {/* Status & Details */}
          <div className="status-card">
            <h3 className="card-title">Trade Status</h3>
            <div className="status-item">
              <span>Status:</span>
              <span className={`status-value ${getStatusColor(arbitrageData.status)}`}>
                {arbitrageData.status || 'N/A'}
              </span>
            </div>
            <div className="status-item">
              <span>Threshold:</span>
              <span>{formatNumber(arbitrageData.threshold)}%</span>
            </div>
            <div className="status-item">
              <span>Min Volume:</span>
              <span>${formatNumber(arbitrageData.min_volume)}</span>
            </div>
            <div className="status-item">
              <span>Volume Range:</span>
              <span>500K - 1M USDT</span>
            </div>
            {arbitrageData.timestamp && (
              <div className="status-item">
                <span>Last Updated:</span>
                <span>{new Date(arbitrageData.timestamp).toLocaleString()}</span>
              </div>
            )}
            {arbitrageData.volume_message && (
              <div className="status-message">
                <span className="material-icons">info</span>
                <p>{arbitrageData.volume_message}</p>
              </div>
            )}
            {arbitrageData.passed_filters !== undefined && (
              <div className="status-item">
                <span>Passed Filters:</span>
                <span className={arbitrageData.passed_filters ? 'text-green-500' : 'text-red-500'}>
                  {arbitrageData.passed_filters ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="no-data">
          <span className="material-icons">search_off</span>
          <p>No arbitrage opportunities found</p>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .arbitrage-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 24px;
          margin-bottom: 30px;
        }
        
        .arbitrage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .arbitrage-title {
          color: #1a237e;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }
        
        .refresh-indicator {
          display: flex;
          align-items: center;
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .refresh-indicator .material-icons {
          font-size: 1rem;
          margin-right: 6px;
          color: #6366f1;
        }
        
        /* Loading State */
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
        
        /* Error State */
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
        
        .retry-button {
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
        
        .retry-button:hover {
          background: #4f46e5;
        }
        
        /* No Data State */
        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #64748b;
          text-align: center;
        }
        
        .no-data .material-icons {
          font-size: 2rem;
          margin-bottom: 12px;
          color: #94a3b8;
        }
        
        /* Arbitrage Grid */
        .arbitrage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        /* Opportunity Card */
        .opportunity-card {
          background: #f8fafc;
          border-radius: 10px;
          padding: 20px;
          border-left: 4px solid #6366f1;
          position: relative;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-header h3 {
          font-size: 1.2rem;
          color: #1e293b;
          margin: 0;
        }
        
        .profit-badge {
          font-size: 0.9rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .text-green-600 { color: #059669; }
        .text-green-500 { color: #10b981; }
        .text-green-400 { color: #34d399; }
        .text-red-500 { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .text-gray-500 { color: #64748b; }
        
        .price-comparison {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .buy-info, .sell-info {
          flex: 1;
          text-align: center;
        }
        
        .exchange-label {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 6px;
        }
        
        .exchange-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .price {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
        }
        
        .vs-separator {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 15px;
        }
        
        .vs-separator .line {
          height: 1px;
          width: 30px;
          background: #e2e8f0;
          margin: 5px 0;
        }
        
        .vs-separator span {
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 600;
        }
        
        .spread-info {
          display: flex;
          flex-direction: column;
          background: white;
          padding: 12px 15px;
          border-radius: 8px;
          margin-top: 15px;
          gap: 8px;
        }
        
        .spread-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .spread-item span:first-child {
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .spread-item span:last-child {
          font-weight: 600;
          color: #1e293b;
        }
        
        /* Execute Button */
        .execute-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          margin-top: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .execute-button:hover {
          background: linear-gradient(135deg, #4338ca, #4f46e5);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .execute-button .material-icons {
          margin-right: 8px;
          font-size: 1.1rem;
        }
        
        /* Status Card */
        .status-card {
          background: #f8fafc;
          border-radius: 10px;
          padding: 20px;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .status-item span:first-child {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .status-item span:last-child {
          font-weight: 500;
          color: #1e293b;
        }
        
        .status-value {
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .status-value.active {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .status-value.inactive {
          color: #64748b;
          background: rgba(100, 116, 139, 0.1);
        }
        
        .status-value.error {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        
        .status-value.filtered {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }
        
        .status-message {
          display: flex;
          background: rgba(99, 102, 241, 0.1);
          padding: 12px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .status-message .material-icons {
          color: #6366f1;
          margin-right: 10px;
          font-size: 1.2rem;
        }
        
        .status-message p {
          margin: 0;
          font-size: 0.9rem;
          color: #475569;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .arbitrage-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .arbitrage-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Arbitrage;
