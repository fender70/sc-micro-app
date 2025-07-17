import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiTrendingUp, FiCalendar, FiUsers, FiDollarSign, FiFolder, FiEdit } from 'react-icons/fi';
import WorkRequestCard from './WorkRequestCard';
import './Dashboard.css';

const Dashboard = ({ workRequests, customers, projects, onUpdateWorkRequest, onDeleteWorkRequest, onUpdateProject, onDeleteProject, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, timeline

  // Check if data is still loading
  const isLoading = !Array.isArray(workRequests) || !Array.isArray(customers) || !Array.isArray(projects);

  // Enhanced stats with project tracking
  const stats = useMemo(() => {
    // Ensure workRequests and projects are arrays
    const workRequestsArray = Array.isArray(workRequests) ? workRequests : [];
    const projectsArray = Array.isArray(projects) ? projects : [];
    
    const totalWorkRequests = workRequestsArray.length;
    const totalProjects = projectsArray.length;
    
    // Work request status counts
    const pending = workRequestsArray.filter(r => r.status === 'pending').length;
    const inProgress = workRequestsArray.filter(r => r.status === 'in-progress').length;
    const completed = workRequestsArray.filter(r => r.status === 'completed').length;
    const shipped = workRequestsArray.filter(r => r.status === 'shipped').length;
    const quoted = workRequestsArray.filter(r => r.status === 'quoted').length;
    const poReceived = workRequestsArray.filter(r => r.status === 'po-received').length;
    const payment = workRequestsArray.filter(r => r.status === 'payment').length;
    const cancelled = workRequestsArray.filter(r => r.status === 'cancelled').length;

    // Project status counts
    const planningProjects = projectsArray.filter(p => p.status === 'planning').length;
    const activeProjects = projectsArray.filter(p => p.status === 'active').length;
    const onHoldProjects = projectsArray.filter(p => p.status === 'on-hold').length;
    const completedProjects = projectsArray.filter(p => p.status === 'completed').length;
    const cancelledProjects = projectsArray.filter(p => p.status === 'cancelled').length;

    // Combined metrics
    const totalActiveWork = workRequestsArray.filter(r => 
      ['pending', 'in-progress', 'quoted', 'po-received'].includes(r.status)
    ).length;
    
    const totalCompletedWork = workRequestsArray.filter(r => 
      ['completed', 'shipped'].includes(r.status)
    ).length;

    const totalRevenue = workRequestsArray
      .filter(r => r.invoiceNumber && r.invoiceNumber.trim() !== '')
      .length; // Count invoiced projects

    const totalBudget = projectsArray.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalActualCost = projectsArray.reduce((sum, p) => sum + (p.actualCost || 0), 0);

    const avgProjectTime = workRequestsArray
      .filter(r => r.shipDate && r.createdAt)
      .reduce((acc, r) => {
        const startDate = new Date(r.createdAt);
        const endDate = new Date(r.shipDate);
        return acc + (endDate - startDate) / (1000 * 60 * 60 * 24); // days
      }, 0) / Math.max(completed, 1);

    return {
      totalWorkRequests,
      totalProjects,
      pending,
      inProgress,
      completed,
      shipped,
      quoted,
      poReceived,
      payment,
      cancelled,
      planningProjects,
      activeProjects,
      onHoldProjects,
      completedProjects,
      cancelledProjects,
      totalActiveWork,
      totalCompletedWork,
      totalRevenue,
      totalBudget,
      totalActualCost,
      avgProjectTime: Math.round(avgProjectTime)
    };
  }, [workRequests, projects]);

  // Filter work requests
  const filteredWorkRequests = useMemo(() => {
    const workRequestsArray = Array.isArray(workRequests) ? workRequests : [];
    return workRequestsArray.filter(request => {
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      const matchesCustomer = filterCustomer === 'all' || 
        request.customer_id === filterCustomer ||
        request.customer_name?.toLowerCase().includes(filterCustomer.toLowerCase());
      const matchesSearch = searchTerm === '' || 
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.po_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCustomer && matchesSearch;
    });
  }, [workRequests, filterStatus, filterCustomer, searchTerm]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    const projectsArray = Array.isArray(projects) ? projects : [];
    return projectsArray.filter(project => {
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesCustomer = filterCustomer === 'all' || 
        project.customer_id === filterCustomer ||
        project.customer_name?.toLowerCase().includes(filterCustomer.toLowerCase());
      const matchesSearch = searchTerm === '' || 
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.po_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCustomer && matchesSearch;
    });
  }, [projects, filterStatus, filterCustomer, searchTerm]);



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

  const handleProjectStatusUpdate = async (id, newStatus) => {
    try {
      await onUpdateProject(id, { status: newStatus });
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleProjectDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await onDeleteProject(id);
      } catch (error) {
        console.error('Error deleting project:', error);
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
      'cancelled': '#ef4444',
      'planning': '#6b7280',
      'active': '#3b82f6',
      'on-hold': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return colors[priority] || '#6b7280';
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
            <div className="stat-number">{stats.totalWorkRequests}</div>
            <div className="stat-label">Work Requests</div>
          </div>
        </div>
        <div className="stat-card projects">
          <div className="stat-icon">
            <FiFolder />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalProjects}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalActiveWork}</div>
            <div className="stat-label">Active Work</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalCompletedWork}</div>
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
        <h3>Work Request Status Overview</h3>
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
                    width: `${(count / stats.totalWorkRequests) * 100}%`,
                    backgroundColor: getStatusColor(label.toLowerCase().replace(' ', '-'))
                  }}
                />
              </div>
              <div className="status-count">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Status Breakdown */}
      {stats.totalProjects > 0 && (
        <div className="status-breakdown">
          <h3>Project Status Overview</h3>
          <div className="status-chart">
            {Object.entries({
              'Planning': stats.planningProjects,
              'Active': stats.activeProjects,
              'On Hold': stats.onHoldProjects,
              'Completed': stats.completedProjects,
              'Cancelled': stats.cancelledProjects
            }).map(([label, count]) => (
              <div key={label} className="status-bar">
                <div className="status-label">{label}</div>
                <div className="status-progress">
                  <div 
                    className="status-fill" 
                    style={{ 
                      width: `${(count / stats.totalProjects) * 100}%`,
                      backgroundColor: getStatusColor(label.toLowerCase().replace(' ', '-'))
                    }}
                  />
                </div>
                <div className="status-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderProjects = () => (
    <>
      <div className="section-header">
        <h2>Projects</h2>
        <div className="section-actions">
          <Link to="/add-project" className="btn btn-primary">
            <FiPlus />
            Add Project
          </Link>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className={`projects-container ${viewMode}`}>
          {filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-info">
                  <h3 className="project-name">{project.name}</h3>
                                      <div className="project-customer">{project.customer_name}</div>
                                      <div className="project-type">{project.type}</div>
                </div>
                <div className="project-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {project.status}
                  </span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(project.priority) }}
                  >
                    {project.priority}
                  </span>
                </div>
              </div>

              <div className="project-details">
                <div className="project-description">
                  {project.description || 'No description provided'}
                </div>
                
                <div className="project-metrics">
                  <div className="metric">
                    <span className="metric-label">Budget:</span>
                    <span className="metric-value">${project.budget?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Work Requests:</span>
                    <span className="metric-value">{project.workRequests?.length || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Duration:</span>
                    <span className="metric-value">{project.duration || 0} days</span>
                  </div>
                </div>

                <div className="project-team">
                  {project.projectManager && (
                    <div className="team-member">
                      <span className="member-role">PM:</span>
                      <span className="member-name">{project.projectManager}</span>
                    </div>
                  )}
                  {project.technicalLead && (
                    <div className="team-member">
                      <span className="member-role">TL:</span>
                      <span className="member-name">{project.technicalLead}</span>
                    </div>
                  )}
                </div>

                <div className="project-timeline">
                  {project.startDate && (
                    <div className="timeline-item">
                      <span className="timeline-label">Start:</span>
                      <span className="timeline-date">
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.targetDate && (
                    <div className="timeline-item">
                      <span className="timeline-label">Target:</span>
                      <span className="timeline-date">
                        {new Date(project.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="project-actions">
                <div className="action-buttons">
                  <Link 
                    to={`/edit-project/${project.id}`}
                    className="btn btn-outline btn-sm"
                    title="Edit project"
                  >
                    <FiEdit />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleProjectDelete(project.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
                <select
                  value={project.status}
                  onChange={(e) => handleProjectStatusUpdate(project.id, e.target.value)}
                  className="status-select"
                  style={{ borderColor: getStatusColor(project.status) }}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No projects found</h3>
          <p>Get started by creating your first project.</p>
          <Link to="/add-project" className="btn btn-primary">
            <FiPlus />
            Add Project
          </Link>
        </div>
      )}
    </>
  );

  const renderWorkOrders = () => (
    <>
      <div className="section-header">
        <h2>Work Orders</h2>
        <div className="section-actions">
          <Link to="/add-work-request" className="btn btn-primary">
            <FiPlus />
            Add Work Request
          </Link>
        </div>
      </div>

      {filteredWorkRequests.length > 0 ? (
        <div className={`work-requests-container ${viewMode}`}>
          {filteredWorkRequests.map(request => (
            <WorkRequestCard
              key={request.id}
              workRequest={request}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No work requests found</h3>
          <p>Get started by creating your first work request.</p>
          <Link to="/add-work-request" className="btn btn-primary">
            <FiPlus />
            Add Work Request
          </Link>
        </div>
      )}
    </>
  );

  // Show loading state if data is not ready
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">SC Micro Dashboard</h1>
          <div className="header-actions">
            <button onClick={onRefresh} className="btn btn-outline">
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          className={`tab-button ${activeTab === 'workorders' ? 'active' : ''}`}
          onClick={() => setActiveTab('workorders')}
        >
          Work Orders
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
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
            <option value="all">All Status</option>
            {activeTab === 'projects' ? (
              <>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="quoted">Quoted</option>
                <option value="po-received">PO Received</option>
                <option value="completed">Completed</option>
                <option value="shipped">Shipped</option>
                <option value="payment">Payment</option>
                <option value="cancelled">Cancelled</option>
              </>
            )}
          </select>
          
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Customers</option>
            {customers.map(customer => (
                              <option key={customer.id} value={customer.id}>
                                  {customer.name}
              </option>
            ))}
          </select>
          
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
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'workorders' && renderWorkOrders()}
      </div>
    </div>
  );
};

export default Dashboard; 