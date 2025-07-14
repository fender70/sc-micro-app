import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiDollarSign, 
  FiCalendar, 
  FiMapPin, 
  FiMail, 
  FiPhone, 
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiPlus
} from 'react-icons/fi';
import './CustomersOverview.css';

const CustomersOverview = ({ customers, workRequests, onRefresh }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table

  // Calculate customer metrics and analytics
  const customerAnalytics = useMemo(() => {
    const analytics = customers.map(customer => {
      const customerProjects = workRequests.filter(wr => wr.customer?._id === customer._id);
      
      const totalProjects = customerProjects.length;
      const completedProjects = customerProjects.filter(p => ['completed', 'shipped'].includes(p.status)).length;
      const activeProjects = customerProjects.filter(p => ['pending', 'in-progress', 'quoted', 'po-received'].includes(p.status)).length;
      const cancelledProjects = customerProjects.filter(p => p.status === 'cancelled').length;
      
      const invoicedProjects = customerProjects.filter(p => p.invoiceNumber && p.invoiceNumber.trim() !== '').length;
      const totalRevenue = invoicedProjects; // Count of invoiced projects as proxy for revenue
      
      const avgProjectTime = customerProjects
        .filter(p => p.shipDate && p.createdAt)
        .reduce((acc, p) => {
          const startDate = new Date(p.createdAt);
          const endDate = new Date(p.shipDate);
          return acc + (endDate - startDate) / (1000 * 60 * 60 * 24); // days
        }, 0) / Math.max(completedProjects, 1);

      const lastActivity = customerProjects.length > 0 
        ? new Date(Math.max(...customerProjects.map(p => new Date(p.updatedAt))))
        : customer.updatedAt;

      const projectTypes = customerProjects.reduce((acc, p) => {
        const details = p.workRequestDetails.toLowerCase();
        if (details.includes('wirebond') || details.includes('wire bond')) acc.wirebond++;
        if (details.includes('die attach') || details.includes('dieattach')) acc.dieAttach++;
        if (details.includes('flip chip') || details.includes('flipchip')) acc.flipChip++;
        if (details.includes('encapsulation') || details.includes('glob top')) acc.encapsulation++;
        return acc;
      }, { wirebond: 0, dieAttach: 0, flipChip: 0, encapsulation: 0 });

      return {
        ...customer,
        totalProjects,
        completedProjects,
        activeProjects,
        cancelledProjects,
        invoicedProjects,
        totalRevenue,
        avgProjectTime: Math.round(avgProjectTime),
        lastActivity,
        projectTypes,
        completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        customerValue: totalProjects * 10 + completedProjects * 5 + invoicedProjects * 3 // Simple scoring
      };
    });

    // Sort based on selected criteria
    switch (sortBy) {
      case 'recent':
        return analytics.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      case 'projects':
        return analytics.sort((a, b) => b.totalProjects - a.totalProjects);
      case 'revenue':
        return analytics.sort((a, b) => b.totalRevenue - a.totalRevenue);
      case 'value':
        return analytics.sort((a, b) => b.customerValue - a.customerValue);
      case 'completion':
        return analytics.sort((a, b) => b.completionRate - a.completionRate);
      default:
        return analytics;
    }
  }, [customers, workRequests, sortBy]);

  // Filter customers based on search and status
  const filteredCustomers = useMemo(() => {
    return customerAnalytics.filter(customer => {
      const matchesSearch = searchTerm === '' || 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && customer.activeProjects > 0) ||
        (filterStatus === 'completed' && customer.completedProjects > 0) ||
        (filterStatus === 'inactive' && customer.activeProjects === 0 && customer.completedProjects === 0);

      return matchesSearch && matchesStatus;
    });
  }, [customerAnalytics, searchTerm, filterStatus]);

  // Overall customer metrics
  const overallMetrics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customerAnalytics.filter(c => c.activeProjects > 0).length;
    const totalProjects = workRequests.length;
    const totalRevenue = workRequests.filter(wr => wr.invoiceNumber && wr.invoiceNumber.trim() !== '').length;
    const avgProjectsPerCustomer = totalCustomers > 0 ? Math.round(totalProjects / totalCustomers * 10) / 10 : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalProjects,
      totalRevenue,
      avgProjectsPerCustomer
    };
  }, [customers, workRequests, customerAnalytics]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'in-progress': '#3b82f6',
      'completed': '#10b981',
      'shipped': '#8b5cf6',
      'quoted': '#06b6d4',
      'po-received': '#f97316',
      'payment': '#84cc16',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getCustomerTier = (customerValue) => {
    if (customerValue >= 50) return { tier: 'Premium', color: '#10b981' };
    if (customerValue >= 20) return { tier: 'Gold', color: '#f59e0b' };
    if (customerValue >= 10) return { tier: 'Silver', color: '#6b7280' };
    return { tier: 'Bronze', color: '#8b5cf6' };
  };

  const renderCustomerCard = (customer) => {
    const tier = getCustomerTier(customer.customerValue);
    
    return (
      <div key={customer._id} className="customer-card">
        <div className="customer-header">
          <div className="customer-info">
            <h3 className="customer-name">{customer.company || customer.name}</h3>
            <div className="customer-contact">{customer.name}</div>
            <div className="customer-tier" style={{ color: tier.color }}>
              {tier.tier} Customer
            </div>
          </div>
          <div className="customer-actions">
            <button 
              className="btn-icon" 
              title="View Details"
              onClick={() => {
                // TODO: Implement customer detail view
                alert('Customer detail view coming soon!');
              }}
            >
              <FiEye />
            </button>
            <button 
              className="btn-icon" 
              title="Edit Customer"
              onClick={() => navigate(`/edit-customer/${customer._id}`)}
            >
              <FiEdit />
            </button>
          </div>
        </div>

        <div className="customer-metrics">
          <div className="metric-row">
            <div className="metric">
              <div className="metric-number">{customer.totalProjects}</div>
              <div className="metric-label">Total Projects</div>
            </div>
            <div className="metric">
              <div className="metric-number">{customer.completedProjects}</div>
              <div className="metric-label">Completed</div>
            </div>
            <div className="metric">
              <div className="metric-number">{customer.activeProjects}</div>
              <div className="metric-label">Active</div>
            </div>
            <div className="metric">
              <div className="metric-number">{customer.totalRevenue}</div>
              <div className="metric-label">Invoiced</div>
            </div>
          </div>
        </div>

        <div className="customer-details">
          <div className="detail-item">
            <FiMail className="detail-icon" />
            <span>{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="detail-item">
              <FiPhone className="detail-icon" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.address.city && (
            <div className="detail-item">
              <FiMapPin className="detail-icon" />
              <span>{customer.address.city}, {customer.address.state}</span>
            </div>
          )}
        </div>

        <div className="customer-stats">
          <div className="stat-item">
            <span className="stat-label">Completion Rate:</span>
            <span className="stat-value">{customer.completionRate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Project Time:</span>
            <span className="stat-value">{customer.avgProjectTime} days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Activity:</span>
            <span className="stat-value">
              {new Date(customer.lastActivity).toLocaleDateString()}
            </span>
          </div>
        </div>

        {customer.projectTypes && Object.values(customer.projectTypes).some(v => v > 0) && (
          <div className="project-types">
            <div className="types-label">Project Types:</div>
            <div className="types-list">
              {Object.entries(customer.projectTypes)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => (
                  <span key={type} className="type-tag">
                    {type.replace(/([A-Z])/g, ' $1').trim()}: {count}
                  </span>
                ))}
            </div>
          </div>
        )}

        {customer.notes && (
          <div className="customer-notes">
            <div className="notes-label">Notes:</div>
            <div className="notes-content">
              {customer.notes.length > 100 
                ? `${customer.notes.substring(0, 100)}...` 
                : customer.notes
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Customer Overview</h1>
            <p className="page-subtitle">
              Manage customer relationships and track business performance
            </p>
          </div>
          <div className="page-actions">
            <button onClick={onRefresh} className="btn btn-outline">
              <FiSearch />
              Refresh
            </button>
            <Link to="/add-customer" className="btn btn-primary">
              <FiPlus />
              Add Customer
            </Link>
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="overall-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <FiUsers />
          </div>
          <div className="metric-content">
            <div className="metric-number">{overallMetrics.totalCustomers}</div>
            <div className="metric-label">Total Customers</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiTrendingUp />
          </div>
          <div className="metric-content">
            <div className="metric-number">{overallMetrics.activeCustomers}</div>
            <div className="metric-label">Active Customers</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiCalendar />
          </div>
          <div className="metric-content">
            <div className="metric-number">{overallMetrics.totalProjects}</div>
            <div className="metric-label">Total Projects</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiDollarSign />
          </div>
          <div className="metric-content">
            <div className="metric-number">{overallMetrics.totalRevenue}</div>
            <div className="metric-label">Invoiced Projects</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiTrendingUp />
          </div>
          <div className="metric-content">
            <div className="metric-number">{overallMetrics.avgProjectsPerCustomer}</div>
            <div className="metric-label">Avg Projects/Customer</div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="controls-section">
        <div className="search-filters">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Customers</option>
              <option value="active">Active Customers</option>
              <option value="completed">Completed Projects</option>
              <option value="inactive">Inactive Customers</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="recent">Sort by Recent Activity</option>
              <option value="projects">Sort by Project Count</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="value">Sort by Customer Value</option>
              <option value="completion">Sort by Completion Rate</option>
            </select>
          </div>
        </div>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {/* Customer Grid/List */}
      {filteredCustomers.length > 0 ? (
        <div className={`customers-container ${viewMode}`}>
          {filteredCustomers.map(renderCustomerCard)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No customers found</h3>
          <p className="empty-state-description">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first customer.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link to="/add-customer" className="btn btn-primary">
              <FiPlus />
              Add First Customer
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomersOverview; 