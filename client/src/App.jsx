import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import EmployeeDashboard from './EmployeeDashboard';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [view, setView] = useState('manager'); 

  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  // Update fetch data to get both Jobs AND Users
  const fetchData = async () => {
    try {
      const [jobsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/jobs`),
        axios.get(`${API_URL}/users`) 
      ]);
      setJobs(jobsRes.data);
      setUsers(usersRes.data); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to connect to the backend.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault(); 
    setSubmitMessage('Creating...');

    try {
      const newJobData = {
        title, description, managerId,
        coordinates: [parseFloat(lng), parseFloat(lat)] 
      };

      await axios.post(`${API_URL}/jobs`, newJobData);

      setTitle(''); setDescription(''); setManagerId(''); setLng(''); setLat('');
      setSubmitMessage('Job created successfully!');
      fetchData(); 
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (err) {
      console.error("Error creating job:", err);
      setSubmitMessage('Failed to create job.');
    }
  };

  if (loading) return <div className="loading-error-state">Loading your dashboard...</div>;
  if (error) return <div className="loading-error-state" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="dashboard-container">
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <button onClick={() => setView('manager')} className="primary-button" style={{ backgroundColor: view === 'manager' ? '#0d47a1' : '#ccc' }}>Manager View</button>
        <button onClick={() => setView('employee')} className="primary-button" style={{ backgroundColor: view === 'employee' ? '#0d47a1' : '#ccc' }}>Employee View</button>
      </div>

      {view === 'employee' ? (
        <EmployeeDashboard />
      ) : (
        <>
          <h1>Manager Dashboard</h1>
          
          <div className="form-container">
            <h2 className="section-header">Create New Job Site</h2>
            <form onSubmit={handleCreateJob} className="job-form">
              <input type="text" placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input"/>
              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="form-input"/>
              
              <select 
                value={managerId} 
                onChange={(e) => setManagerId(e.target.value)} 
                required 
                className="form-input"
                style={{ backgroundColor: 'white' }}
              >
                <option value="" disabled>Assign a Manager...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
              
              <div className="input-row">
                <input type="number" step="any" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} required className="form-input"/>
                <input type="number" step="any" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} required className="form-input"/>
              </div>

              <button type="submit" className="primary-button">Create Job</button>
              {submitMessage && <div className="status-message">{submitMessage}</div>}
            </form>
          </div>

          <h2 className="list-header">Active Job Sites</h2>
          <div className="job-grid">
            {jobs.length === 0 ? <p>No jobs found.</p> : (
              jobs.map((job) => (
                <div key={job._id} className="job-card">
                  <h3>{job.title}</h3>
                  <p>{job.description}</p>
                  <p><strong>Manager:</strong> {job.managerId?.firstName} {job.managerId?.lastName}</p>
                  <div className="status-tag">{job.status}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}

    </div>
  );
}

export default App;