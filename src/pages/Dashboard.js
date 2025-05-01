import React, { useEffect, useState } from 'react';
import { fetchRates } from '../services/api';
import Layout from './Layout';
import Balance from './Balance';
import TradeLog from './TradeLog';
import Arbitrage from './Arbitrage';

const Dashboard = () => {
  const [rates, setRates] = useState(null);
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [isLoading, setIsLoading] = useState(true);
  const [previousRates, setPreviousRates] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRates();
      setPreviousRates(rates); // Store current rates as previous before updating
      setRates(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for refreshing data every 2 minutes (120,000 ms)
    const intervalId = setInterval(fetchData, 120000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleExchangeChange = (event) => {
    setSelectedExchange(event.target.value);
  };

  // Calculate price change percentage (current vs previous spot price)
  const calculatePriceChange = (currentSpot, crypto) => {
    if (!previousRates || !previousRates.data.spot[selectedExchange][crypto]) {
      return '0.00'; // Return '0.00' if no previous rate exists
    }
    const previousSpot = parseFloat(previousRates.data.spot[selectedExchange][crypto]);
    const change = ((currentSpot - previousSpot) / previousSpot) * 100;
    return change.toFixed(2);  // Rounding the value to 2 decimal places
  };

  // Format volume to millions/billions with proper rounding
  const formatVolume = (volume) => {
    if (!volume || volume === '0') return '-';
    const num = parseFloat(volume);
    if (num >= 1000000000) {
      return `$${(num/1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `$${(num/1000000).toFixed(1)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  // Format time since last update
  const formatTimeSinceUpdate = (date) => {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 7200) return '1 hour ago';
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  return (
    <Layout>
      <div className="dashboard-container">
        {/* Balance Section */}
        <Balance />
        
        {/* Trade Log Section */}
        <TradeLog />
        
        {/* Arbitrage Opportunities Section */}
        <Arbitrage />

        {/* Live Rates Section */}
        <div className="rates-section">
          <div className="section-header">
            <div className="title-container">
              <h2>Live Crypto Rates</h2>
              <div className="update-info">
                <p className="subtitle">Real-time market data</p>
                {lastUpdated && (
                  <p className="update-time">
                    Updated {formatTimeSinceUpdate(lastUpdated)}
                    {isLoading && <span className="updating-indicator"> (Updating...)</span>}
                  </p>
                )}
              </div>
            </div>
            <div className="exchange-selector">
              <div className="selector-label">
                <span className="material-icons">swap_horiz</span>
                <label htmlFor="exchange">Exchange:</label>
              </div>
              <select
                id="exchange"
                value={selectedExchange}
                onChange={handleExchangeChange}
                className="exchange-dropdown"
              >
                {rates ? (
                  Object.keys(rates.data.spot).map((exchange) => (
                    <option key={exchange} value={exchange}>
                      {exchange.charAt(0).toUpperCase() + exchange.slice(1)}
                    </option>
                  ))
                ) : (
                  <option>Loading...</option>
                )}
              </select>
            </div>
          </div>

          {isLoading && !rates ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading market data...</p>
            </div>
          ) : rates ? (
            <div className="rates-table-container">
              <table className="rates-table">
                <thead>
                  <tr>
                    <th className="coin-header">COIN</th>
                    <th>SPOT PRICE</th>
                    <th>FUTURES PRICE</th>
                    <th className="volume-header">VOLUME (24H)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(rates.data.spot[selectedExchange]).map((crypto) => {
                    const spotPrice = parseFloat(rates.data.spot[selectedExchange][crypto]);
                    const futuresPrice = parseFloat(rates.data.futures[selectedExchange][crypto]);
                    const priceChange = calculatePriceChange(spotPrice, crypto);
                    const volume = rates.data.volume?.[selectedExchange]?.[crypto] || '-';
                    
                    return (
                      <React.Fragment key={crypto}>
                        <tr>
                          <td>
                            <div className="asset-info">
                              <strong>{crypto}</strong>
                            </div>
                          </td>
                          <td className="price bold-price">${spotPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: spotPrice > 10 ? 2 : 4
                          })}</td>
                          <td className="futures-price bold-price">${futuresPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: futuresPrice > 10 ? 2 : 4
                          })}</td>
                          <td className="volume">{formatVolume(volume)}</td>
                        </tr>
                        <tr>
                          <td colSpan="4" className="asset-details-row">
                            <div className="asset-details">
                              <span className="asset-name">{crypto} Coin</span>
                              <span className={`price-diff ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                                {priceChange >= 0 ? '+' : ''}{priceChange}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="error-state">
              <span className="material-icons">error_outline</span>
              <p>Failed to load market data. Please try again later.</p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .dashboard-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #2d3748;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          /* Section Common Styles */
          .rates-section, .balance-section, .tradelog-section, .arbitrage-section {
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          /* Rates Section Specific */
          .rates-section {
            margin-top: 20px;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
          }

          .title-container h2 {
            color: #1a237e;
            font-size: 1.5rem;
            margin: 0 0 5px 0;
            font-weight: 700;
          }

          .update-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .subtitle {
            color: #718096;
            font-size: 0.85rem;
            margin: 0;
          }

          .update-time {
            color: #718096;
            font-size: 0.75rem;
            margin: 0;
          }

          .updating-indicator {
            color: #667eea;
            font-weight: 500;
          }

          .exchange-selector {
            display: flex;
            align-items: center;
            background: #f7fafc;
            border-radius: 8px;
            padding: 8px 12px;
          }

          .selector-label {
            display: flex;
            align-items: center;
            margin-right: 10px;
            color: #4a5568;
            font-size: 0.9rem;
          }

          .selector-label .material-icons {
            font-size: 1.1rem;
            margin-right: 6px;
            color: #667eea;
          }

          .exchange-dropdown {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            background-color: white;
            font-size: 0.95rem;
            cursor: pointer;
            min-width: 150px;
            transition: all 0.2s;
          }

          /* Table Styles */
          .rates-table-container {
            overflow-x: auto;
            border-radius: 8px;
            border: 1px solid #edf2f7;
            -webkit-overflow-scrolling: touch;
          }

          .rates-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
          }

          .rates-table th {
            background-color: #f8fafc;
            color: #4a5568;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
          }

          .coin-header, .volume-header {
            padding-left: 15px;
          }

          .rates-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #edf2f7;
            vertical-align: middle;
          }

          .rates-table tr:last-child td {
            border-bottom: none;
          }

          .asset-info {
            display: flex;
            flex-direction: column;
          }

          .asset-info strong {
            margin-bottom: 4px;
          }

          .asset-details-row {
            padding-top: 0 !important;
            padding-bottom: 8px !important;
          }

          .asset-details {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            padding-left: 15px;
          }

          .asset-name {
            color: #718096;
          }

          .price, .futures-price {
            font-weight: 500;
          }

          .bold-price {
            font-weight: 700 !important;
          }

          .volume {
            color: #4a5568;
            font-weight: 500;
          }

          .price-diff {
            font-size: 0.8rem;
            font-weight: 500;
          }

          .positive {
            color: #10b981;
          }

          .negative {
            color: #ef4444;
          }

          /* Loading State */
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: #718096;
          }

          .loading-spinner {
            border: 3px solid rgba(102, 126, 234, 0.2);
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
          }

          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: #ef4444;
            text-align: center;
          }

          .error-state .material-icons {
            font-size: 2.5rem;
            margin-bottom: 15px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Mobile Responsive Styles */
          @media (max-width: 768px) {
            .dashboard-container {
              padding: 10px;
              gap: 15px;
            }

            .rates-section, .balance-section, .tradelog-section, .arbitrage-section {
              padding: 15px;
              border-radius: 10px;
            }

            .section-header {
              flex-direction: column;
              align-items: stretch;
              gap: 10px;
            }

            .title-container h2 {
              font-size: 1.3rem;
            }

            .exchange-selector {
              width: 100%;
              justify-content: space-between;
            }

            .exchange-dropdown {
              flex-grow: 1;
              max-width: 200px;
            }

            .rates-table th, 
            .rates-table td {
              padding: 10px 12px;
              font-size: 0.9rem;
            }

            .asset-details {
              font-size: 0.8rem;
              padding-left: 10px;
            }

            .loading-state, .error-state {
              padding: 30px 20px;
            }
          }

          @media (max-width: 480px) {
            .dashboard-container {
              padding: 8px;
            }

            .rates-section, .balance-section, .tradelog-section, .arbitrage-section {
              padding: 12px;
            }

            .title-container h2 {
              font-size: 1.2rem;
            }

            .subtitle, .update-time {
              font-size: 0.7rem;
            }

            .exchange-dropdown {
              font-size: 0.85rem;
              padding: 6px 10px;
            }

            .selector-label {
              font-size: 0.8rem;
            }

            .rates-table th {
              font-size: 0.75rem;
              padding: 8px 10px;
            }

            .rates-table td {
              padding: 8px 10px;
              font-size: 0.8rem;
            }

            .asset-details {
              font-size: 0.75rem;
            }
          }
        `}
      </style>
    </Layout>
  );
};

export default Dashboard;