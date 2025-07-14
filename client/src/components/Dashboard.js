import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import WorkRequestCard from './WorkRequestCard';
import './Dashboard.css';

const Dashboard = ({ workRequests, customers, onUpdateWorkRequest, onDeleteWorkRequest, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkRequests = workRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.workRequestDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: workRequests.length,
    pending: workRequests.filter(r => r.status === 'pending').length,
    inProgress: workRequests.filter(r => r.status === 'in-progress').length,
    completed: workRequests.filter(r => r.status === 'completed').length,
    shipped: workRequests.filter(r => r.status === 'shipped').length
  };

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

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Work Request Dashboard</h1>
            <p className="page-subtitle">
              Manage and track customer work requests efficiently
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

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.shipped}</div>
          <div className="stat-label">Shipped</div>
        </div>
      </div>

      {/* Filters */}
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
          <div className="status-filter">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
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
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first work request.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link to="/add-work-request" className="btn btn-primary">
              <FiPlus />
              Create First Request
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 