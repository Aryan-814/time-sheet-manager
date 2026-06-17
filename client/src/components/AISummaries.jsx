import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AISummaries() {
  const [aiSummary, setAiSummary] = useState('');
  const [anomalies, setAnomalies] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const fetchAIData = async () => {
    setIsAILoading(true);
    setHasRun(true);
    try {
      const token = localStorage.getItem('timesheet_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const summaryRes = await axios.get(`${API_URL}/analytics/ai-summary`, config);
      setAiSummary(summaryRes.data.summary);
      
      const anomaliesRes = await axios.get(`${API_URL}/analytics/ai-anomalies`, config);
      setAnomalies(anomaliesRes.data.anomalies || []);
    } catch (err) {
      console.error("Failed to fetch AI data", err);
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <>
      <h1 className="page-header">AI Summaries & Alerts</h1>
      
      <div className="content-card" style={{ marginBottom: '30px' }}>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Generate a comprehensive AI summary of this week's timesheets and scan for potential fraudulent anomalies.
        </p>
        <button onClick={fetchAIData} disabled={isAILoading} className="btn-primary" style={{ margin: 0 }}>
          {isAILoading ? 'Analyzing...' : 'Run AI Analysis'}
        </button>
      </div>

      {hasRun && (
        <>
          {/* AI Summary Card */}
          <div className="content-card" style={{ marginBottom: '30px'}}>
            <h2 className="card-title" style={{ color: '#265eb2', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AI Weekly Summary
            </h2>
            {isAILoading ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Analyzing week's timesheets...</p>
            ) : (
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
                {aiSummary || "No summary available."}
              </p>
            )}
          </div>

          {/* AI Anomalies Card */}
          {anomalies.length > 0 && (
            <div className="content-card" style={{ marginBottom: '30px'}}>
              <h2 className="card-title" style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                AI Fraud & Anomaly Alerts
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {anomalies.map((anomaly, idx) => (
                  <div key={idx} style={{ padding: '12px', backgroundColor: '#ffebee', borderRadius: '6px', border: '1px solid #ffcdd2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong>{anomaly.employee}</strong>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: anomaly.severity === 'High' ? '#c62828' : anomaly.severity === 'Medium' ? '#f57c00' : '#fbc02d',
                        color: '#fff'
                      }}>
                        {anomaly.severity} Priority
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#b71c1c' }}>{anomaly.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
