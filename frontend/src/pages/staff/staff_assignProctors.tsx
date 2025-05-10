import React, { useState } from 'react';
import './staff_assignProctors.css';

interface Proctor {
  name: string;
  room: string;
}

interface TA {
  name: string;
  workload: string;
  status: 'Available' | 'Limited' | 'Unavailable';
}

interface ExamDetails {
  name: string;
  date: string;
  time: string;
  rooms: string[];
  students: number;
  studentsPerRoom: number;
  proctorsNeeded: number;
  proctorsPerRoom: number;
}

const AssignProctors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Exam details with type annotation
  const examDetails: ExamDetails = {
    name: 'C501 Midterm Exam',
    date: 'March 25, 2023',
    time: '10:00 - 12:00',
    rooms: ['A-40', 'A-410', 'A-411'],
    students: 150,
    studentsPerRoom: 0.0,
    proctorsNeeded: 6,
    proctorsPerRoom: 2
  };

  // Currently assigned proctors with type annotation
  const assignedProctors: Proctor[] = [
    { name: 'Ahmet Alanyalı', room: 'A-40' },
    { name: 'Arda Ketenci', room: 'A-410' }
  ];

  // Available TAs with type annotation
  const availableTAs: TA[] = [
    { name: 'Ayşe Vildan Çetin', workload: '5/20 hrs', status: 'Available' },
    { name: 'Burak Malkoç', workload: '15/20 hrs', status: 'Available' },
    { name: 'Kamil Belviranlı', workload: '10/20 hrs', status: 'Available' },
    { name: 'Ali Yılmaz', workload: '18/20 hrs', status: 'Limited' },
    { name: 'Zeynep Erdem', workload: '12/20 hrs', status: 'Available' }
  ];

  // Filter TAs based on search term
  const filteredTAs = availableTAs.filter(ta =>
    ta.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="assign-proctors-container">
      <header>
        <h1>Upcoming Exams</h1>
        <h2>{examDetails.name} - Proctor Assignment</h2>
      </header>

      <section className="exam-details">
        <h3>Exam Details</h3>
        <table className="details-table">
          <tbody>
            <tr>
              <td>Date & Time</td>
              <td>{examDetails.date} | {examDetails.time}</td>
            </tr>
            <tr>
              <td>Rooms</td>
              <td>{examDetails.rooms.join(', ')}</td>
            </tr>
            <tr>
              <td>Students</td>
              <td>{examDetails.students} ({examDetails.studentsPerRoom} per room)</td>
            </tr>
            <tr>
              <td>Proctors Needed</td>
              <td>{examDetails.proctorsNeeded} ({examDetails.proctorsPerRoom} per room)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="assigned-proctors">
        <h3>Currently Assigned Proctors</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedProctors.map((proctor, index) => (
              <tr key={index}>
                <td>{proctor.name}</td>
                <td>{proctor.room}</td>
                <td>
                  <button className="remove-btn">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="available-tas">
        <h3>Available TAs</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search TA..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Workload</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTAs.map((ta, index) => (
              <tr key={index}>
                <td>{ta.name}</td>
                <td>{ta.workload}</td>
                <td>
                  <span className={`status ${ta.status.toLowerCase()}`}>
                    {ta.status}
                  </span>
                </td>
                <td>
                  <button className="assign-btn">Assign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="action-buttons">
        <button className="save-btn">Save Assignments</button>
        <button className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

export default AssignProctors;