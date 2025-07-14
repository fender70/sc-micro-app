import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPlus, FiUsers, FiUpload, FiUserCheck, FiFolderPlus } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import './Header.css';

// Import your logo here (uncomment and adjust the path when you add the logo)
// import logoImage from '../assets/logo.png';

const Header = () => {
  const location = useLocation();
  
  // Set this to true when you have the logo file
  const hasLogo = false; // Change to true when logo is added

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <Link to="/" className="brand-link">
              <div className="brand-logo">
                {hasLogo ? (
                  <img 
                    src="/logo.png" 
                    alt="SC Micro Logo" 
                    className="logo-image"
                  />
                ) : (
                  <div className="logo-placeholder">SC</div>
                )}
              </div>
              <h1 className="brand-title">SC Micro</h1>
            </Link>
          </div>
          
          <nav className="header-nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <FiHome />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/customers" 
              className={`nav-link ${location.pathname === '/customers' ? 'active' : ''}`}
            >
              <FiUserCheck />
              <span>Customers</span>
            </Link>
            
            <Link 
              to="/add-project" 
              className={`nav-link ${location.pathname === '/add-project' ? 'active' : ''}`}
            >
              <FiFolderPlus />
              <span>New Project</span>
            </Link>
            
            <Link 
              to="/add-work-request" 
              className={`nav-link ${location.pathname === '/add-work-request' ? 'active' : ''}`}
            >
              <FiPlus />
              <span>New Request</span>
            </Link>
            
            <Link 
              to="/add-customer" 
              className={`nav-link ${location.pathname === '/add-customer' ? 'active' : ''}`}
            >
              <FiUsers />
              <span>Add Customer</span>
            </Link>
            
            <Link 
              to="/csv-upload" 
              className={`nav-link ${location.pathname === '/csv-upload' ? 'active' : ''}`}
            >
              <FiUpload />
              <span>CSV Upload</span>
            </Link>
            
            <div className="header-actions">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 