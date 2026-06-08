import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  // STATE MANAGEMENT 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  //API CALLS 
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs`);
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to connect to the backend.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault(); 
    setSubmitMessage('Creating...');

    try {
      const newJobData = {
        title,
        description,
        managerId,
        coordinates: [parseFloat(lng), parseFloat(lat)] 
      };

      await axios.post(`${API_URL}/jobs`, newJobData);

      setTitle('');
      setDescription('');
      setManagerId('');
      setLng('');
      setLat('');
      setSubmitMessage('Job created successfully!');
      
      fetchJobs();

      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (err) {
      console.error("Error creating job:", err);
      setSubmitMessage('Failed to create job. Ensure your Manager ID is valid.');
    }
  };

  // RENDER
  if (loading) return <div className="loading-error-state">Loading your dashboard...</div>;
  if (error) return <div className="loading-error-state" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Manager Dashboard</h1>
      
      {/* --- CREATE JOB FORM --- */}
      <div className="form-container">
        <h2 className="section-header">Create New Job Site</h2>
        
        <form onSubmit={handleCreateJob} className="job-form">
          <input 
            type="text" 
            placeholder="Job Title (e.g., Build Site Beta)" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className="form-input"
          />
          <input 
            type="text" 
            placeholder="Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            className="form-input"
          />
          <input 
            type="text" 
            placeholder="Manager ID (Paste a valid User ID here)" 
            value={managerId} 
            onChange={(e) => setManagerId(e.target.value)} 
            required 
            className="form-input"
          />
          
          <div className="input-row">
            <input 
              type="number" 
              step="any" 
              placeholder="Longitude (e.g., 77.20)" 
              value={lng} 
              onChange={(e) => setLng(e.target.value)} 
              required 
              className="form-input"
            />
            <input 
              type="number" 
              step="any" 
              placeholder="Latitude (e.g., 28.61)" 
              value={lat} 
              onChange={(e) => setLat(e.target.value)} 
              required 
              className="form-input"
            />
          </div>

          <button type="submit" className="primary-button">
            Create Job
          </button>
          
          {submitMessage && <div className="status-message">{submitMessage}</div>}
        </form>
      </div>

      {/* --- ACTIVE JOB LIST --- */}
      <h2 className="list-header">Active Job Sites</h2>
      
      <div className="job-grid">
        {jobs.length === 0 ? (
          <p>No jobs found in the database.</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p>
                <strong>Manager:</strong> {job.managerId?.firstName} {job.managerId?.lastName}
              </p>
              <div className="status-tag">
                {job.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;