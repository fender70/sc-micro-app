import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { API_ENDPOINTS } from './config.js';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import WorkRequestForm from './components/WorkRequestForm.jsx';
import WorkRequestEditForm from './components/WorkRequestEditForm.jsx';
import CustomerForm from './components/CustomerForm.jsx';
import CustomerEditForm from './components/CustomerEditForm.jsx';
import CustomerDetailView from './components/CustomerDetailView.jsx';
import ProjectForm from './components/ProjectForm.jsx';
import ProjectEditForm from './components/ProjectEditForm.jsx';
import CSVUpload from './components/CSVUpload.jsx';
import CustomersOverview from './components/CustomersOverview.jsx';
import ChatInterface from './components/ChatInterface.jsx';
import './App.css';

function App() {
  const [workRequests, setWorkRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data from database API...');
      const [workRequestsRes, customersRes, projectsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.workRequests, { timeout: 5000 }),
        axios.get(API_ENDPOINTS.customers, { timeout: 5000 }),
        axios.get(API_ENDPOINTS.projects, { timeout: 5000 })
      ]);
      
      // Debug logs: print the full data and their types
      console.log('Full workRequests response:', workRequestsRes.data, 'Type:', typeof workRequestsRes.data, Array.isArray(workRequestsRes.data));
      console.log('Full customers response:', customersRes.data, 'Type:', typeof customersRes.data, Array.isArray(customersRes.data));
      console.log('Full projects response:', projectsRes.data, 'Type:', typeof projectsRes.data, Array.isArray(projectsRes.data));
      
      // Check if responses are objects with data properties
      console.log('workRequests keys:', Object.keys(workRequestsRes.data));
      console.log('customers keys:', Object.keys(customersRes.data));
      console.log('projects keys:', Object.keys(projectsRes.data));
      
      // Log the full response structure for debugging
      console.log('workRequests full response:', JSON.stringify(workRequestsRes.data, null, 2));
      console.log('customers full response:', JSON.stringify(customersRes.data, null, 2));
      console.log('projects full response:', JSON.stringify(projectsRes.data, null, 2));
      
      // Extract data from responses - handle both array and object responses
      const workRequestsData = Array.isArray(workRequestsRes.data) ? workRequestsRes.data : 
        (workRequestsRes.data.data || workRequestsRes.data.workRequests || workRequestsRes.data.results || []);
      const customersData = Array.isArray(customersRes.data) ? customersRes.data : 
        (customersRes.data.data || customersRes.data.customers || customersRes.data.results || []);
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : 
        (projectsRes.data.data || projectsRes.data.projects || projectsRes.data.results || []);
      
      console.log('Extracted workRequests data:', workRequestsData, 'Type:', typeof workRequestsData, Array.isArray(workRequestsData));
      console.log('Extracted customers data:', customersData, 'Type:', typeof customersData, Array.isArray(customersData));
      console.log('Extracted projects data:', projectsData, 'Type:', typeof projectsData, Array.isArray(projectsData));
      
      console.log('Data fetched successfully:', {
        workRequests: workRequestsData.length,
        customers: customersData.length,
        projects: projectsData.length
      });

      // Ensure we always have valid arrays
      setWorkRequests(Array.isArray(workRequestsData) ? workRequestsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      
      // Set empty arrays to prevent infinite loading
      setWorkRequests([]);
      setCustomers([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const addWorkRequest = async (workRequestData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.workRequests, workRequestData);
      setWorkRequests([response.data, ...workRequests]);
      return response.data;
    } catch (error) {
      console.error('Error adding work request:', error);
      throw error;
    }
  };

  const updateWorkRequest = async (id, workRequestData) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.workRequests}/${id}`, workRequestData);
      setWorkRequests(workRequests.map(wr => 
        wr.id === id ? response.data : wr
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating work request:', error);
      throw error;
    }
  };

  const deleteWorkRequest = async (id) => {
    try {
      await axios.delete(`${API_ENDPOINTS.workRequests}/${id}`);
      setWorkRequests(workRequests.filter(wr => wr.id !== id));
    } catch (error) {
      console.error('Error deleting work request:', error);
      throw error;
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.customers, customerData);
      setCustomers([...customers, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.customers}/${id}`, customerData);
      setCustomers(customers.map(c => 
        c.id === id ? response.data : c
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const addProject = async (projectData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.projects, projectData);
      setProjects([response.data, ...projects]);
      return response.data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.projects}/${id}`, projectData);
      setProjects(projects.map(p => 
        p.id === id ? response.data : p
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`${API_ENDPOINTS.projects}/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  workRequests={workRequests}
                  customers={customers}
                  projects={projects}
                  onUpdateWorkRequest={updateWorkRequest}
                  onDeleteWorkRequest={deleteWorkRequest}
                  onUpdateProject={updateProject}
                  onDeleteProject={deleteProject}
                  onRefresh={fetchData}
                />
              } 
            />
            <Route 
              path="/customers" 
              element={
                <CustomersOverview 
                  customers={customers}
                  workRequests={workRequests}
                  projects={projects}
                  onRefresh={fetchData}
                />
              } 
            />
            <Route 
              path="/customer/:id" 
              element={
                <CustomerDetailView 
                  customers={customers}
                  workRequests={workRequests}
                  projects={projects}
                  onRefresh={fetchData}
                />
              } 
            />
            <Route 
              path="/add-work-request" 
              element={
                <WorkRequestForm 
                  customers={customers}
                  onSubmit={addWorkRequest}
                />
              } 
            />
            <Route 
              path="/edit-work-request/:id" 
              element={
                <WorkRequestEditForm 
                  workRequests={workRequests}
                  customers={customers}
                  onUpdateWorkRequest={updateWorkRequest}
                />
              } 
            />
            <Route 
              path="/add-customer" 
              element={
                <CustomerForm 
                  onSubmit={addCustomer}
                />
              } 
            />
            <Route 
              path="/edit-customer/:id" 
              element={
                <CustomerEditForm 
                  customers={customers}
                  onUpdateCustomer={updateCustomer}
                />
              } 
            />
            <Route 
              path="/add-project" 
              element={
                <ProjectForm 
                  customers={customers}
                  onSubmit={addProject}
                />
              } 
            />
            <Route 
              path="/edit-project/:id" 
              element={
                <ProjectEditForm 
                  projects={projects}
                  customers={customers}
                  onUpdateProject={updateProject}
                />
              } 
            />
            <Route 
              path="/csv-upload" 
              element={
                <CSVUpload 
                  onUploadSuccess={fetchData}
                />
              } 
            />
                      </Routes>
          </main>
          <ChatInterface />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 