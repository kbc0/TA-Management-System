import React, { useState } from 'react';
import './staff_assignTasks.css';

interface Task {
  id: number;
  title: string;
  schedule: string;
  location: string;
  skills: string[];
  assignedTo: string[];
  dueDate: string;
  estimatedHours: string;
}

interface TeachingAssistant {
  name: string;
  skills: string[];
  currentLoad: string;
  status: 'available' | 'on-leave';
}

const AssignTasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Current tasks data with type annotation
  const currentTasks: Task[] = [
    {
      id: 1,
      title: 'CS315 Lab Session',
      schedule: 'Monday, 13:40-15:30',
      location: 'Lab Room: PC Lab-1',
      skills: ['C++', 'Programming Languages'],
      assignedTo: [],
      dueDate: '',
      estimatedHours: ''
    },
    {
      id: 2,
      title: 'CS319 Project Grading',
      schedule: '',
      location: '',
      skills: [],
      assignedTo: ['Ayse Vildan Çetin', 'Mehmet Yılmaz'],
      dueDate: 'Due April 10, 2025',
      estimatedHours: 'Estimated Hours: 10'
    },
    {
      id: 3,
      title: 'CS315 Office Hours',
      schedule: 'Wednesday, 15:40-17:30',
      location: 'Room: EA-502',
      skills: ['Programming Languages', 'Student Support'],
      assignedTo: [],
      dueDate: '',
      estimatedHours: ''
    }
  ];

  // Available TAs data with type annotation
  const availableTAs: TeachingAssistant[] = [
    {
      name: 'Ayse Vildan Çetin',
      skills: ['C++', 'Java', 'Programming Languages'],
      currentLoad: '13/20 hours',
      status: 'available'
    },
    {
      name: 'Mehmet Yılmaz',
      skills: ['Python', 'Web Development'],
      currentLoad: '8/20 hours',
      status: 'available'
    },
    {
      name: 'On Leave',
      skills: [],
      currentLoad: '',
      status: 'on-leave'
    }
  ];

  // Filter TAs based on search term
  const filteredTAs = availableTAs.filter(ta =>
    ta.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="assign-tasks-container">
      <header>
        <h1>Task Assignment</h1>
      </header>

      <section className="current-tasks">
        <h2>Current Tasks</h2>
        
        {currentTasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.title}</h3>
              {task.assignedTo.length > 0 && (
                <div className="assigned-tas">
                  <span>Assigned to: </span>
                  {task.assignedTo.join(', ')}
                </div>
              )}
            </div>
            
            {task.schedule && (
              <div className="task-detail">
                <span className="detail-label">Schedule:</span>
                <span>{task.schedule}</span>
              </div>
            )}
            
            {task.location && (
              <div className="task-detail">
                <span className="detail-label">Location:</span>
                <span>{task.location}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="task-detail">
                <span>{task.dueDate}</span>
              </div>
            )}
            
            {task.estimatedHours && (
              <div className="task-detail">
                <span>{task.estimatedHours}</span>
              </div>
            )}
            
            {task.skills.length > 0 && (
              <div className="task-detail">
                <span className="detail-label">Required Skills:</span>
                <span>{task.skills.join(', ')}</span>
              </div>
            )}
            
            <div className="task-actions">
              {task.assignedTo.length > 0 ? (
                <>
                  <button className="modify-btn">Modify Assignment</button>
                  <button className="view-btn">View Details</button>
                </>
              ) : (
                <>
                  <button className="assign-btn">Assign TA</button>
                  <button className="edit-btn">Edit Task</button>
                </>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="available-tas">
        <h2>Available TAs</h2>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Search TAs..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {filteredTAs.map((ta, index) => (
          <div key={index} className={`ta-card ${ta.status}`}>
            <div className="ta-header">
              <h3>{ta.name}</h3>
              {ta.currentLoad && (
                <span className="workload">{ta.currentLoad}</span>
              )}
            </div>
            
            {ta.skills.length > 0 && (
              <div className="ta-detail">
                <span className="detail-label">Skills:</span>
                <span>{ta.skills.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default AssignTasks;