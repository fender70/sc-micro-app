import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import WorkRequestForm from './components/WorkRequestForm';
import WorkRequestEditForm from './components/WorkRequestEditForm';
import CustomerForm from './components/CustomerForm';
import CustomerEditForm from './components/CustomerEditForm';
import CustomerDetailView from './components/CustomerDetailView';
import ProjectForm from './components/ProjectForm';
import ProjectEditForm from './components/ProjectEditForm';
import CSVUpload from './components/CSVUpload';
import CustomersOverview from './components/CustomersOverview';
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
      const [workRequestsRes, customersRes, projectsRes] = await Promise.all([
        axios.get('/api/workrequests'),
        axios.get('/api/customers'),
        axios.get('/api/projects')
      ]);
      
      setWorkRequests(workRequestsRes.data);
      setCustomers(customersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkRequest = async (workRequestData) => {
    try {
      const response = await axios.post('/api/workrequests', workRequestData);
      setWorkRequests([response.data, ...workRequests]);
      return response.data;
    } catch (error) {
      console.error('Error adding work request:', error);
      throw error;
    }
  };

  const updateWorkRequest = async (id, workRequestData) => {
    try {
      const response = await axios.put(`/api/workrequests/${id}`, workRequestData);
      setWorkRequests(workRequests.map(wr => 
        wr._id === id ? response.data : wr
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating work request:', error);
      throw error;
    }
  };

  const deleteWorkRequest = async (id) => {
    try {
      await axios.delete(`/api/workrequests/${id}`);
      setWorkRequests(workRequests.filter(wr => wr._id !== id));
    } catch (error) {
      console.error('Error deleting work request:', error);
      throw error;
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const response = await axios.post('/api/customers', customerData);
      setCustomers([...customers, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const response = await axios.put(`/api/customers/${id}`, customerData);
      setCustomers(customers.map(c => 
        c._id === id ? response.data : c
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const addProject = async (projectData) => {
    try {
      const response = await axios.post('/api/projects', projectData);
      setProjects([response.data, ...projects]);
      return response.data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const response = await axios.put(`/api/projects/${id}`, projectData);
      setProjects(projects.map(p => 
        p._id === id ? response.data : p
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`/api/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
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
      <Router>
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
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 