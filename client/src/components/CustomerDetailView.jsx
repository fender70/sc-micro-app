import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiHome, 
  FiEdit, 
  FiArrowLeft, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp, 
  FiFolder, 
  FiClipboard,

  FiHash,
  FiFileText
} from 'react-icons/fi';
import { format } from 'date-fns';
import './CustomerDetailView.css';

const CustomerDetailView = ({ customers, workRequests, projects, onRefresh }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const customer = useMemo(() => {
    return customers.find(c => c._id === id);
  }, [customers, id]);

  const customerData = useMemo(() => {
    if (!customer) return null;

    const customerWorkRequests = workRequests.filter(wr => wr.customer?._id === id);
    const customerProjects = projects.filter(p => p.customer?._id === id);

    // Calculate metrics
    const totalWorkRequests = customerWorkRequests.length;
    const totalProjects = customerProjects.length;
    
    const completedWorkRequests = customerWorkRequests.filter(wr => 
      ['completed', 'shipped'].includes(wr.status)
    ).length;
    
    const activeWorkRequests = customerWorkRequests.filter(wr => 
      ['pending', 'in-progress', 'quoted', 'po-received'].includes(wr.status)
    ).length;

    const completedProjects = customerProjects.filter(p => 
      p.status === 'completed'
    ).length;

    const activeProjects = customerProjects.filter(p => 
      ['planning', 'active'].includes(p.status)
    ).length;

    const invoicedWorkRequests = customerWorkRequests.filter(wr => 
      wr.invoiceNumber && wr.invoiceNumber.trim() !== ''
    ).length;

    const totalRevenue = customerProjects.reduce((sum, p) => 
      sum + (p.amountInvoiced || 0), 0
    );

    // Calculate completion rate
    const completionRate = totalWorkRequests > 0 
      ? Math.round((completedWorkRequests / totalWorkRequests) * 100)
      : 0;

    // Calculate average project time
    const projectTimes = customerWorkRequests
      .filter(wr => wr.shipDate && wr.createdAt)
      .map(wr => {
        const startDate = new Date(wr.createdAt);
        const endDate = new Date(wr.shipDate);
        return (endDate - startDate) / (1000 * 60 * 60 * 24); // days
      });

    const avgProjectTime = projectTimes.length > 0
      ? Math.round(projectTimes.reduce((sum, time) => sum + time, 0) / projectTimes.length)
      : 0;

    // Get project types
    const projectTypes = {};
    customerWorkRequests.forEach(wr => {
      const type = wr.workRequestDetails.toLowerCase();
      if (type.includes('wirebond')) projectTypes.wirebond = (projectTypes.wirebond || 0) + 1;
      else if (type.includes('die attach') || type.includes('die-attach')) projectTypes['die-attach'] = (projectTypes['die-attach'] || 0) + 1;
      else if (type.includes('flip chip') || type.includes('flip-chip')) projectTypes['flip-chip'] = (projectTypes['flip-chip'] || 0) + 1;
      else if (type.includes('encapsulation')) projectTypes.encapsulation = (projectTypes.encapsulation || 0) + 1;
      else if (type.includes('assembly')) projectTypes.assembly = (projectTypes.assembly || 0) + 1;
      else if (type.includes('testing')) projectTypes.testing = (projectTypes.testing || 0) + 1;
      else projectTypes.other = (projectTypes.other || 0) + 1;
    });

    // Get recent activity
    const recentActivity = [
      ...customerWorkRequests.map(wr => ({
        type: 'work-request',
        item: wr,
        date: new Date(wr.updatedAt),
        action: 'updated'
      })),
      ...customerProjects.map(p => ({
        type: 'project',
        item: p,
        date: new Date(p.updatedAt),
        action: 'updated'
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    return {
      customer,
      workRequests: customerWorkRequests,
      projects: customerProjects,
      metrics: {
        totalWorkRequests,
        totalProjects,
        completedWorkRequests,
        activeWorkRequests,
        completedProjects,
        activeProjects,
        invoicedWorkRequests,
        totalRevenue,
        completionRate,
        avgProjectTime
      },
      projectTypes,
      recentActivity
    };
  }, [customer, workRequests, projects, id]);

  useEffect(() => {
    if (customer) {
      setLoading(false);
    }
  }, [customer]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getCustomerTier = (customerValue) => {
    if (customerValue >= 50) return { tier: 'Premium', color: '#10b981' };
    if (customerValue >= 20) return { tier: 'Gold', color: '#f59e0b' };
    if (customerValue >= 10) return { tier: 'Silver', color: '#6b7280' };
    return { tier: 'Bronze', color: '#8b5cf6' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="error-container">
        <h2>Customer not found</h2>
        <p>The customer you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/customers')} className="btn btn-primary">
          <FiArrowLeft />
          Back to Customers
        </button>
      </div>
    );
  }

  const tier = getCustomerTier(customerData.metrics.totalWorkRequests);

  return (
    <div className="customer-detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <button onClick={() => navigate('/customers')} className="btn btn-outline">
            <FiArrowLeft />
            Back to Customers
          </button>
          <div className="customer-title">
            <h1>{customer.company || customer.name}</h1>
            <div className="customer-subtitle">
              <span className="tier-badge" style={{ color: tier.color }}>
                {tier.tier} Customer
              </span>
              <span className="customer-contact">{customer.name}</span>
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/edit-customer/${customer._id}`} className="btn btn-primary">
              <FiEdit />
              Edit Customer
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-icon">
            <FiClipboard />
          </div>
          <div className="metric-content">
            <div className="metric-number">{customerData.metrics.totalWorkRequests}</div>
            <div className="metric-label">Total Work Requests</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiFolder />
          </div>
          <div className="metric-content">
            <div className="metric-number">{customerData.metrics.totalProjects}</div>
            <div className="metric-label">Total Projects</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiTrendingUp />
          </div>
          <div className="metric-content">
            <div className="metric-number">{customerData.metrics.completionRate}%</div>
            <div className="metric-label">Completion Rate</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiDollarSign />
          </div>
          <div className="metric-content">
            <div className="metric-number">${customerData.metrics.totalRevenue.toLocaleString()}</div>
            <div className="metric-label">Total Revenue</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FiCalendar />
          </div>
          <div className="metric-content">
            <div className="metric-number">{customerData.metrics.avgProjectTime}</div>
            <div className="metric-label">Avg Project Days</div>
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
          className={`tab-button ${activeTab === 'work-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('work-requests')}
        >
          Work Requests ({customerData.workRequests.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects ({customerData.projects.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Recent Activity
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              {/* Customer Information */}
              <div className="info-card">
                <h3>Customer Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <FiUser className="info-icon" />
                    <div className="info-content">
                      <div className="info-label">Contact Name</div>
                      <div className="info-value">{customer.name}</div>
                    </div>
                  </div>
                  {customer.company && (
                    <div className="info-item">
                      <FiHome className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Company</div>
                        <div className="info-value">{customer.company}</div>
                      </div>
                    </div>
                  )}
                  <div className="info-item">
                    <FiMail className="info-icon" />
                    <div className="info-content">
                      <div className="info-label">Email</div>
                      <div className="info-value">{customer.email}</div>
                    </div>
                  </div>
                  {customer.phone && (
                    <div className="info-item">
                      <FiPhone className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Phone</div>
                        <div className="info-value">{customer.phone}</div>
                      </div>
                    </div>
                  )}
                  {customer.address?.city && (
                    <div className="info-item">
                      <FiMapPin className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Location</div>
                        <div className="info-value">
                          {customer.address.city}, {customer.address.state}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Types */}
              <div className="info-card">
                <h3>Project Types</h3>
                <div className="project-types-list">
                  {Object.entries(customerData.projectTypes).map(([type, count]) => (
                    <div key={type} className="project-type-item">
                      <span className="type-name">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="type-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="info-card">
                <h3>Work Request Status</h3>
                <div className="status-breakdown">
                  <div className="status-item">
                    <div className="status-label">Active</div>
                    <div className="status-bar">
                      <div 
                        className="status-fill active" 
                        style={{ width: `${(customerData.metrics.activeWorkRequests / customerData.metrics.totalWorkRequests) * 100}%` }}
                      ></div>
                    </div>
                    <div className="status-count">{customerData.metrics.activeWorkRequests}</div>
                  </div>
                  <div className="status-item">
                    <div className="status-label">Completed</div>
                    <div className="status-bar">
                      <div 
                        className="status-fill completed" 
                        style={{ width: `${(customerData.metrics.completedWorkRequests / customerData.metrics.totalWorkRequests) * 100}%` }}
                      ></div>
                    </div>
                    <div className="status-count">{customerData.metrics.completedWorkRequests}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="info-card">
                  <h3>Notes</h3>
                  <div className="notes-content">
                    {customer.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'work-requests' && (
          <div className="work-requests-content">
            <div className="section-header">
              <h3>Work Requests</h3>
              <Link to="/add-work-request" className="btn btn-primary">
                Add Work Request
              </Link>
            </div>
            {customerData.workRequests.length > 0 ? (
              <div className="work-requests-list">
                {customerData.workRequests.map(request => (
                  <div key={request._id} className="work-request-item">
                    <div className="work-request-header">
                      <div className="work-request-title">
                        {request.workRequestDetails.length > 60 
                          ? `${request.workRequestDetails.substring(0, 60)}...`
                          : request.workRequestDetails
                        }
                      </div>
                      <div className="work-request-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(request.status) }}
                        >
                          {request.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="work-request-meta">
                      <div className="meta-item">
                        <FiHash />
                        <span>{request.quoteNumber || 'No Quote'}</span>
                      </div>
                      <div className="meta-item">
                        <FiFileText />
                        <span>{request.poNumber || 'No PO'}</span>
                      </div>
                      <div className="meta-item">
                        <FiFileText />
                        <span>{request.invoiceNumber || 'No Invoice'}</span>
                      </div>
                      <div className="meta-item">
                        <FiCalendar />
                        <span>{formatDate(request.shipDate)}</span>
                      </div>
                    </div>
                    <div className="work-request-actions">
                      <Link to={`/edit-work-request/${request._id}`} className="btn btn-outline btn-sm">
                        <FiEdit />
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No work requests found for this customer.</p>
                <Link to="/add-work-request" className="btn btn-primary">
                  Add First Work Request
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-content">
            <div className="section-header">
              <h3>Projects</h3>
              <Link to="/add-project" className="btn btn-primary">
                Add Project
              </Link>
            </div>
            {customerData.projects.length > 0 ? (
              <div className="projects-list">
                {customerData.projects.map(project => (
                  <div key={project._id} className="project-item">
                    <div className="project-header">
                      <div className="project-title">
                        <h4>{project.projectName}</h4>
                        <div className="project-type">{project.projectType}</div>
                      </div>
                      <div className="project-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(project.status) }}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="project-description">
                      {project.projectDescription}
                    </div>
                    <div className="project-meta">
                      <div className="meta-item">
                        <FiDollarSign />
                        <span>${project.budget?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="meta-item">
                        <FiCalendar />
                        <span>{formatDate(project.targetDate)}</span>
                      </div>
                      <div className="meta-item">
                        <FiHash />
                        <span>{project.quoteNumber || 'No Quote'}</span>
                      </div>
                    </div>
                    <div className="project-actions">
                      <Link to={`/edit-project/${project._id}`} className="btn btn-outline btn-sm">
                        <FiEdit />
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No projects found for this customer.</p>
                <Link to="/add-project" className="btn btn-primary">
                  Add First Project
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-content">
            <h3>Recent Activity</h3>
            {customerData.recentActivity.length > 0 ? (
              <div className="activity-list">
                {customerData.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'work-request' ? <FiClipboard /> : <FiFolder />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        {activity.type === 'work-request' ? 'Work Request' : 'Project'} {activity.action}
                      </div>
                      <div className="activity-description">
                        {activity.type === 'work-request' 
                          ? activity.item.workRequestDetails.substring(0, 50) + '...'
                          : activity.item.projectName
                        }
                      </div>
                      <div className="activity-date">
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailView; 