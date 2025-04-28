import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Header Section */}
      <header className="header">
        <div className="header-content">
          {/* <h1 className="app-name">Arbitrage App</h1> */}
          <nav>
            <ul>
              <li><a href="#">Dashboard</a></li>
              <li><a href="#">Balance</a></li>
              <li><a href="#">Arbitrage</a></li>
              <li><a href="#">Rate</a></li>
              <li><a href="#">TradeLog</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Section */}
      <main>
        {children}
      </main>

      {/* Footer Section */}
      <footer className="footer">
        <p>&copy; 2025 Arbitrage App. All Rights Reserved.</p>
      </footer>

      {/* Custom CSS */}
      <style>
        {`
          .layout-container {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #fafafa;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            position: relative;
          }

          .header {
            background-color: #f5f5f5;
            padding: 25px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border-bottom: 1px solid #e0e0e0;
          }

          .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .header nav {
            display: flex;
            justify-content: center;
          }

          .header nav ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
            display: flex;
            gap: 40px;
          }

          .header nav ul li a {
            color: #424242;
            text-decoration: none;
            font-weight: 600; /* Made bold */
            font-size: 1.1rem;
            transition: all 0.2s ease;
            padding: 8px 0;
            position: relative;
          }

          .header nav ul li a:hover {
            color: #1a237e;
          }

          .header nav ul li a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background-color: #1a237e;
            transition: width 0.3s ease;
          }

          .header nav ul li a:hover::after {
            width: 100%;
          }

          main {
            padding: 30px;
            background-color: white;
            margin: 30px auto;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.03);
            max-width: 1200px;
            border: 1px solid #eeeeee;
          }

          .footer {
            background-color: #f5f5f5;
            color: #424242;
            text-align: center;
            padding: 20px;
            position: absolute;
            width: 100%;
            bottom: 0;
            border-top: 1px solid #e0e0e0;
          }

          .positive {
            color: #2e7d32;
            font-weight: 600;
          }

          .negative {
            color: #c62828;
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .header nav ul {
              flex-direction: column;
              gap: 15px;
              align-items: center;
            }
            
            .header nav ul li a {
              font-size: 1rem;
            }
            
            main {
              margin: 20px 15px;
              padding: 20px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Layout;