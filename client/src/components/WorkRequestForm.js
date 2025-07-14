import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiFileText, FiCalendar } from 'react-icons/fi';
import './WorkRequestForm.css';

const WorkRequestForm = ({ customers, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: '',
    workRequestDetails: '',
    quoteNumber: '',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      navigate('/');
    } catch (error) {
      console.error('Error creating work request:', error);
      alert('Error creating work request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">
          <FiFileText />
          New Work Request
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <FiUser />
              Customer *
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} {customer.company && `(${customer.company})`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiFileText />
              Work Request Details *
            </label>
            <textarea
              name="workRequestDetails"
              value={formData.workRequestDetails}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Describe the work request details..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <FiFileText />
                Quote # (from Xero)
              </label>
              <input
                type="text"
                name="quoteNumber"
                value={formData.quoteNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter quote number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiFileText />
                PO # (from customer)
              </label>
              <input
                type="text"
                name="poNumber"
                value={formData.poNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter PO number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <FiFileText />
                Invoice # (from Xero)
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter invoice number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiCalendar />
                Ship Date
              </label>
              <input
                type="date"
                name="shipDate"
                value={formData.shipDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiFileText />
              SC Micro Report URL
            </label>
            <input
              type="url"
              name="scMicroReport"
              value={formData.scMicroReport}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter report URL or file path"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-outline"
              disabled={loading}
            >
              <FiX />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FiSave />
              {loading ? 'Creating...' : 'Create Work Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkRequestForm; 