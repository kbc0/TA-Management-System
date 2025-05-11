import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  course_id: number;
  course_code: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high';
  assigned_date: string;
}

const TATasksPage: React.FC = () => {
  const { authState } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseIdParam = queryParams.get('courseId');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>(courseIdParam || 'all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');

  // Fetch tasks data
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // The Task.findAll method in the backend will filter by user ID and role
        const response = await api.get('/tasks');
        setTasks(response.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching tasks data:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on selected filters
  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Apply course filter
    if (courseFilter !== 'all') {
      result = result.filter(task => task.course_id.toString() === courseFilter);
    }
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, courseFilter]);

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  // Handle course filter change
  const handleCourseFilterChange = (event: SelectChangeEvent) => {
    setCourseFilter(event.target.value);
  };

  // Open task details dialog
  const handleOpenTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setOpenTaskDialog(true);
  };

  // Close task details dialog
  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
  };

  // Open status update dialog
  const handleOpenStatusUpdate = () => {
    if (selectedTask) {
      setNewStatus(selectedTask.status);
      setStatusUpdateDialog(true);
    }
  };

  // Close status update dialog
  const handleCloseStatusUpdate = () => {
    setStatusUpdateDialog(false);
    setStatusNote('');
  };

  // Update task status
  const handleUpdateStatus = async () => {
    if (!selectedTask) return;
    
    try {
      await api.put(`/tasks/${selectedTask.id}/status`, {
        status: newStatus,
        note: statusNote
      });
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id ? { ...task, status: newStatus as any } : task
      );
      
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, status: newStatus as any });
      handleCloseStatusUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
      // Show error message
    }
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if fetch failed
  if (error) {
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

  // Get unique course IDs for filtering
  const uniqueCourses = Array.from(
    tasks.reduce((map, task) => {
      if (!map.has(task.course_id)) {
        map.set(task.course_id, { id: task.course_id, code: task.course_code });
      }
      return map;
    }, new Map())
  ).map(([_, course]) => course);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Tasks
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <GridItem xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </GridItem>
          <GridItem xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="course-filter-label">Course</InputLabel>
              <Select
                labelId="course-filter-label"
                id="course-filter"
                value={courseFilter}
                label="Course"
                onChange={handleCourseFilterChange}
              >
                <MenuItem value="all">All Courses</MenuItem>
                {uniqueCourses.map(course => (
                  <MenuItem key={course.id} value={course.id.toString()}>
                    {course.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          <GridItem xs={12} sm={4}>
            <Button 
              variant="outlined" 
              onClick={() => window.history.back()}
              fullWidth
            >
              Back to Dashboard
            </Button>
          </GridItem>
        </Grid>
      </Paper>
      
      {/* Tasks List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.course_code}</TableCell>
                  <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={task.task_type} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.priority} 
                      size="small"
                      color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.status} 
                      size="small"
                      color={getStatusColor(task.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenTaskDetails(task)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tasks found matching the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Task Details Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={handleCloseTaskDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedTask.title}</Typography>
                <Chip 
                  label={selectedTask.status} 
                  size="small"
                  color={getStatusColor(selectedTask.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <GridItem xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Course
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTask.course_code}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Task Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTask.task_type}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Priority
                  </Typography>
                  <Chip 
                    label={selectedTask.priority} 
                    size="small"
                    color={selectedTask.priority === 'high' ? 'error' : selectedTask.priority === 'medium' ? 'warning' : 'default'}
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Assigned Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedTask.assigned_date).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Due Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedTask.due_date).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedTask.status} 
                    size="small"
                    color={getStatusColor(selectedTask.status) as any}
                  />
                </GridItem>
                
                <GridItem xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">
                      {selectedTask.description || 'No description provided.'}
                    </Typography>
                  </Paper>
                </GridItem>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleOpenStatusUpdate} color="primary">
                Update Status
              </Button>
              <Button onClick={handleCloseTaskDialog}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialog}
        onClose={handleCloseStatusUpdate}
      >
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Change the status of this task and add an optional note.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="new-status-label">Status</InputLabel>
            <Select
              labelId="new-status-label"
              id="new-status"
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="status-note"
            label="Note (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusUpdate}>Cancel</Button>
          <Button onClick={handleUpdateStatus} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TATasksPage;
