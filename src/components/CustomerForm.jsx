import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';
import './CustomerForm.css';

const CustomerForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contact: '',
    address: '',
    notes: ''
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
      navigate('/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">
          <FiUser />
          New Customer
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <FiUser />
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiMail />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <FiPhone />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiUser />
                Contact Person
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter contact person name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiMapPin />
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
                onChange={handleChange}
                className="form-input"
              placeholder="Enter full address"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="3"
              placeholder="Enter any additional notes..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/customers')}
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
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm; 