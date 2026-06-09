import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeDashboard() {
  const [userId, setUserId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]); 
  const [selectedJob, setSelectedJob] = useState('');
  const [activeShift, setActiveShift] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, usersResponse] = await Promise.all([
          axios.get(`${API_URL}/jobs`),
          axios.get(`${API_URL}/users`) 
        ]);
        setJobs(jobsResponse.data);
        setUsers(usersResponse.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  const handleClockIn = async (e) => {
    e.preventDefault();
    setMessage('Clocking in...');
    try {
      const response = await axios.post(`${API_URL}/timesheets/clock-in`, { userId, jobId: selectedJob });
      setActiveShift(response.data);
      setMessage('Clocked in successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to clock in.');
    }
  };

  const handleClockOut = async () => {
    setMessage('Calculating hours...');
    try {
      const response = await axios.put(`${API_URL}/timesheets/clock-out/${activeShift._id}`);
      setActiveShift(null);
      setMessage(`Clocked out! Total hours for this shift: ${response.data.totalHours}`);
    } catch (err) {
      console.error(err);
      setMessage('Failed to clock out.');
    }
  };

  return (
    <>
      <h1 className="page-header">Clock In Terminal</h1>
      <div className="content-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        
        {!activeShift ? (
          <form onSubmit={handleClockIn} className="form-grid" style={{ display: 'flex', flexDirection: 'column' }}>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} required className="form-input" style={{ backgroundColor: 'white' }}>
              <option value="" disabled>Who are you? (Select your name)</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.firstName} {user.lastName}</option>
              ))}
            </select>
            
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} required className="form-input" style={{ backgroundColor: 'white' }}>
              <option value="" disabled>Select a Job Site...</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>

            <button type="submit" className="btn-primary" style={{ backgroundColor: '#2e7d32' }}>
              Clock In
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', border: '2px solid #2e7d32', borderRadius: '8px' }}>
            <h3 style={{ color: '#2e7d32', marginTop: 0 }}>Currently Clocked In</h3>
            <p><strong>Shift Started:</strong> {new Date(activeShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <button onClick={handleClockOut} className="btn-primary" style={{ backgroundColor: '#c62828', width: '100%', marginTop: '15px' }}>
              Clock Out
            </button>
          </div>
        )}

        {message && <div className="status-message" style={{ textAlign: 'center', marginTop: '15px' }}>{message}</div>}
      </div>
    </>
  );
}