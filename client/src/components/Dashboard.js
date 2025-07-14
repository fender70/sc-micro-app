import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiFilter, FiTrendingUp, FiCalendar, FiUsers, FiDollarSign } from 'react-icons/fi';
import WorkRequestCard from './WorkRequestCard';
import './Dashboard.css';

const Dashboard = ({ workRequests, customers, onUpdateWorkRequest, onDeleteWorkRequest, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, timeline

  // Enhanced stats with project tracking
  const stats = useMemo(() => {
    const total = workRequests.length;
    const pending = workRequests.filter(r => r.status === 'pending').length;
    const inProgress = workRequests.filter(r => r.status === 'in-progress').length;
    const completed = workRequests.filter(r => r.status === 'completed').length;
    const shipped = workRequests.filter(r => r.status === 'shipped').length;
    const quoted = workRequests.filter(r => r.status === 'quoted').length;
    const poReceived = workRequests.filter(r => r.status === 'po-received').length;
    const payment = workRequests.filter(r => r.status === 'payment').length;
    const cancelled = workRequests.filter(r => r.status === 'cancelled').length;

    // Project tracking metrics
    const activeProjects = workRequests.filter(r => 
      ['pending', 'in-progress', 'quoted', 'po-received'].includes(r.status)
    ).length;
    
    const completedProjects = workRequests.filter(r => 
      ['completed', 'shipped'].includes(r.status)
    ).length;

    const totalRevenue = workRequests
      .filter(r => r.invoiceNumber && r.invoiceNumber.trim() !== '')
      .length; // Count invoiced projects

    const avgProjectTime = workRequests
      .filter(r => r.shipDate && r.createdAt)
      .reduce((acc, r) => {
        const startDate = new Date(r.createdAt);
        const endDate = new Date(r.shipDate);
        return acc + (endDate - startDate) / (1000 * 60 * 60 * 24); // days
      }, 0) / Math.max(completed, 1);

    return {
      total,
      pending,
      inProgress,
      completed,
      shipped,
      quoted,
      poReceived,
      payment,
      cancelled,
      activeProjects,
      completedProjects,
      totalRevenue,
      avgProjectTime: Math.round(avgProjectTime)
    };
  }, [workRequests]);

  // Filter work requests
  const filteredWorkRequests = useMemo(() => {
    return workRequests.filter(request => {
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      const matchesCustomer = filterCustomer === 'all' || 
        request.customer?._id === filterCustomer ||
        request.customer?.company?.toLowerCase().includes(filterCustomer.toLowerCase());
      const matchesSearch = searchTerm === '' || 
        request.workRequestDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCustomer && matchesSearch;
    });
  }, [workRequests, filterStatus, filterCustomer, searchTerm]);

  // Group work requests by customer for project view
  const projectsByCustomer = useMemo(() => {
    const grouped = {};
    workRequests.forEach(request => {
      const customerId = request.customer?._id;
      if (customerId) {
        if (!grouped[customerId]) {
          grouped[customerId] = {
            customer: request.customer,
            projects: []
          };
        }
        grouped[customerId].projects.push(request);
      }
    });
    return Object.values(grouped);
  }, [workRequests]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await onUpdateWorkRequest(id, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work request?')) {
      try {
        await onDeleteWorkRequest(id);
      } catch (error) {
        console.error('Error deleting work request:', error);
      }
    }
  };

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

  const renderOverview = () => (
    <>
      {/* Enhanced Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeProjects}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.completedProjects}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalRevenue}</div>
            <div className="stat-label">Invoiced</div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="status-breakdown">
        <h3>Project Status Overview</h3>
        <div className="status-chart">
          {Object.entries({
            'Pending': stats.pending,
            'In Progress': stats.inProgress,
            'Quoted': stats.quoted,
            'PO Received': stats.poReceived,
            'Completed': stats.completed,
            'Shipped': stats.shipped,
            'Payment': stats.payment,
            'Cancelled': stats.cancelled
          }).map(([label, count]) => (
            <div key={label} className="status-bar">
              <div className="status-label">{label}</div>
              <div className="status-progress">
                <div 
                  className="status-fill" 
                  style={{ 
                    width: `${(count / stats.total) * 100}%`,
                    backgroundColor: getStatusColor(label.toLowerCase().replace(' ', '-'))
                  }}
                />
              </div>
              <div className="status-count">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Projects</h3>
        <div className="activity-list">
          {workRequests
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map(request => (
              <div key={request._id} className="activity-item">
                <div className="activity-status" style={{ backgroundColor: getStatusColor(request.status) }} />
                <div className="activity-content">
                  <div className="activity-title">
                    {request.customer?.company || 'Unknown Company'}
                  </div>
                  <div className="activity-details">
                    {request.workRequestDetails.substring(0, 60)}...
                  </div>
                  <div className="activity-meta">
                    {request.quoteNumber && `Quote: ${request.quoteNumber}`}
                    {request.poNumber && ` • PO: ${request.poNumber}`}
                  </div>
                </div>
                <div className="activity-date">
                  {new Date(request.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );

  const renderProjects = () => (
    <div className="projects-view">
      <div className="projects-header">
        <h3>Projects by Customer</h3>
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
      
      <div className={`projects-container ${viewMode}`}>
        {projectsByCustomer.map(({ customer, projects }) => (
          <div key={customer._id} className="customer-project-card">
            <div className="customer-header">
              <h4>{customer.company}</h4>
              <div className="customer-contact">{customer.name}</div>
              <div className="project-count">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="projects-list">
              {projects.map(project => (
                <div key={project._id} className="project-item">
                  <div className="project-status" style={{ backgroundColor: getStatusColor(project.status) }} />
                  <div className="project-info">
                    <div className="project-title">{project.workRequestDetails.substring(0, 50)}...</div>
                    <div className="project-meta">
                      {project.quoteNumber && <span>Quote: {project.quoteNumber}</span>}
                      {project.poNumber && <span>PO: {project.poNumber}</span>}
                      {project.invoiceNumber && <span>Invoice: {project.invoiceNumber}</span>}
                    </div>
                  </div>
                  <div className="project-actions">
                    <button 
                      className="btn btn-sm"
                      onClick={() => handleStatusUpdate(project._id, 'completed')}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorkOrders = () => (
    <>
      {/* Enhanced Filters */}
      <div className="filters-section">
        <div className="filters-content">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search work requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="quoted">Quoted</option>
              <option value="po-received">PO Received</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
              <option value="payment">Payment</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="form-select"
            >
              <option value="all">All Customers</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Work Requests Grid */}
      {filteredWorkRequests.length > 0 ? (
        <div className="work-requests-grid">
          {filteredWorkRequests.map((workRequest) => (
            <WorkRequestCard
              key={workRequest._id}
              workRequest={workRequest}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No work requests found</h3>
          <p className="empty-state-description">
            {searchTerm || filterStatus !== 'all' || filterCustomer !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first work request.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterCustomer === 'all' && (
            <Link to="/add-work-request" className="btn btn-primary">
              <FiPlus />
              Create First Request
            </Link>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Project & Work Order Dashboard</h1>
            <p className="page-subtitle">
              Track projects, work orders, and customer relationships
            </p>
          </div>
          <div className="page-actions">
            <button onClick={onRefresh} className="btn btn-outline">
              <FiRefreshCw />
              Refresh
            </button>
            <Link to="/add-work-request" className="btn btn-primary">
              <FiPlus />
              New Request
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button 
          className={`tab-btn ${activeTab === 'work-orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('work-orders')}
        >
          Work Orders
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'work-orders' && renderWorkOrders()}
      </div>
    </div>
  );
};

export default Dashboard; 