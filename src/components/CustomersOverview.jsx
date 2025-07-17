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
  FiFolder,
  FiEye,
  FiEdit,
  FiPlus
} from 'react-icons/fi';
import './CustomersOverview.css';

const CustomersOverview = ({ customers, workRequests, projects, onRefresh }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table

  // Calculate customer metrics and analytics
  const customerAnalytics = useMemo(() => {
    const analytics = customers.map(customer => {
      const customerWorkRequests = workRequests.filter(wr => wr.customer_id === customer.id);
      const customerProjects = projects.filter(p => p.customer_id === customer.id);
      
      const totalWorkRequests = customerWorkRequests.length;
      const totalProjects = customerProjects.length;
      const completedWorkRequests = customerWorkRequests.filter(wr => ['completed', 'shipped'].includes(wr.status)).length;
      const completedProjects = customerProjects.filter(p => ['completed'].includes(p.status)).length;
      const activeWorkRequests = customerWorkRequests.filter(wr => ['pending', 'in-progress', 'quoted', 'po-received'].includes(wr.status)).length;
      const activeProjects = customerProjects.filter(p => ['planning', 'active'].includes(p.status)).length;
      const cancelledWorkRequests = customerWorkRequests.filter(wr => wr.status === 'cancelled').length;
      const cancelledProjects = customerProjects.filter(p => p.status === 'cancelled').length;
      
      const invoicedWorkRequests = customerWorkRequests.filter(wr => wr.invoice_number && wr.invoice_number.trim() !== '').length;
      const totalRevenue = invoicedWorkRequests; // Count of invoiced work requests as proxy for revenue
      
      const avgProjectTime = customerWorkRequests
        .filter(wr => wr.target_date && wr.created_date)
        .reduce((acc, wr) => {
          const startDate = new Date(wr.created_date);
          const endDate = new Date(wr.target_date);
          return acc + (endDate - startDate) / (1000 * 60 * 60 * 24); // days
        }, 0) / Math.max(completedWorkRequests, 1);

      const lastActivity = customerWorkRequests.length > 0 
        ? new Date(Math.max(...customerWorkRequests.map(wr => new Date(wr.updated_at || wr.created_date))))
        : new Date();

      const projectTypes = customerWorkRequests.reduce((acc, wr) => {
        const details = (wr.description || '').toLowerCase();
        if (details.includes('wirebond') || details.includes('wire bond')) acc.wirebond++;
        if (details.includes('die attach') || details.includes('dieattach')) acc.dieAttach++;
        if (details.includes('flip chip') || details.includes('flipchip')) acc.flipChip++;
        if (details.includes('encapsulation') || details.includes('glob top')) acc.encapsulation++;
        return acc;
      }, { wirebond: 0, dieAttach: 0, flipChip: 0, encapsulation: 0 });

      return {
        ...customer,
        totalWorkRequests,
        totalProjects,
        completedWorkRequests,
        completedProjects,
        activeWorkRequests,
        activeProjects,
        cancelledWorkRequests,
        cancelledProjects,
        invoicedWorkRequests,
        totalRevenue,
        avgProjectTime: Math.round(avgProjectTime),
        lastActivity,
        projectTypes,
        completionRate: totalWorkRequests > 0 ? Math.round((completedWorkRequests / totalWorkRequests) * 100) : 0,
        customerValue: totalWorkRequests * 10 + completedWorkRequests * 5 + invoicedWorkRequests * 3 // Simple scoring
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
  }, [customers, workRequests, projects, sortBy]);

  // Filter customers based on search and status
  const filteredCustomers = useMemo(() => {
    return customerAnalytics.filter(customer => {
      const matchesSearch = searchTerm === '' || 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
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
    const activeCustomers = customerAnalytics.filter(c => c.activeWorkRequests > 0).length;
    const totalWorkRequests = workRequests.length;
    const totalProjects = projects.length;
    const totalRevenue = workRequests.filter(wr => wr.invoice_number && wr.invoice_number.trim() !== '').length;
    const avgProjectsPerCustomer = totalCustomers > 0 ? Math.round(totalWorkRequests / totalCustomers * 10) / 10 : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalWorkRequests,
      totalProjects,
      totalRevenue,
      avgProjectsPerCustomer
    };
  }, [customers, workRequests, projects, customerAnalytics]);



  const getCustomerTier = (customerValue) => {
    if (customerValue >= 50) return { tier: 'Premium', color: '#10b981' };
    if (customerValue >= 20) return { tier: 'Gold', color: '#f59e0b' };
    if (customerValue >= 10) return { tier: 'Silver', color: '#6b7280' };
    return { tier: 'Bronze', color: '#8b5cf6' };
  };

  const renderCustomerCard = (customer) => {
    const tier = getCustomerTier(customer.customerValue);
    
    return (
              <div key={customer.id} className="customer-card">
        <div className="customer-header">
          <div className="customer-info">
            <h3 className="customer-name">{customer.name}</h3>
            <div className="customer-contact">{customer.contact}</div>
            <div className="customer-tier" style={{ color: tier.color }}>
              {tier.tier} Customer
            </div>
          </div>
          <div className="customer-actions">
            <button 
              className="btn-icon" 
              title="View Details"
              onClick={() => navigate(`/customer/${customer.id}`)}
            >
              <FiEye />
            </button>
            <button 
              className="btn-icon" 
              title="Edit Customer"
              onClick={() => navigate(`/edit-customer/${customer.id}`)}
            >
              <FiEdit />
            </button>
          </div>
        </div>

        <div className="customer-metrics">
          <div className="metric-row">
            <div className="metric">
              <div className="metric-number">{customer.totalWorkRequests}</div>
              <div className="metric-label">Work Requests</div>
            </div>
            <div className="metric">
              <div className="metric-number">{customer.totalProjects}</div>
              <div className="metric-label">Projects</div>
            </div>
            <div className="metric">
              <div className="metric-number">{customer.activeWorkRequests}</div>
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
          {customer.address && (
            <div className="detail-item">
              <FiMapPin className="detail-icon" />
              <span>{customer.address}</span>
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
            <div className="metric-number">{overallMetrics.totalWorkRequests}</div>
            <div className="metric-label">Total Work Requests</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiFolder />
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
            <div className="metric-label">Invoiced Work Requests</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiTrendingUp />
          </div>
          <div className="metric-content">
            <div className="metric-number">{overallMetrics.avgProjectsPerCustomer}</div>
            <div className="metric-label">Avg Work Requests/Customer</div>
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