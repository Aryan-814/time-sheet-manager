import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  //backend data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Reaching out to your Express server!
        const response = await axios.get('http://localhost:5000/api/jobs');
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to connect to the backend.");
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading your dashboard...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Manager Dashboard</h1>
      <p>Welcome back! Here are the active job sites.</p>

      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {jobs.length === 0 ? (
          <p>No jobs found in the database.</p>
        ) : (
          jobs.map((job) => (
            <div 
              key={job._id} 
              style={{ 
                border: '1px solid #ccc', 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h2 style={{ marginTop: 0 }}>{job.title}</h2>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Manager:</strong> {job.managerId.firstName} {job.managerId.lastName}</p>
              
              <div style={{ 
                display: 'inline-block', 
                padding: '4px 8px', 
                backgroundColor: '#e3f2fd', 
                color: '#0d47a1',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                Status: {job.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;