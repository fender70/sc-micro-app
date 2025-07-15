import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiCalendar, FiHash, FiFileText, FiUser, FiFolder, FiDollarSign, FiUsers } from 'react-icons/fi';
import './ProjectEditForm.css';

const ProjectEditForm = ({ projects, customers, onUpdateProject }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    customer: '',
    projectType: '',
    status: 'planning',
    priority: 'medium',
    budget: '',
    actualCost: '',
    startDate: '',
    targetDate: '',
    completionDate: '',
    projectManager: '',
    technicalLead: '',
    quoteNumber: '',
    poNumber: '',
    invoiceNumber: '',
    amountInvoiced: '',
    notes: ''
  });

  useEffect(() => {
    const project = projects.find(p => p._id === id);
    if (project) {
      setFormData({
        projectName: project.projectName || '',
        projectDescription: project.projectDescription || '',
        customer: project.customer?._id || '',
        projectType: project.projectType || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        budget: project.budget || '',
        actualCost: project.actualCost || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        targetDate: project.targetDate ? new Date(project.targetDate).toISOString().split('T')[0] : '',
        completionDate: project.completionDate ? new Date(project.completionDate).toISOString().split('T')[0] : '',
        projectManager: project.projectManager || '',
        technicalLead: project.technicalLead || '',
        quoteNumber: project.quoteNumber || '',
        poNumber: project.poNumber || '',
        invoiceNumber: project.invoiceNumber || '',
        amountInvoiced: project.amountInvoiced || '',
        notes: project.notes || ''
      });
    }
    setLoading(false);
  }, [id, projects]);

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
      // Convert budget and actualCost to numbers
      const updatedData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : 0,
        amountInvoiced: formData.amountInvoiced ? parseFloat(formData.amountInvoiced) : 0
      };

      await onUpdateProject(id, updatedData);
      navigate('/');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
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
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Edit Project</h1>
        <p>Update the details of this project</p>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="projectName">
              <FiFolder />
              Project Name *
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              required
              placeholder="Enter project name..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectDescription">
              Project Description *
            </label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Describe the project..."
              className="form-textarea"
            />
          </div>

          <div className="form-row">
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
              <label htmlFor="projectType">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select project type</option>
                <option value="wirebond">Wirebond</option>
                <option value="die-attach">Die Attach</option>
                <option value="flip-chip">Flip Chip</option>
                <option value="encapsulation">Encapsulation</option>
                <option value="assembly">Assembly</option>
                <option value="testing">Testing</option>
                <option value="packaging">Packaging</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
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
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
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
          <h2>Financial Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">
                <FiDollarSign />
                Budget ($)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="actualCost">
                <FiDollarSign />
                Actual Cost ($)
              </label>
              <input
                type="number"
                id="actualCost"
                name="actualCost"
                value={formData.actualCost}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amountInvoiced">
                <FiDollarSign />
                Amount Invoiced ($)
              </label>
              <input
                type="number"
                id="amountInvoiced"
                name="amountInvoiced"
                value={formData.amountInvoiced}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Timeline</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                <FiCalendar />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="targetDate">
                <FiCalendar />
                Target Date
              </label>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="completionDate">
              <FiCalendar />
              Completion Date
            </label>
            <input
              type="date"
              id="completionDate"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Team & References</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectManager">
                <FiUsers />
                Project Manager
              </label>
              <input
                type="text"
                id="projectManager"
                name="projectManager"
                value={formData.projectManager}
                onChange={handleInputChange}
                placeholder="Project manager name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="technicalLead">
                <FiUsers />
                Technical Lead
              </label>
              <input
                type="text"
                id="technicalLead"
                name="technicalLead"
                value={formData.technicalLead}
                onChange={handleInputChange}
                placeholder="Technical lead name"
                className="form-input"
              />
            </div>
          </div>

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
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Additional notes about the project..."
              className="form-textarea"
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

export default ProjectEditForm; 