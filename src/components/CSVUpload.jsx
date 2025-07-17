import React, { useState } from 'react';
import { FiUpload, FiDownload, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import './CSVUpload.css';

const CSVUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvType, setCsvType] = useState('workorders');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [componentError, setComponentError] = useState(null);

  // Error boundary for the component
  if (componentError) {
    return (
      <div className="csv-upload-container">
        <div className="error-message">
          <FiAlertCircle />
          Something went wrong. Please refresh the page and try again.
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid CSV file');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', csvType);

    try {
      const response = await axios.post('/api/csv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      setSelectedFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Upload failed. Please try again.');
      setUploadResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(`/api/csv/template?type=${csvType}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', csvType === 'projects' ? 'projects-template.csv' : 'work-orders-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      setError('Failed to download template. Please try again.');
    }
  };

  const getTemplateDescription = () => {
    if (csvType === 'projects') {
      return 'Download a template for project data including customer, project name, type, status, timeline, and team information.';
    }
    return 'Download a template for work order data including company name, contact, status, quote numbers, and project details.';
  };

  const getUploadDescription = () => {
    if (csvType === 'projects') {
      return 'Upload a CSV file containing project information. The file should include customer, project name, type, status, and other project details.';
    }
    return 'Upload a CSV file containing work order information. The file should include company name, contact, status, quote numbers, and project details.';
  };

  return (
    <div className="csv-upload-container">
      <div className="upload-header">
        <h2 className="upload-title">
          <FiFileText className="upload-icon" />
          CSV Upload
        </h2>
        <p className="upload-subtitle">
          Upload work orders or projects from CSV files
        </p>
      </div>

      <div className="upload-content">
        {/* CSV Type Selection */}
        <div className="csv-type-selector">
          <h3 className="section-title">Select CSV Type</h3>
          <div className="type-options">
            <label className="type-option">
              <input
                type="radio"
                name="csvType"
                value="workorders"
                checked={csvType === 'workorders'}
                onChange={(e) => setCsvType(e.target.value)}
              />
              <div className="type-content">
                <FiFileText className="type-icon" />
                <div>
                  <div className="type-label">Work Orders</div>
                  <div className="type-description">Upload work order data</div>
                </div>
              </div>
            </label>
            
            <label className="type-option">
              <input
                type="radio"
                name="csvType"
                value="projects"
                checked={csvType === 'projects'}
                onChange={(e) => setCsvType(e.target.value)}
              />
              <div className="type-content">
                <FiFileText className="type-icon" />
                <div>
                  <div className="type-label">Projects</div>
                  <div className="type-description">Upload project data</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Template Download */}
        <div className="template-section">
          <h3 className="section-title">Download Template</h3>
          <p className="template-description">
            {getTemplateDescription()}
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="btn btn-outline"
            disabled={uploading}
          >
            <FiDownload />
            Download {csvType === 'projects' ? 'Projects' : 'Work Orders'} Template
          </button>
        </div>

        {/* File Upload */}
        <div className="upload-section">
          <h3 className="section-title">Upload CSV File</h3>
          <p className="upload-description">
            {getUploadDescription()}
          </p>
          
          <div
            className={`upload-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <FiUpload className="upload-icon-large" />
              <div className="upload-text">
                {selectedFile ? (
                  <>
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </>
                ) : (
                  <>
                    <div className="upload-title-text">
                      Drag and drop your CSV file here
                    </div>
                    <div className="upload-subtitle-text">
                      or click to browse files
                    </div>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                Choose File
              </label>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FiAlertCircle />
              {error}
            </div>
          )}

          {uploadResult && (
            <div className="upload-result">
              <div className="result-header">
                <FiCheckCircle className="success-icon" />
                <span className="result-title">Upload Successful!</span>
              </div>
              <div className="result-summary">
                <div className="result-item">
                  <span className="result-label">Message:</span>
                  <span className="result-value">{uploadResult.message}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Processed:</span>
                  <span className="result-value success">{uploadResult.processed}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Added:</span>
                  <span className="result-value success">{uploadResult.added}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Updated:</span>
                  <span className="result-value success">{uploadResult.updated}</span>
                </div>
              </div>
            </div>
          )}

          <div className="upload-actions">
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={!selectedFile || uploading}
            >
              <FiUpload />
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload; 