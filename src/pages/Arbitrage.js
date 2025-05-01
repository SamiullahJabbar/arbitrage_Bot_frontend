import React, { useEffect, useState } from 'react';
import { fetchArbitrageData } from '../services/api';

const Arbitrage = () => {
  const [arbitrageData, setArbitrageData] = useState(null);
  const [previousData, setPreviousData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const getArbitrageData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchArbitrageData();
        setPreviousData(arbitrageData);
        setArbitrageData(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getArbitrageData();
    const interval = setInterval(getArbitrageData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0.00';
    return parseFloat(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  };

  const getProfitColor = (percent) => {
    if (!percent) return 'profit-negative';
    if (percent > 0.5) return 'profit-high';
    if (percent > 0.2) return 'profit-medium';
    if (percent > 0) return 'profit-low';
    return 'profit-negative';
  };

  const getStatusColor = (status) => {
    if (!status) return 'status-inactive';
    return `status-${status.toLowerCase()}`;
  };

  const getFilterStatusColor = (passed) => {
    return passed ? 'filter-passed' : 'filter-failed';
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
    if (!data) return 'volume-neutral';
    const volume = data.total_volume;
    if (volume >= 500000 && volume <= 1000000) return 'volume-valid';
    return 'volume-invalid';
  };

  const formatTimeSinceUpdate = (date) => {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 7200) return '1 hour ago';
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  const displayData = arbitrageData || previousData;

  return (
    <div className="arbitrage-container">
      <div className="arbitrage-header">
        <h2>Arbitrage Opportunities</h2>
        <div className="refresh-info">
          <div className="refresh-indicator">
            <span className="material-icons">refresh</span>
            {/* <span>Updates every 5 minutes</span> */}
          </div>
          {lastUpdated && (
            <div className="update-time">
              Last updated: {formatTimeSinceUpdate(lastUpdated)}
              {isLoading && <span className="updating-text"> (Updating...)</span>}
            </div>
          )}
        </div>
      </div>

      {isLoading && !displayData ? (
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
      ) : displayData && displayData.opportunities && displayData.opportunities.length > 0 ? (
        <div className="arbitrage-grid">
          {displayData.opportunities.map((opportunity, index) => (
            <div key={index} className="opportunity-card">
              <div className="card-header">
                <h3>{opportunity.pair || 'N/A'}</h3>
                <div className={`profit-badge ${getProfitColor(opportunity.profit_percent)}`}>
                  {opportunity.profit_percent > 0 ? '+' : ''}
                  {formatNumber(opportunity.profit_percent * 100)}%
                </div>
              </div>
              
              <div className="price-comparison">
                <div className="exchange-info buy-info">
                  <div className="exchange-label">Best Buy</div>
                  <div className="exchange-name">{opportunity.best_buy?.exchange || 'N/A'}</div>
                  <div className="price">${formatNumber(opportunity.best_buy?.price)}</div>
                </div>
                
                <div className="vs-separator">
                  <div className="line"></div>
                  <span>VS</span>
                  <div className="line"></div>
                </div>
                
                <div className="exchange-info sell-info">
                  <div className="exchange-label">Best Sell</div>
                  <div className="exchange-name">{opportunity.best_sell?.exchange || 'N/A'}</div>
                  <div className="price">${formatNumber(opportunity.best_sell?.price)}</div>
                </div>
              </div>
              
              <div className="opportunity-details">
                <div className="detail-row">
                  <span>Spread:</span>
                  <span>${formatNumber(opportunity.spread)}</span>
                </div>
                <div className="detail-row">
                  <span>Profit Percentage:</span>
                  <span className={getProfitColor(opportunity.profit_percent)}>
                    {opportunity.profit_percent > 0 ? '+' : ''}
                    {formatNumber(opportunity.profit_percent * 100)}%
                  </span>
                </div>
                <div className="detail-row">
                  <span>Total Volume:</span>
                  <span className={getVolumeStatusColor(opportunity)}>
                    ${formatNumber(opportunity.total_volume)}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Volume Status:</span>
                  <span className={getVolumeStatusColor(opportunity)}>
                    {getVolumeStatus(opportunity)}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={getStatusColor(opportunity.status)}>
                    {opportunity.status || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Passed Filters:</span>
                  <span className={getFilterStatusColor(opportunity.passed_filters)}>
                    {opportunity.passed_filters ? 'Yes' : 'No'}
                  </span>
                </div>
                {opportunity.message && (
                  <div className="detail-row message">
                    <span>Message:</span>
                    <span>{opportunity.message}</span>
                  </div>
                )}
              </div>

              {isVolumeInRange(opportunity) && (
                <button className="execute-button">
                  <span className="material-icons">bolt</span>
                  Execute Arbitrage Trade
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <span className="material-icons">search_off</span>
          <p>No arbitrage opportunities found</p>
        </div>
      )}

      <style jsx>{`
        /* Arbitrage Container */
        .arbitrage-container {
          font-family: 'Arial', sans-serif;
          background-color: #f7f7f7;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        /* Header Section */
        .arbitrage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .arbitrage-header h2 {
          font-size: 24px;
          color: #333;
          font-weight: bold;
        }

        /* Refresh Info */
        .refresh-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .refresh-indicator {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #888;
        }

        .refresh-indicator .material-icons {
          font-size: 18px;
          margin-right: 6px;
        }

        .update-time {
          font-size: 12px;
          color: #555;
        }

        .updating-text {
          color: #2c87fc;
          font-weight: 600;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          color: #888;
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
          padding: 30px;
          color: #ef4444;
        }

        .error-state .material-icons {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .retry-button {
          background: #6366f1;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          border: none;
          margin-top: 12px;
        }

        /* No Data */
        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #888;
        }

        .no-data .material-icons {
          font-size: 2rem;
          margin-bottom: 12px;
          color: #94a3b8;
        }

        /* Arbitrage Grid */
        .arbitrage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        /* Opportunity Card */
        .opportunity-card {
          background: #ffffff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .profit-badge {
          font-size: 14px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
        }

        .profit-high {
          background-color: #10b981;
          color: white;
        }

        .profit-medium {
          background-color: #22c55e;
          color: white;
        }

        .profit-low {
          background-color: #4ade80;
          color: white;
        }

        .profit-negative {
          background-color: #ef4444;
          color: white;
        }

        /* Price Comparison */
        .price-comparison {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .exchange-info {
          text-align: center;
          flex: 1;
        }

        .buy-info {
          color: #ef4444;
        }

        .sell-info {
          color: #10b981;
        }

        .exchange-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 6px;
        }

        .exchange-name {
          font-size: 14px;
          font-weight: 500;
          color: #444;
          margin-bottom: 8px;
        }

        .price {
          font-size: 18px;
          font-weight: bold;
        }

        .vs-separator {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 10px;
        }

        .vs-separator span {
          font-size: 12px;
          color: #888;
          padding: 4px 0;
        }

        .vs-separator .line {
          height: 1px;
          width: 20px;
          background-color: #ddd;
          margin: 2px 0;
        }

        /* Opportunity Details */
        .opportunity-details {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
          font-size: 14px;
        }

        .detail-row span:first-child {
          color: #666;
        }

        .detail-row span:last-child {
          font-weight: 500;
        }

        .message {
          flex-direction: column;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #eee;
        }

        .message span:last-child {
          font-size: 13px;
          color: #666;
          font-weight: normal;
          margin-top: 4px;
        }

        /* Status Colors */
        .status-filtered {
          color: #f59e0b;
        }

        .status-active {
          color: #10b981;
        }

        .status-inactive {
          color: #9ca3af;
        }

        /* Filter Status Colors */
        .filter-passed {
          color: #10b981;
        }

        .filter-failed {
          color: #ef4444;
        }

        /* Volume Status Colors */
        .volume-valid {
          color: #10b981;
        }

        .volume-invalid {
          color: #ef4444;
        }

        .volume-neutral {
          color: #9ca3af;
        }

        /* Execute Button */
        .execute-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .execute-button:hover {
          background: #4338ca;
        }

        .execute-button .material-icons {
          font-size: 18px;
          margin-right: 6px;
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Arbitrage;