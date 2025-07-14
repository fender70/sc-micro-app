import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPlus, FiUsers, FiUpload } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <Link to="/" className="brand-link">
              <h1 className="brand-title">SC Micro</h1>
              <span className="brand-subtitle">Work Request Dashboard</span>
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
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 