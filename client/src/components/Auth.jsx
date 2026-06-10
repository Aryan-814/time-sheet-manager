import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_URL}/auth/login`, { email, password });
      } else {
        response = await axios.post(`${API_URL}/auth/register-company`, {
          companyName, firstName, lastName, email, password
        });
      }

      //Catch the token from the backend
      const { token } = response.data;
      
      //Save it to the browser's permanent memory
      localStorage.setItem('timesheet_token', token);
      
      //Tell App.jsx to unlock the dashboard
      onLogin(token);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f6f8' }}>
      <div className="content-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#0d47a1', borderRadius: '8px', margin: '0 auto 15px' }}></div>
          <h2 style={{ margin: 0, color: '#111' }}>TimeTracker</h2>
          <p style={{ color: '#666', marginTop: '5px' }}>
            {isLogin ? 'Sign in to your workspace' : 'Register your company'}
          </p>
        </div>

        {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          {!isLogin && (
            <>
              <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="form-input" />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="form-input" />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="form-input" />
              </div>
            </>
          )}

          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            {isLogin ? 'Sign In' : 'Create Workspace'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={{ background: 'none', border: 'none', color: '#0d47a1', cursor: 'pointer', fontWeight: '500' }}
          >
            {isLogin ? "Don't have an account? Register your company." : "Already have an account? Sign in."}
          </button>
        </div>

      </div>
    </div>
  );
}