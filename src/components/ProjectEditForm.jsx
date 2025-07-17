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
    name: '',
    description: '',
    customer_id: '',
    type: '',
    status: 'planning',
    priority: 'medium',
    budget: '',
    actual_cost: '',
    start_date: '',
    target_date: '',
    completion_date: '',
    project_manager: '',
    technical_lead: '',
    quote_number: '',
    po_number: '',
    notes: ''
  });

  const project = projects.find(p => p.id === parseInt(id));
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        customer_id: project.customer_id || '',
        type: project.type || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        budget: project.budget || '',
        actual_cost: project.actual_cost || '',
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
        target_date: project.target_date ? new Date(project.target_date).toISOString().split('T')[0] : '',
        completion_date: project.completion_date ? new Date(project.completion_date).toISOString().split('T')[0] : '',
        project_manager: project.project_manager || '',
        technical_lead: project.technical_lead || '',
        quote_number: project.quote_number || '',
        po_number: project.po_number || '',
        notes: project.notes || ''
      });
    }
    setLoading(false);
  }, [id, projects, project]);

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
      
      // Convert budget and actual_cost to numbers
      const updatedData = {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        customer_name: selectedCustomer ? selectedCustomer.name : '',
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : 0
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
  if (!project) {
    return <div className="error-container"><h2>Project not found</h2><button onClick={() => navigate('/')} className="btn btn-primary">Back to Projects</button></div>;
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
            <label htmlFor="name">
              <FiFolder />
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter project name..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Project Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Describe the project..."
              className="form-textarea"
            />
          </div>

          <div className="form-row">
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
              <label htmlFor="type">
                Project Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
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
              <label htmlFor="actual_cost">
                <FiDollarSign />
                Actual Cost ($)
              </label>
              <input
                type="number"
                id="actual_cost"
                name="actual_cost"
                value={formData.actual_cost}
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
              <label htmlFor="start_date">
                <FiCalendar />
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
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

          <div className="form-group">
            <label htmlFor="completion_date">
              <FiCalendar />
              Completion Date
            </label>
            <input
              type="date"
              id="completion_date"
              name="completion_date"
              value={formData.completion_date}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Team & References</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project_manager">
                <FiUsers />
                Project Manager
              </label>
              <input
                type="text"
                id="project_manager"
                name="project_manager"
                value={formData.project_manager}
                onChange={handleInputChange}
                placeholder="Project manager name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="technical_lead">
                <FiUsers />
                Technical Lead
              </label>
              <input
                type="text"
                id="technical_lead"
                name="technical_lead"
                value={formData.technical_lead}
                onChange={handleInputChange}
                placeholder="Technical lead name"
                className="form-input"
              />
            </div>
          </div>

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