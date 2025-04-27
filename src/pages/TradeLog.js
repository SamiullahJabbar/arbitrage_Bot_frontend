import React, { useEffect, useState, useCallback } from 'react';
import { fetchTradeLogs } from '../services/api';
import { FiArrowUp, FiArrowDown, FiRefreshCw, FiChevronRight, FiInfo, FiSearch } from 'react-icons/fi';

const TradeLog = () => {
  const [tradeLogs, setTradeLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTradeLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTradeLogs({ timeframe: timeFilter });
      setTradeLogs(data?.trade_logs || []);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    loadTradeLogs();
  }, [loadTradeLogs]);

  const filteredLogs = tradeLogs.filter(log => 
    log.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.buy_exchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.sell_exchange.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="trade-log-container">
      <style>
        {`
          .trade-log-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            overflow: hidden;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          .header {
            padding: 24px;
            border-bottom: 1px solid #f0f2f5;
          }
          
          .title {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 6px;
            color: #1a1a1a;
          }
          
          .subtitle {
            font-size: 14px;
            color: #6b7280;
            font-weight: 400;
          }
          
          .controls {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            flex-wrap: wrap;
            align-items: center;
          }
          
          .search-container {
            flex: 1;
            min-width: 240px;
            position: relative;
          }
          
          .search-input {
            width: 100%;
            padding: 10px 16px 10px 40px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
            background-color: #f9fafb;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            background-color: white;
          }
          
          .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }
          
          .time-filters {
            display: flex;
            gap: 8px;
            background: #f3f4f6;
            padding: 4px;
            border-radius: 8px;
          }
          
          .time-filter {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            color: #4b5563;
          }
          
          .time-filter:hover {
            background: #e5e7eb;
          }
          
          .time-filter.active {
            background: #3b82f6;
            color: white;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          
          .table-container {
            overflow-x: auto;
            padding: 0 8px;
          }
          
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }
          
          th {
            padding: 14px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background: #f9fafb;
            border-bottom: 1px solid #f0f2f5;
            position: sticky;
            top: 0;
          }
          
          td {
            padding: 16px;
            border-bottom: 1px solid #f0f2f5;
            font-size: 14px;
            color: #374151;
          }
          
          tr:hover td {
            background-color: #f8fafc;
          }
          
          .pair-cell {
            font-weight: 500;
            color: #111827;
          }
          
          .exchanges {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .exchange-name {
            font-weight: 500;
          }
          
          .prices {
            display: flex;
            gap: 16px;
          }
          
          .price {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .price-value {
            font-weight: 500;
          }
          
          .profit {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
          }
          
          .profit.positive {
            color: #059669;
          }
          
          .profit.negative {
            color: #dc2626;
          }
          
          .profit-percent {
            font-size: 13px;
            opacity: 0.9;
          }
          
          .status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
          }
          
          .status.running {
            background: #dbeafe;
            color: #1d4ed8;
          }
          
          .status.completed {
            background: #d1fae5;
            color: #059669;
          }
          
          .status.failed {
            background: #fee2e2;
            color: #dc2626;
          }
          
          .action-btn {
            color: #3b82f6;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: color 0.2s;
          }
          
          .action-btn:hover {
            color: #2563eb;
          }
          
          .footer {
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #f0f2f5;
          }
          
          .pagination {
            display: flex;
            gap: 8px;
          }
          
          .pagination-btn {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            background: white;
          }
          
          .pagination-btn:hover {
            background: #f9fafb;
            border-color: #d1d5db;
          }
          
          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .loading-container {
            padding: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          .empty-state {
            padding: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            text-align: center;
          }
          
          .empty-icon {
            width: 48px;
            height: 48px;
            color: #9ca3af;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .header {
              padding: 16px;
            }
            
            .controls {
              flex-direction: column;
            }
            
            .search-container {
              width: 100%;
            }
            
            .time-filters {
              width: 100%;
              justify-content: space-between;
            }
            
            td, th {
              padding: 12px;
            }
          }
        `}
      </style>

      <div className="header">
        <h1 className="title">Trade History</h1>
        <p className="subtitle">Recent arbitrage trades</p>
        
        <div className="controls">
          <div className="search-container">
            <FiSearch className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search trades..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="time-filters">
            {['24h', '7d', '30d', 'All'].map((filter) => (
              <div
                key={filter}
                className={`time-filter ${timeFilter === filter ? 'active' : ''}`}
                onClick={() => setTimeFilter(filter)}
              >
                {filter}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="table-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div>Loading trade history...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>No trades found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pair</th>
                <th>Exchanges</th>
                <th>Prices</th>
                <th>Profit</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index}>
                  <td className="pair-cell">{log.pair}</td>
                  
                  <td>
                    <div className="exchanges">
                      <span className="exchange-name">{log.buy_exchange}</span>
                      <FiChevronRight size={16} color="#9ca3af" />
                      <span className="exchange-name">{log.sell_exchange}</span>
                    </div>
                  </td>
                  
                  <td>
                    <div className="prices">
                      <div className="price">
                        <span className="price-value">{formatCurrency(log.buy_price)}</span>
                      </div>
                      <div className="price">
                        <span className="price-value">{formatCurrency(log.sell_price)}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <div className={`profit ${log.profit >= 0 ? 'positive' : 'negative'}`}>
                      {log.profit >= 0 ? (
                        <FiArrowUp size={16} />
                      ) : (
                        <FiArrowDown size={16} />
                      )}
                      <span>{formatCurrency(Math.abs(log.profit))}</span>
                      <span className="profit-percent">({(log.profit / log.buy_price * 100).toFixed(2)}%)</span>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`status ${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                  
                  <td>{log.duration ? `${log.duration} min` : '—'}</td>
                  
                  <td>
                    <div className="action-btn">
                      <FiInfo size={16} />
                      <span>Details</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="footer">
        <div>Showing 1 to {filteredLogs.length} of {filteredLogs.length} trades</div>
        <div className="pagination">
          <button className="pagination-btn" disabled>Previous</button>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default TradeLog;