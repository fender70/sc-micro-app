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
    customer: '',
    workRequestDetails: '',
    quoteNumber: '',
    poNumber: '',
    invoiceNumber: '',
    scMicroReport: '',
    shipDate: '',
    status: 'pending'
  });

  useEffect(() => {
    const workRequest = workRequests.find(wr => wr._id === id);
    if (workRequest) {
      setFormData({
        customer: workRequest.customer?._id || '',
        workRequestDetails: workRequest.workRequestDetails || '',
        quoteNumber: workRequest.quoteNumber || '',
        poNumber: workRequest.poNumber || '',
        invoiceNumber: workRequest.invoiceNumber || '',
        scMicroReport: workRequest.scMicroReport || '',
        shipDate: workRequest.shipDate ? new Date(workRequest.shipDate).toISOString().split('T')[0] : '',
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
      await onUpdateWorkRequest(id, formData);
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
            <label htmlFor="customer">
              <FiUser />
              Customer *
            </label>
            <select
              id="customer"
              name="customer"
              value={formData.customer}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.company || customer.name} {customer.company && customer.name && `(${customer.name})`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="workRequestDetails">
              <FiClipboard />
              Work Request Details *
            </label>
            <textarea
              id="workRequestDetails"
              name="workRequestDetails"
              value={formData.workRequestDetails}
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
              <label htmlFor="quoteNumber">
                <FiHash />
                Quote Number
              </label>
              <input
                type="text"
                id="quoteNumber"
                name="quoteNumber"
                value={formData.quoteNumber}
                onChange={handleInputChange}
                placeholder="e.g., QU-12345"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="poNumber">
                <FiFileText />
                PO Number
              </label>
              <input
                type="text"
                id="poNumber"
                name="poNumber"
                value={formData.poNumber}
                onChange={handleInputChange}
                placeholder="e.g., PO-67890"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="invoiceNumber">
                <FiFileText />
                Invoice Number
              </label>
              <input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                placeholder="e.g., INV-11111"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shipDate">
                <FiCalendar />
                Ship Date
              </label>
              <input
                type="date"
                id="shipDate"
                name="shipDate"
                value={formData.shipDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="scMicroReport">
              SC Micro Report URL
            </label>
            <input
              type="url"
              id="scMicroReport"
              name="scMicroReport"
              value={formData.scMicroReport}
              onChange={handleInputChange}
              placeholder="https://example.com/report.pdf"
              className="form-input"
            />
          </div>
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