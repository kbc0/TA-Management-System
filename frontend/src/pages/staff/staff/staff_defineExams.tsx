// DefineExamsPage.tsx
import React from 'react';
import './staff_defineExams.css';

interface Exam {
  course: string;
  date: string;
  time: string;
  rooms: string[];
  proctorsNeeded: number;
  students: number;
  status: 'Pending Proctors' | 'Proctors Assigned';
}

const DefineExamsPage: React.FC = () => {
  const exams: Exam[] = [
    {
      course: 'CS101 Midterm Exam',
      date: 'March 25, 2025',
      time: '10:00 - 12:00',
      rooms: ['EA-409', 'EA-410', 'EA-411'],
      proctorsNeeded: 6,
      students: 180,
      status: 'Pending Proctors',
    },
    {
      course: 'CS315 Final Exam',
      date: 'April 15, 2025',
      time: '09:00 - 11:00',
      rooms: ['BZ-01', 'BZ-02'],
      proctorsNeeded: 4,
      students: 120,
      status: 'Proctors Assigned',
    },
  ];

  return (
    <div className="define-exams-container">
      <div className="page-header">
        <h1>Define Exams</h1>
        <div className="page-actions">
          <button className="btn-primary">+ Define New Exam</button>
          <button className="btn-outline">📅 View Calendar</button>
        </div>
      </div>

      <div className="main-content">
        <div className="exam-list-section">
          <h2>Upcoming Exams</h2>
          <div className="exam-list">
            {exams.map((exam, index) => (
              <div className="exam-card" key={index}>
                <div className="exam-header">
                  <h3>{exam.course}</h3>
                  <span className={`badge ${exam.status === 'Pending Proctors' ? 'pending' : 'assigned'}`}>
                    {exam.status}
                  </span>
                </div>
                <p>Date: {exam.date} | Time: {exam.time}</p>
                <p>Rooms: {exam.rooms.join(', ')}</p>
                <p>Proctors Needed: {exam.proctorsNeeded} | Students: {exam.students}</p>
                <div className="exam-actions">
                  <button className="btn-small">Assign Proctors</button>
                  <button className="btn-small">Edit Exam</button>
                  <button className="btn-small">Generate Lists</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="exam-stats-section">
          <div className="card">
            <h3>Exam Statistics</h3>
            <div className="stats-group">
              <strong>Upcoming Exams Overview</strong>
              <ul>
                <li>Total Exams <span className="badge blue">8</span></li>
                <li>Pending Proctors <span className="badge yellow">3</span></li>
                <li>Fully Assigned <span className="badge green">5</span></li>
              </ul>
            </div>

            <div className="stats-group">
              <strong>Room Allocation</strong>
              <div className="bar">
                <div className="bar-fill green" style={{ width: '60%' }}>Available (60%)</div>
                <div className="bar-fill yellow" style={{ width: '40%' }}>Allocated (40%)</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="btn-block">📄 Export Exam Schedule</button>
              <button className="btn-block">👤 Review Proctor Assignments</button>
              <button className="btn-block">🖨️ Print Room Lists</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefineExamsPage;