import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ManagerDashboard({ users, fetchData }) {
  const [jobError, setJobError] = useState('');
  
  // Job Site State 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');

  // Invite State 
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Staff');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteError, setInviteError] = useState('');

  // Network Security State 
  const [allowedIP, setAllowedIP] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityError, setSecurityError] = useState('');

  const handleCreateJob = async (e) => {
    e.preventDefault(); 
    setJobError('');
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
      setJobError(err.response?.data?.error || 'Failed to create job');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLink('');
    
    try {
      const newInvitation = {
        email : inviteEmail,
        role : inviteRole
      };

      const response = await axios.post(`${API_URL}/auth/invite`, newInvitation);

      setInviteLink(response.data.inviteLink);
      setInviteEmail('');
    } catch (error) {
      setInviteError(error.response?.data?.error || 'Failed to generate Link');
    }
  }

  // Handle IP Security Update
  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    setSecurityMessage('');
    setSecurityError('');

    try {
      const response = await axios.put(`${API_URL}/auth/organization/ip`, {
        allowedIP: allowedIP
      });
      setSecurityMessage(response.data.message);
    } catch (error) {
      setSecurityError(error.response?.data?.error || 'Failed to update security settings.');
    }
  };

  return (
    <>
      <h1 className="page-header">Dashboard</h1>
      
      {/* Create Job Site*/}
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
          {jobError && (
            <div style={{ marginTop: '15px', color: '#c62828', fontSize: '14px' }}>
              {jobError}
            </div>
          )}
        </form>
      </div>

      {/* Invite New Team Member */}
      <div className="content-card" style={{ marginTop: '30px' }}>
        <h2 className="card-title">Invite New Team Member</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Generate a secure, one-time link to invite an employee to your organization workspace.
        </p>

        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="email" 
            placeholder="Employee Email" 
            value={inviteEmail} 
            onChange={(e) => setInviteEmail(e.target.value)} 
            required 
            className="form-input"
            style={{ flex: 1, minWidth: '200px', margin: 0 }}
          />
          
          <select 
            value={inviteRole} 
            onChange={(e) => setInviteRole(e.target.value)}
            className="form-input"
            style={{ width: '150px', margin: 0 }}
          >
            <option value="Staff">Staff</option>
            <option value="Manager">Manager</option>
          </select>

          <button type="submit" className="btn-primary" style={{ margin: 0 }}>
            Generate Link
          </button>
        </form>

        {inviteError && (
          <div style={{ marginTop: '15px', color: '#c62828', fontSize: '14px' }}>
            {inviteError}
          </div>
        )}

        {inviteLink && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0d47a1' }}>Invitation Created!</p>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>Send this link to the employee. It will expire in 24 hours.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                readOnly 
                value={inviteLink} 
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' }}
              />
              <button 
                type="button"
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                style={{ padding: '8px 15px', backgroundColor: '#fff', border: '1px solid #0d47a1', color: '#0d47a1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NEW Network Security Settings*/}
      <div className="content-card" style={{ marginTop: '30px' }}>
        <h2 className="card-title">Network Security & Firewall</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Restrict timesheet clock-ins to a specific corporate network, static IP, or authorized company VPN.
        </p>

        <form onSubmit={handleUpdateSecurity} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="e.g., 192.168.1.1 (Leave blank to disable restriction)" 
            value={allowedIP} 
            onChange={(e) => setAllowedIP(e.target.value)} 
            className="form-input"
            style={{ flex: 1, minWidth: '250px', margin: 0 }}
          />
          <button type="submit" className="btn-primary" style={{ margin: 0 }}>
            Save Rules
          </button>
        </form>

        {securityMessage && (
          <div style={{ marginTop: '15px', color: '#2e7d32', fontSize: '14px', fontWeight: '500' }}>
            ✅ {securityMessage}
          </div>
        )}

        {securityError && (
          <div style={{ marginTop: '15px', color: '#c62828', fontSize: '14px' }}>
            ❌ {securityError}
          </div>
        )}
      </div>
    </>
  );
}