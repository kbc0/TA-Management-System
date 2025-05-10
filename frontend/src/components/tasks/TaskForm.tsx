// src/components/tasks/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TaskCreateData, getTaskById, createTask, updateTask } from '../../api/tasks';
import './TaskForm.css';

interface TaskFormProps {
  mode: 'create' | 'edit';
}

const TaskForm: React.FC<TaskFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('grading');
  const [courseId, setCourseId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [assignees, setAssignees] = useState<number[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Could not load user data for permission check.');
      }
    }

    const fetchTaskDetails = async () => {
      if (mode === 'edit' && id) {
        try {
          setLoading(true);
          const taskData = await getTaskById(parseInt(id));
          setTitle(taskData.title);
          setDescription(taskData.description || '');
          setTaskType(taskData.task_type);
          setCourseId(taskData.course_id);
          const dueDateObj = new Date(taskData.due_date);
          const formattedDate = dueDateObj.toISOString().split('T')[0];
          setDueDate(formattedDate);
          setDuration(taskData.duration.toString());
          setAssignees([]); // Placeholder for actual assignees
          setError(null);
        } catch (err: any) {
          console.error('Error fetching task details:', err);
          setError(err.message || 'Failed to load task details');
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchAvailableTAs = async () => {
      setAvailableAssignees([
        { id: 1, fullName: 'John Doe' },
        { id: 2, fullName: 'Jane Smith' },
        { id: 3, fullName: 'Robert Johnson' },
      ]);
    };

    if (mode === 'edit') fetchTaskDetails(); // Only fetch task details if editing
    else setLoading(false); // If creating, no initial loading needed for task data
    
    fetchAvailableTAs();
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId || !dueDate || !duration) {
      setError('Please fill all required fields');
      return;
    }
    const taskData: TaskCreateData = {
      title,
      description,
      task_type: taskType as any, 
      course_id: courseId,
      due_date: dueDate,
      duration: parseInt(duration),
      assignees
    };
    try {
      if (mode === 'create') {
        await createTask(taskData);
      } else if (mode === 'edit' && id) {
        await updateTask(parseInt(id), taskData);
      }
      navigate('/tasks'); 
    } catch (err: any) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} task:`, err);
      setError(err.message || `Failed to ${mode === 'create' ? 'create' : 'update'} task`);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedAssignees: number[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedAssignees.push(parseInt(options[i].value));
      }
    }
    setAssignees(selectedAssignees);
  };

  if (loading) {
    return <div className="loading">Loading task form...</div>;
  }

  if (!user) {
    return <div className="loading">Loading user data for permissions...</div>;
  }

  const allowedToUseFormRoles = ['ta', 'staff', 'department_chair', 'admin'];
  if (!allowedToUseFormRoles.includes(user.role)) {
    return (
      <div className="error-message permission-error">
        You (role: {user.role}) do not have permission to {mode === 'create' ? 'create' : 'edit'} tasks using this form.
      </div>
    );
  }

  return (
    <div className="task-form-container">
      <h2>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="taskType">Task Type *</label>
          <select
            id="taskType"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            required
          >
            <option value="grading">Grading</option>
            <option value="office_hours">Office Hours</option>
            <option value="proctoring">Proctoring</option>
            <option value="lab_session">Lab Session</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="courseId">Course ID *</label>
          <input
            type="text"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="e.g., CS101"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">Due Date *</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">Duration (minutes) *</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="assignees">Assignees (Hold Ctrl/Cmd to select multiple)</label>
          <select
            id="assignees"
            multiple
            value={assignees.map(String)}
            onChange={handleAssigneeChange}
            className="assignees-select"
          >
            {availableAssignees.map(ta => (
              <option key={ta.id} value={ta.id}>
                {ta.fullName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
          >
            {mode === 'create' ? 'Create Task' : 'Update Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;