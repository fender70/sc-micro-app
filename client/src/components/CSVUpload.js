import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiDownload, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import './CSVUpload.css';

const CSVUpload = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setUploadResult(null);
    } else {
      alert('Please drop a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await axios.post('/api/csv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      
      if (response.data.summary.successful > 0) {
        // Refresh the dashboard data
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        msg: 'Upload failed',
        summary: { totalProcessed: 0, successful: 0, errors: 1 },
        errors: [{ row: 0, error: error.response?.data?.msg || 'Upload failed' }]
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/api/csv/template', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'work-orders-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      alert('Failed to download template');
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadResult(null);
  };

  return (
    <div className="container">
      <div className="csv-upload-container">
        <h2 className="csv-upload-title">
          <FiUpload />
          CSV Work Order Upload
        </h2>

        <div className="csv-upload-content">
          {/* Template Download */}
          <div className="template-section">
            <h3>Step 1: Download Template</h3>
            <p>Download the CSV template to see the required format:</p>
            <button onClick={downloadTemplate} className="btn btn-outline">
              <FiDownload />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="upload-section">
            <h3>Step 2: Upload CSV File</h3>
            <p>Upload your CSV file with work order data:</p>
            
            <div 
              className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="file-input"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="file-label">
                {file ? (
                  <div className="file-selected">
                    <FiCheck />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <FiUpload />
                    <span>Drop CSV file here or click to browse</span>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <div className="file-actions">
                <button onClick={handleUpload} className="btn btn-primary" disabled={uploading}>
                  <FiUpload />
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
                <button onClick={resetForm} className="btn btn-outline">
                  <FiX />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className="upload-results">
              <h3>Upload Results</h3>
              
              <div className="results-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Processed:</span>
                  <span className="summary-value">{uploadResult.summary.totalProcessed}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Successful:</span>
                  <span className="summary-value success">{uploadResult.summary.successful}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Errors:</span>
                  <span className="summary-value error">{uploadResult.summary.errors}</span>
                </div>
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="error-list">
                  <h4>Errors:</h4>
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="error-item">
                      <FiAlertCircle />
                      <span>Row {error.row}: {error.error}</span>
                    </div>
                  ))}
                </div>
              )}

              {uploadResult.summary.successful > 0 && (
                <div className="success-message">
                  <FiCheck />
                  <span>Successfully uploaded {uploadResult.summary.successful} work orders!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="csv-upload-actions">
          <button onClick={() => navigate('/')} className="btn btn-outline">
            <FiX />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload; 