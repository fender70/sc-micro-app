import React, { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiDownload, FiCalendar, FiHash, FiFileText } from 'react-icons/fi';
import './WorkRequestCard.css';

const WorkRequestCard = ({ workRequest, onStatusUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(workRequest.status);

  const handleStatusSave = async () => {
    try {
      await onStatusUpdate(workRequest.id, { status: editedStatus });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'in-progress': return 'badge-in-progress';
      case 'completed': return 'badge-completed';
      case 'shipped': return 'badge-shipped';
      default: return 'badge-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="work-request-card">
      <div className="work-request-header">
        <div className="work-request-info">
          <div className="work-request-title">
            {workRequest.customer_name || 'Unknown Company'}
          </div>
          <div className="work-request-customer">
            {workRequest.customer_name}
          </div>
        </div>
        <div className="work-request-status">
          {isEditing ? (
            <div className="status-edit">
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                className="form-select"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="shipped">Shipped</option>
              </select>
              <button onClick={handleStatusSave} className="btn btn-success">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          ) : (
            <>
              <span className={`badge ${getStatusBadgeClass(workRequest.status)}`}>
                {workRequest.status.replace('-', ' ')}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm"
              >
                <FiEdit />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="work-request-body">
        <div className="work-request-details">
          {workRequest.description}
        </div>

        <div className="work-request-meta">
          <div className="meta-item">
            <div className="meta-label">
              <FiHash />
              Quote #
            </div>
            <div className="meta-value">
              {workRequest.quoteNumber || 'Not set'}
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-label">
              <FiFileText />
              PO #
            </div>
            <div className="meta-value">
              {workRequest.poNumber || 'Not set'}
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-label">
              <FiFileText />
              Invoice #
            </div>
            <div className="meta-value">
              {workRequest.invoiceNumber || 'Not set'}
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-label">
              <FiCalendar />
              Ship Date
            </div>
            <div className="meta-value">
              {formatDate(workRequest.shipDate)}
            </div>
          </div>
        </div>

        {workRequest.scMicroReport && (
          <div className="report-section">
            <div className="meta-label">
              <FiDownload />
              SC Micro Report
            </div>
            <div className="meta-value">
              <a 
                href={workRequest.scMicroReport} 
                target="_blank" 
                rel="noopener noreferrer"
                className="report-link"
              >
                View Report
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="work-request-actions">
        <div className="action-buttons">
          <Link 
            to={`/edit-work-request/${workRequest.id}`}
            className="btn btn-outline btn-sm"
            title="Edit work request"
          >
            <FiEdit />
            Edit
          </Link>
                        <button 
                onClick={() => onDelete(workRequest.id)}
                className="btn-delete"
                title="Delete work request"
              >
            <FiTrash2 />
            Delete
          </button>
        </div>
        <div className="work-request-date">
          Created: {formatDate(workRequest.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default WorkRequestCard; 