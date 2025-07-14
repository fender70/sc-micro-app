import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import WorkRequestForm from './components/WorkRequestForm';
import CustomerForm from './components/CustomerForm';
import CSVUpload from './components/CSVUpload';
import './App.css';

function App() {
  const [workRequests, setWorkRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workRequestsRes, customersRes] = await Promise.all([
        axios.get('/api/workrequests'),
        axios.get('/api/customers')
      ]);
      
      setWorkRequests(workRequestsRes.data);
      setCustomers(customersRes.data);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
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
                  onUpdateWorkRequest={updateWorkRequest}
                  onDeleteWorkRequest={deleteWorkRequest}
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
              path="/add-customer" 
              element={
                <CustomerForm 
                  onSubmit={addCustomer}
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
  );
}

export default App; 