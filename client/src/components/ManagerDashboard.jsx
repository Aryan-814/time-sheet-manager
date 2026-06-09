import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ManagerDashboard({ users, fetchData }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');

  const handleCreateJob = async (e) => {
    e.preventDefault(); 
    try {
      const newJobData = {
        title, description, managerId,
        coordinates: [parseFloat(lng), parseFloat(lat)] 
      };
      await axios.post(`${API_URL}/jobs`, newJobData);
      setTitle(''); setDescription(''); setManagerId(''); setLng(''); setLat('');
      fetchData(); 
    } catch (err) {
      console.error("Error creating job:", err);
    }
  };

  return (
    <>
      <h1 className="page-header">Dashboard</h1>
      
      <div className="content-card">
        <h2 className="card-title">Create Job Site</h2>
        <form onSubmit={handleCreateJob}>
          <div className="form-grid">
            <input type="text" placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input"/>
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="form-input"/>
            
            <select value={managerId} onChange={(e) => setManagerId(e.target.value)} required className="form-input" style={{gridColumn: 'span 2'}}>
              <option value="" disabled>Assign a Manager...</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.firstName} {user.lastName}</option>
              ))}
            </select>
            
            <input type="number" step="any" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} required className="form-input"/>
            <input type="number" step="any" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} required className="form-input"/>
          </div>
          <button type="submit" className="btn-primary">Create Site</button>
        </form>
      </div>
    </>
  );
}