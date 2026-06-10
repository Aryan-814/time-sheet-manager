import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import ManagerDashboard from './components/ManagerDashboard';
import TimesheetTable from './components/TimesheetTable';
import EmployeeDashboard from './components/EmployeeDashboard';
import HoursChart from './components/HoursChart';
import Auth from './components/Auth';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {

  const [token, setToken] = useState(localStorage.getItem('timesheet_token'))
  
  const [view, setView] = useState('manager'); 
  const [users, setUsers] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {

    if(!token) return;

    try {
      const [usersRes, timesheetsRes] = await Promise.all([
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/timesheets`) 
      ]);
      setUsers(usersRes.data);
      setTimesheets(timesheetsRes.data); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to connect to the backend.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('timesheet_token');
    setToken(null);
  }

  if(!token) {
    return <Auth onLogin={setToken} />;
  }

  if (loading) return <div style={{padding: '40px'}}>Loading workspace...</div>;
  if (error) return <div style={{padding: '40px', color: 'red'}}>{error}</div>;

  return (
    <div className="app-layout">

      <header className="top-navbar">
        <div className="navbar-brand">
          TimeTracker
        </div>
        
        <nav className="navbar-nav">
          <button className={`nav-button ${view === 'manager' ? 'active' : ''}`} onClick={() => { setView('manager'); fetchData(); }}>
            Dashboard
          </button>
          <button className={`nav-button ${view === 'timesheets' ? 'active' : ''}`} onClick={() => { setView('timesheets'); fetchData(); }}>
            Timesheets
          </button>
          <button className={`nav-button ${view === 'analytics' ? 'active' : ''}`} onClick={() => { setView('analytics'); fetchData(); }}>
            Analytics
          </button>
          <button className={`nav-button ${view === 'employee' ? 'active' : ''}`} onClick={() => setView('employee')}>
            Clock In Terminal
          </button>
          <button onClick={handleLogout} className='nav-button'>
            Logout
          </button>
        </nav>
      </header>

      <main className="content-area">
        {view === 'employee' && <EmployeeDashboard />}
        {view === 'manager' && <ManagerDashboard users={users} fetchData={fetchData} />}
        {view == 'analytics' && <HoursChart timesheets={timesheets} />}
        {view === 'timesheets' && <TimesheetTable timesheets={timesheets} />}
      </main>

    </div>
  );
}

export default App;