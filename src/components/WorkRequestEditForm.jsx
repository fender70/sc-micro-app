import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiCalendar, FiHash, FiFileText, FiUser, FiClipboard } from 'react-icons/fi';
import './WorkRequestEditForm.css';

const WorkRequestEditForm = ({ workRequests, customers, onUpdateWorkRequest }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    description: '',
    quote_number: '',
    po_number: '',
    notes: '',
    target_date: '',
    status: 'pending'
  });

  const workRequest = workRequests.find(wr => wr.id === parseInt(id));
  useEffect(() => {
    if (workRequest) {
      setFormData({
        customer_id: workRequest.customer_id || '',
        description: workRequest.description || '',
        quote_number: workRequest.quote_number || '',
        po_number: workRequest.po_number || '',
        notes: workRequest.notes || '',
        target_date: workRequest.target_date ? new Date(workRequest.target_date).toISOString().split('T')[0] : '',
        status: workRequest.status || 'pending'
      });
    }
    setLoading(false);
  }, [id, workRequests]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Get customer name from selected customer
      const selectedCustomer = customers.find(c => c.id === parseInt(formData.customer_id));
      
      const updatedData = {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        customer_name: selectedCustomer ? selectedCustomer.name : '',
        project_type: 'general' // Default project type since it's required
      };

      await onUpdateWorkRequest(id, updatedData);
      navigate('/');
    } catch (error) {
      console.error('Error updating work request:', error);
      alert('Failed to update work request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading work request...</p>
      </div>
    );
  }
  if (!workRequest) {
    return <div className="error-container"><h2>Work Request not found</h2><button onClick={() => navigate('/')} className="btn btn-primary">Back to Work Orders</button></div>;
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Edit Work Request</h1>
        <p>Update the details of this work request</p>
      </div>

      <form onSubmit={handleSubmit} className="work-request-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="customer_id">
              <FiUser />
              Customer *
            </label>
            <select
              id="customer_id"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <FiClipboard />
              Work Request Details *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Describe the work request details..."
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
              <option value="quoted">Quoted</option>
              <option value="po-received">PO Received</option>
              <option value="payment">Payment</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Reference Numbers</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quote_number">
                <FiHash />
                Quote Number
              </label>
              <input
                type="text"
                id="quote_number"
                name="quote_number"
                value={formData.quote_number}
                onChange={handleInputChange}
                placeholder="e.g., QU-12345"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="po_number">
                <FiFileText />
                PO Number
              </label>
              <input
                type="text"
                id="po_number"
                name="po_number"
                value={formData.po_number}
                onChange={handleInputChange}
                placeholder="e.g., PO-67890"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="notes">
                <FiFileText />
                Notes
              </label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="target_date">
                <FiCalendar />
                Target Date
              </label>
              <input
                type="date"
                id="target_date"
                name="target_date"
                value={formData.target_date}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          

        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
            disabled={saving}
          >
            <FiX />
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkRequestEditForm; 