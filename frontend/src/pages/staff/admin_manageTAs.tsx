// ManageTAsPage.tsx
import React from 'react';
import './admin_manageTAs.css';

type TAStatus = 'Active' | 'On Leave' | 'Inactive';

interface TeachingAssistant {
  name: string;
  course: string;
  status: TAStatus;
  hours: number;
}

interface StatusBadgeProps {
  status: TAStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const classMap = {
    'Active': 'status-badge status-active',
    'On Leave': 'status-badge status-onleave',
    'Inactive': 'status-badge status-inactive',
  };
  return <span className={classMap[status]}>{status}</span>;
};

const ManageTAsPage: React.FC = () => {
  const teachingAssistants: TeachingAssistant[] = [
    {
      name: 'Ayşe Vildan Çetin',
      course: 'CS315',
      status: 'Active',
      hours: 13,
    },
    {
      name: 'Mehmet Yılmaz',
      course: 'CS319',
      status: 'On Leave',
      hours: 8,
    },
  ];

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Teaching Assistants Overview</h1>
        <div className="actions">
          <button className="btn btn-primary">+ Add New TA</button>
          <button className="btn btn-outline">📤 Export List</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Active Teaching Assistants</div>
        <table className="ta-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Status</th>
              <th>Current Workload</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachingAssistants.map((ta, index) => (
              <tr key={index}>
                <td>{ta.name}</td>
                <td>{ta.course}</td>
                <td><StatusBadge status={ta.status} /></td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(ta.hours / 20) * 100}%` }}
                    ></div>
                  </div>
                  {ta.hours}/20 hours
                </td>
                <td className="action-buttons">
                  <button className="btn-icon">👁️</button>
                  <button className="btn-icon">✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-container">
        <div className="card stats-card">
          <div className="card-title">TA Statistics</div>

          <div className="stats-section">
            <div className="section-title">Workload Distribution</div>
            <div className="stats-distribution">
              <span className="stat underload">Under Load (40%)</span>
              <span className="stat optimal">Optimal (35%)</span>
              <span className="stat overload">Over Load (25%)</span>
            </div>
          </div>

          <div className="stats-section">
            <div className="section-title">TA Status Overview</div>
            <ul className="status-list">
              <li>
                Active TAs <span className="status-count active">15</span>
              </li>
              <li>
                On Leave <span className="status-count onleave">3</span>
              </li>
              <li>
                Inactive <span className="status-count inactive">2</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTAsPage;