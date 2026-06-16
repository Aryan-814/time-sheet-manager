import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function OvertimeWatchlist() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Fetch the data 
        const res = await axios.get(`${API_URL}/analytics/overtime`);
        setReport(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load overtime analytics.');
        setLoading(false);
      }
    };
    
    fetchReport();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading overtime data...</div>;
  if (error) return <div style={{ padding: '20px', color: '#c62828' }}>{error}</div>;

  return (
    <div className="content-card" style={{ marginBottom: '30px' }}>
      <h2 className="card-title">Weekly Overtime Watchlist</h2>
      <p style={{ color: '#666', marginBottom: '25px' }}>
        Real-time monitoring of employee hours for the current week.
      </p>

      {report.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No timesheet data recorded for this week yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {report.map((employee) => {
            const hours = employee.totalWeeklyHours;
            
            // Calculate progress bar width
            const percentage = Math.min((hours / 50) * 100, 100);

            // Default 
            let barColor = '#2e7d32'; 
            let badgeBg = '#e8f5e9';
            let badgeColor = '#2e7d32';

            // Overtime
            if (employee.status === 'Overtime Risk') {
              barColor = '#c62828'; 
              badgeBg = '#ffebee';
              badgeColor = '#c62828';
            } 
            // approaching Overtime
            else if (employee.status === 'Approaching Overtime') {
              barColor = '#f57c00'; 
              badgeBg = '#fff3e0';
              badgeColor = '#f57c00';
            }

            return (
              <div key={employee._id} style={{ border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                
                {/* Name and Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '18px', color: '#111' }}>
                    {employee.firstName} {employee.lastName}
                  </strong>
                  <span style={{
                    backgroundColor: badgeBg,
                    color: badgeColor,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {employee.status}
                  </span>
                </div>

                {/*  Hour Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                  <span>{hours} / 40 hours</span>
                  {employee.status === 'Overtime Risk' && (
                    <span style={{ color: '#c62828', fontWeight: 'bold' }}>
                      +{(hours - 40).toFixed(2)} hrs OT
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '12px', backgroundColor: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: barColor,
                    transition: 'width 1s ease-in-out'
                  }}></div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}