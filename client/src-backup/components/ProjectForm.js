import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiCalendar, FiDollarSign, FiUser, FiFileText } from 'react-icons/fi';
import axios from 'axios';
import './ProjectForm.css';

const ProjectForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    projectName: '',
    projectDescription: '',
    projectType: 'other',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    targetDate: '',
    budget: '',
    quoteNumber: '',
    poNumber: '',
    projectManager: '',
    technicalLead: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

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
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0
      };

      await onSubmit(projectData);
      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">
          <FiFileText className="form-icon" />
          Add New Project
        </h2>
        <p className="form-subtitle">
          Create a new project for SC Micro
        </p>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer" className="form-label">
                Customer *
              </label>
              <select
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.company || customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="projectName" className="form-label">
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter project name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="projectDescription" className="form-label">
              Project Description
            </label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe the project details, requirements, and objectives"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectType" className="form-label">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="other">Other</option>
                <option value="wirebond">Wirebond</option>
                <option value="die-attach">Die Attach</option>
                <option value="flip-chip">Flip Chip</option>
                <option value="encapsulation">Encapsulation</option>
                <option value="assembly">Assembly</option>
                <option value="testing">Testing</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <FiCalendar className="section-icon" />
            Timeline
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="targetDate" className="form-label">
                Target Date
              </label>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <FiDollarSign className="section-icon" />
            Financial Information
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget" className="form-label">
                Budget ($)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="form-input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quoteNumber" className="form-label">
                Quote Number
              </label>
              <input
                type="text"
                id="quoteNumber"
                name="quoteNumber"
                value={formData.quoteNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Q-2024-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="poNumber" className="form-label">
                PO Number
              </label>
              <input
                type="text"
                id="poNumber"
                name="poNumber"
                value={formData.poNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., PO-2024-001"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <FiUser className="section-icon" />
            Team Information
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectManager" className="form-label">
                Project Manager
              </label>
              <input
                type="text"
                id="projectManager"
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter project manager name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="technicalLead" className="form-label">
                Technical Lead
              </label>
              <input
                type="text"
                id="technicalLead"
                name="technicalLead"
                value={formData.technicalLead}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter technical lead name"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Add any additional notes, requirements, or special considerations"
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
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
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm; 