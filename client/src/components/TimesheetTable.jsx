export default function TimesheetTable({timesheets}) {
    return (
        <>
            <h1 className="page-header">Timesheets</h1>
            
            <div className="table-container">
                <table className="data-table">
                    <thead>
                    <tr>
                    <th>Member</th>
                    <th>Job Site</th>
                    <th>First in</th>
                    <th>Last out</th>
                    <th>Tracked Hours</th>
                    </tr>
                    </thead>
                    <tbody>
                        {timesheets.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No timesheets recorded yet.</td>
                            </tr>
                        ) : (
                        timesheets.map((sheet) => (
                            <tr key={sheet._id}>
                            <td style={{fontWeight: '500'}}>{sheet.userId?.firstName} {sheet.userId?.lastName}</td>
                            <td style={{color: '#666'}}>{sheet.jobId?.title}</td>
                            <td>{new Date(sheet.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td>
                                {sheet.endTime 
                                ? new Date(sheet.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                                : <span className="status-active">Active Now</span>}
                            </td>
                            <td>
                                {sheet.totalHours !== undefined ? <strong>{sheet.totalHours}h</strong> : '-'}
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}