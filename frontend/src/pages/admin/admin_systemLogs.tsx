import React from 'react';
import './admin_systemLogs.css';

interface LogEntry {
  timestamp: string;
  level: 'Error' | 'Warning' | 'Info' | 'Debug';
  module: string;
  user: string;
  message: string;
}

const SystemLogs = () => {
  // Log entries data with type annotation
  const logEntries: LogEntry[] = [
    {
      timestamp: '2025-03-16 21:34:10',
      level: 'Error',
      module: 'Authentication',
      user: 'jsinx.math',
      message: 'Failed login attempt: invalid credentials'
    },
    {
      timestamp: '2025-03-16 21:33:45',
      level: 'Warning',
      module: 'Task Assignment',
      user: 'jsine.doc',
      message: 'TA workload exceeds recommended limit'
    },
    {
      timestamp: '2025-03-16 21:32:20',
      level: 'Info',
      module: 'User Management',
      user: 'admin',
      message: 'New user account created: altyimax'
    },
    {
      timestamp: '2025-03-16 21:31:15',
      level: 'Info',
      module: 'System',
      user: 'system',
      message: 'Automated backup completed successfully'
    }
  ];

  return (
    <div className="system-logs-container">
      <header>
        <h1>System Logs</h1>
      </header>

      <div className="logs-content">
        {/* Filters Section */}
        <section className="filters-section">
          <h2>Filters</h2>
          
          <div className="filter-group">
            <h3>Date Range</h3>
            <div className="date-range">
              <input type="date" defaultValue="2025-03-09" />
              <span>to</span>
              <input type="date" defaultValue="2025-02-16" />
            </div>
          </div>
          
          <div className="filter-group">
            <h3>Log Level</h3>
            <div className="checkbox-group">
              <label><input type="checkbox" defaultChecked /> Error</label>
              <label><input type="checkbox" defaultChecked /> Warning</label>
              <label><input type="checkbox" defaultChecked /> Info</label>
              <label><input type="checkbox" /> Debug</label>
            </div>
          </div>
          
          <div className="filter-group">
            <h3>Module</h3>
            <div className="checkbox-group">
              <label><input type="checkbox" defaultChecked /> Authentication</label>
              <label><input type="checkbox" defaultChecked /> User Management</label>
              <label><input type="checkbox" defaultChecked /> Task Assignment</label>
              <label><input type="checkbox" defaultChecked /> Exam Management</label>
            </div>
          </div>
          
          <div className="filter-group">
            <h3>User Type</h3>
            <div className="checkbox-group">
              <label><input type="checkbox" defaultChecked /> Administrator</label>
              <label><input type="checkbox" defaultChecked /> Instructor</label>
              <label><input type="checkbox" defaultChecked /> TA</label>
              <label><input type="checkbox" defaultChecked /> System</label>
            </div>
          </div>
        </section>

        {/* Log Entries Section */}
        <section className="log-entries-section">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Module</th>
                  <th>User</th>
                  <th>Message</th>
                  <th>Switch logs...</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logEntries.map((log, index) => (
                  <tr key={index}>
                    <td>{log.timestamp}</td>
                    <td>
                      <span className={`log-level ${log.level.toLowerCase()}`}>
                        {log.level}
                      </span>
                    </td>
                    <td>{log.module}</td>
                    <td>{log.user}</td>
                    <td>{log.message}</td>
                    <td><input type="checkbox" /></td>
                    <td>
                      <button className="view-btn">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Log Statistics Section */}
        <section className="log-statistics-section">
          <h2>Log Statistics</h2>
          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Log Level Distribution</th>
                  <th>Error</th>
                  <th>Warning</th>
                  <th>Info</th>
                  <th>Module Activity</th>
                  <th>Auth</th>
                  <th>User Mgmt</th>
                  <th>Tasks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>0.000</td>
                  <td>0.000</td>
                  <td>0.000</td>
                  <td>0.000</td>
                  <td>0.000</td>
                  <td>0.000</td>
                  <td>0.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SystemLogs;