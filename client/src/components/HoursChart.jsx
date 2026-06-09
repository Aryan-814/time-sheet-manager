import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HoursChart({ timesheets }) {
  const [chartView, setChartView] = useState('team');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const uniqueEmployees = [...new Map(timesheets.map(sheet => 
    [sheet.userId?._id, { id: sheet.userId?._id, name: `${sheet.userId?.firstName} ${sheet.userId?.lastName}` }]
  )).values()].filter(emp => emp.id);

  useEffect(() => {
    if (uniqueEmployees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(uniqueEmployees[0].id);
    }
  }, [timesheets, selectedEmpId]);
  
  const teamAggregatedData = timesheets.reduce((acc, sheet) => {
    if (sheet.totalHours === undefined) return acc; 
    const employeeName = `${sheet.userId?.firstName} ${sheet.userId?.lastName}`;
    if (!acc[employeeName]) acc[employeeName] = 0;
    acc[employeeName] += sheet.totalHours;
    return acc;
  }, {});

  const teamChartData = Object.keys(teamAggregatedData).map(name => ({
    name: name,
    hours: Number(teamAggregatedData[name].toFixed(2))
  }));

  const dailyAggregatedData = timesheets
    .filter(sheet => sheet.userId?._id === selectedEmpId && sheet.totalHours !== undefined)
    .reduce((acc, sheet) => {
      const dateString = new Date(sheet.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (!acc[dateString]) acc[dateString] = 0;
      acc[dateString] += sheet.totalHours;
      return acc;
    }, {});

  const dailyChartData = Object.keys(dailyAggregatedData).map(date => ({
    date: date,
    hours: Number(dailyAggregatedData[date].toFixed(2))
  }));

  const activeData = chartView === 'team' ? teamChartData : dailyChartData;
  const activeXAxisKey = chartView === 'team' ? "name" : "date";

  return (
    <div className="content-card" style={{ height: '450px', marginBottom: '30px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <h2 className="card-title" style={{ margin: 0 }}>Analytics</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {chartView === 'daily' && (
            <select 
              value={selectedEmpId} 
              onChange={(e) => setSelectedEmpId(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {uniqueEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', backgroundColor: '#f0f4f8', borderRadius: '6px', padding: '4px' }}>
            <button 
              onClick={() => setChartView('team')}
              style={{ padding: '6px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', backgroundColor: chartView === 'team' ? '#ffffff' : 'transparent', color: chartView === 'team' ? '#0d47a1' : '#666', boxShadow: chartView === 'team' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Team Total
            </button>
            <button 
              onClick={() => setChartView('daily')}
              style={{ padding: '6px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', backgroundColor: chartView === 'daily' ? '#ffffff' : 'transparent', color: chartView === 'daily' ? '#0d47a1' : '#666', boxShadow: chartView === 'daily' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Daily Breakdown
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {activeData.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '100px' }}>No completed shifts to display for this view.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey={activeXAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#666' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666' }} />
              <Tooltip 
                cursor={{ fill: '#f5f6f8' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="hours" fill="#0d47a1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}