import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

// Task types
const TASK_TYPES = [
  { value: 'grading', label: 'Grading' },
  { value: 'proctoring', label: 'Proctoring' },
  { value: 'office_hours', label: 'Office Hours' },
  { value: 'recitation', label: 'Recitation' },
  { value: 'other', label: 'Other' },
];

// Task status colors
const STATUS_COLORS = {
  active: 'primary',
  completed: 'success',
  overdue: 'error',
};

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

interface TA {
  id: string;
  full_name: string;
  bilkent_id: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  course_id: string;
  course_code?: string;
  course_name?: string;
  due_date: string;
  duration: number;
  status: 'active' | 'completed' | 'overdue';
  assigned_to: number | string | null;
  assigned_to_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TaskFormData {
  title: string;
  description: string;
  task_type: string;
  course_id: string;
  due_date: Date | null;
  duration: number;
  assigned_to: string[];
}

const StaffTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableTAs, setAvailableTAs] = useState<TA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    task_type: '',
    course_id: '',
    due_date: null,
    duration: 60, // Default 60 minutes
    assigned_to: [],
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch tasks and courses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses first
        const coursesResponse = await api.get('/courses');
        
        // Check if response.data has a courses property
        const coursesFromResponse = coursesResponse.data.courses || coursesResponse.data;
        
        // Ensure courses is always an array
        const coursesData = Array.isArray(coursesFromResponse) ? coursesFromResponse : [];
        setCourses(coursesData);
        
        // If we have courses, set the first one as selected by default
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0].id);
          
          // Fetch TAs for the first course
          const tasResponse = await api.get(`/courses/${coursesData[0].id}/tas`);
          // Ensure TAs is always an array
          const tasFromResponse = tasResponse.data.tas || tasResponse.data;
          const tasData = Array.isArray(tasFromResponse) ? tasFromResponse : [];
          setAvailableTAs(tasData);
          
          // Fetch tasks for the first course
          const tasksResponse = await api.get(`/tasks/course/${coursesData[0].id}`);
          // Ensure tasks is always an array
          const tasksFromResponse = tasksResponse.data.tasks || tasksResponse.data;
          const tasksData = Array.isArray(tasksFromResponse) ? tasksFromResponse : [];
          setTasks(tasksData);
        } else {
          setTasks([]);
          setAvailableTAs([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        // Set empty arrays on error
        setCourses([]);
        setTasks([]);
        setAvailableTAs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle course change
  const handleCourseChange = async (courseId: string) => {
    try {
      setSelectedCourseId(courseId);
      setLoading(true);
      
      // Fetch TAs for the selected course
      const tasResponse = await api.get(`/courses/${courseId}/tas`);
      // Check if response.data has a tas property
      const tasFromResponse = tasResponse.data.tas || tasResponse.data;
      
      // Fetch tasks for the selected course
      const tasksResponse = await api.get(`/tasks/course/${courseId}`);
      // Process tasks to handle the new API response format
      const processedTasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
      setTasks(processedTasks);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data. Please try again later.');
      // Set empty arrays on error
      setTasks([]);
      setAvailableTAs([]);
    } finally {
      setLoading(false);
    }
  };

  // Open task dialog for creating a new task
  const handleAddTask = () => {
    setFormData({
      title: '',
      description: '',
      task_type: '',
      course_id: selectedCourseId,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      duration: 60,
      assigned_to: [],
    });
    setFormErrors({});
    setEditingTask(null);
    setOpenTaskDialog(true);
  };

  // Open task dialog for editing an existing task
  const handleEditTask = (task: Task) => {
    // Convert the assigned_to value to an array format for the form
    const assignedToArray = task.assigned_to ? [task.assigned_to.toString()] : [];
    
    setFormData({
      title: task.title,
      description: task.description || '',
      task_type: task.task_type,
      course_id: task.course_id,
      due_date: new Date(task.due_date),
      duration: task.duration,
      assigned_to: assignedToArray,
    });
    setFormErrors({});
    setEditingTask(task);
    setOpenTaskDialog(true);
  };

  // Handle form input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    }
  };

  // Handle select changes
  const handleSelectChange = (event: any) => {
    const name = event.target.name as string;
    const value = event.target.value;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    }
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      due_date: date,
    }));
    
    // Clear error for due_date if it exists
    if (formErrors.due_date) {
      setFormErrors(prev => ({
        ...prev,
        due_date: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.task_type) {
      errors.task_type = 'Task type is required';
    }
    
    if (!formData.course_id) {
      errors.course_id = 'Course is required';
    }
    
    if (!formData.due_date) {
      errors.due_date = 'Due date is required';
    } else if (formData.due_date < new Date()) {
      errors.due_date = 'Due date cannot be in the past';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      errors.duration = 'Valid duration is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmitTask = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format date to YYYY-MM-DD HH:MM:SS format that MySQL expects
      const formatDate = (date: Date | null) => {
        if (!date) return null;
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };
      
      const taskData = {
        ...formData,
        due_date: formatDate(formData.due_date),
      };
      
      if (editingTask) {
        // Update existing task
        await api.put(`/tasks/${editingTask.id}`, taskData);
      } else {
        // Create new task
        await api.post('/tasks', taskData);
      }
      
      // Refresh tasks list
      const tasksResponse = await api.get(`/tasks/course/${selectedCourseId}`);
      // Process tasks to handle the new API response format
      const processedTasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
      setTasks(processedTasks);
      
      // Close dialog
      setOpenTaskDialog(false);
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again later.');
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      // Show loading state
      setLoading(true);
      
      await api.delete(`/tasks/${taskToDelete}`);
      
      // Remove the deleted task from the local state immediately
      // This provides immediate UI feedback without waiting for the API refresh
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
      
      // Also refresh from the server to ensure data consistency
      const tasksResponse = await api.get(`/tasks/course/${selectedCourseId}`);
      // Process tasks to handle the new API response format
      const processedTasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
      setTasks(processedTasks);
      
      // Show success message
      setSuccessMessage('Task deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
      
      // Close dialog
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching data
  if (loading && courses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if fetch failed
  if (error && courses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tasks Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
        >
          Create Task
        </Button>
      </Box>
      
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Course selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Course
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="course-select-label">Course</InputLabel>
            <Select
              labelId="course-select-label"
              id="course-select"
              value={selectedCourseId}
              label="Course"
              onChange={(e) => handleCourseChange(e.target.value as string)}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.course_code}: {course.course_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Tasks list */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tasks
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : tasks.length > 0 ? (
            <List>
              {tasks.map((task) => (
                <ListItem
                  key={task.id}
                  sx={{
                    mb: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <ListItemIcon>
                    <AssignmentIcon color={task.status === 'completed' ? 'success' : task.status === 'overdue' ? 'error' : 'primary'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span">
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.task_type.charAt(0).toUpperCase() + task.task_type.slice(1)}
                          size="small"
                          sx={{ ml: 1 }}
                          color="secondary"
                        />
                        <Chip
                          label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          size="small"
                          sx={{ ml: 1 }}
                          color={STATUS_COLORS[task.status] as any}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          Due: {new Date(task.due_date).toLocaleString()} • Duration: {task.duration} min
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {task.assigned_to_name || 'Unassigned'}
                          </Typography>
                        </Box>
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {task.description.length > 100 
                              ? `${task.description.substring(0, 100)}...` 
                              : task.description}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Box>
                    <Tooltip title="Edit Task">
                      <IconButton onClick={() => handleEditTask(task)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Task">
                      <IconButton onClick={() => handleDeleteClick(task.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              No tasks found for this course. Create a new task to get started.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Task Create/Edit Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <GridItem xs={12}>
              <TextField
                name="title"
                label="Task Title"
                fullWidth
                value={formData.title}
                onChange={handleInputChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.task_type} required>
                <InputLabel id="task-type-label">Task Type</InputLabel>
                <Select
                  labelId="task-type-label"
                  id="task-type"
                  name="task_type"
                  value={formData.task_type}
                  label="Task Type"
                  onChange={handleSelectChange}
                >
                  {Array.isArray(TASK_TYPES) && TASK_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.task_type && <FormHelperText>{formErrors.task_type}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.course_id} required>
                <InputLabel id="course-label">Course</InputLabel>
                <Select
                  labelId="course-label"
                  id="course"
                  name="course_id"
                  value={formData.course_id}
                  label="Course"
                  onChange={handleSelectChange}
                >
                  {Array.isArray(courses) && courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.course_code}: {course.course_name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.course_id && <FormHelperText>{formErrors.course_id}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Due Date & Time"
                  value={formData.due_date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.due_date,
                      helperText: formErrors.due_date,
                    },
                  }}
                />
              </LocalizationProvider>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <TextField
                name="duration"
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={formData.duration}
                onChange={handleInputChange}
                error={!!formErrors.duration}
                helperText={formErrors.duration}
                required
                inputProps={{ min: 1 }}
              />
            </GridItem>
            
            <GridItem xs={12}>
              <FormControl fullWidth>
                <InputLabel id="assigned-to-label">Assign to TAs</InputLabel>
                <Select
                  labelId="assigned-to-label"
                  id="assigned-to"
                  name="assigned_to"
                  multiple
                  value={formData.assigned_to}
                  label="Assign to TAs"
                  onChange={handleSelectChange}
                  renderValue={(selected) => {
                    const selectedTAs = availableTAs.filter(ta => 
                      (selected as string[]).includes(ta.id)
                    );
                    return selectedTAs.map(ta => ta.full_name).join(', ');
                  }}
                >
                  {Array.isArray(availableTAs) && availableTAs.map((ta) => (
                    <MenuItem key={ta.id} value={ta.id}>
                      {ta.full_name} ({ta.bilkent_id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
              />
            </GridItem>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitTask} variant="contained">
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffTasksPage;
