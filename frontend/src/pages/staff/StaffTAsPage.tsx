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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

interface TA {
  id: string;
  full_name: string;
  bilkent_id: string;
  email: string;
  department: string;
  hours_per_week: number;
  task_completion_rate: number;
  courses: string[];
  profile_image?: string;
}

interface AssignmentFormData {
  ta_id: string;
  course_id: string;
  hours_per_week: number;
}

const StaffTAsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tas, setTAs] = useState<TA[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableTAs, setAvailableTAs] = useState<TA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [openAssignDialog, setOpenAssignDialog] = useState<boolean>(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [taToRemove, setTaToRemove] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<AssignmentFormData>({
    ta_id: '',
    course_id: '',
    hours_per_week: 10, // Default 10 hours per week
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch TAs and courses data
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
          
          // Check if response.data has a tas property
          const tasFromResponse = tasResponse.data.tas || tasResponse.data;
          
          // Ensure TAs is always an array
          const tasData = Array.isArray(tasFromResponse) ? tasFromResponse : [];
          setTAs(tasData);
          
          // Fetch available TAs (not assigned to this course)
          const availableTAsResponse = await api.get('/users?role=ta&status=active');
          
          // Check if response.data has a users property
          const availableTAsFromResponse = availableTAsResponse.data.users || availableTAsResponse.data;
          
          // Ensure available TAs is always an array and filter out already assigned TAs
          const availableTAsData = Array.isArray(availableTAsFromResponse) ? availableTAsFromResponse : [];
          setAvailableTAs(availableTAsData.filter((ta: TA) => 
            !tasData.some((assignedTA: TA) => assignedTA.id === ta.id)
          ));
        } else {
          setTAs([]);
          setAvailableTAs([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        // Set empty arrays on error
        setCourses([]);
        setTAs([]);
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
      
      // Ensure TAs is always an array
      const tasData = Array.isArray(tasFromResponse) ? tasFromResponse : [];
      setTAs(tasData);
      
      // Fetch available TAs (not assigned to this course)
      const availableTAsResponse = await api.get('/users?role=ta&status=active');
      
      // Check if response.data has a users property
      const availableTAsFromResponse = availableTAsResponse.data.users || availableTAsResponse.data;
      
      // Ensure available TAs is always an array and filter out already assigned TAs
      const availableTAsData = Array.isArray(availableTAsFromResponse) ? availableTAsFromResponse : [];
      setAvailableTAs(availableTAsData.filter((ta: TA) => 
        !tasData.some((assignedTA: TA) => assignedTA.id === ta.id)
      ));
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data. Please try again later.');
      // Set empty arrays on error
      setTAs([]);
      setAvailableTAs([]);
    } finally {
      setLoading(false);
    }
  };

  // Open assign dialog
  const handleOpenAssignDialog = () => {
    setFormData({
      ta_id: '',
      course_id: selectedCourseId,
      hours_per_week: 10,
    });
    setFormErrors({});
    setOpenAssignDialog(true);
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

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.ta_id) {
      errors.ta_id = 'Please select a TA';
    }
    
    if (!formData.course_id) {
      errors.course_id = 'Please select a course';
    }
    
    if (!formData.hours_per_week || formData.hours_per_week <= 0) {
      errors.hours_per_week = 'Valid hours per week is required';
    } else if (formData.hours_per_week > 20) {
      errors.hours_per_week = 'Hours per week cannot exceed 20';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleAssignTA = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Assign TA to course
      await api.post(`/courses/${formData.course_id}/tas`, {
        ta_id: formData.ta_id,
        hours_per_week: formData.hours_per_week,
      });
      
      // Refresh TAs list
      const tasResponse = await api.get(`/courses/${selectedCourseId}/tas`);
      setTAs(tasResponse.data);
      
      // Refresh available TAs
      const availableTAsResponse = await api.get('/users?role=ta&status=active');
      setAvailableTAs(availableTAsResponse.data.filter((ta: TA) => 
        !tasResponse.data.some((assignedTA: TA) => assignedTA.id === ta.id)
      ));
      
      // Close dialog
      setOpenAssignDialog(false);
    } catch (error) {
      console.error('Error assigning TA:', error);
      setError('Failed to assign TA. Please try again later.');
    }
  };

  // Open remove confirmation dialog
  const handleRemoveClick = (taId: string) => {
    setTaToRemove(taId);
    setOpenRemoveDialog(true);
  };

  // Handle TA removal
  const handleRemoveTA = async () => {
    if (!taToRemove || !selectedCourseId) return;
    
    try {
      await api.delete(`/courses/${selectedCourseId}/tas/${taToRemove}`);
      
      // Refresh TAs list
      const tasResponse = await api.get(`/courses/${selectedCourseId}/tas`);
      setTAs(tasResponse.data);
      
      // Refresh available TAs
      const availableTAsResponse = await api.get('/users?role=ta&status=active');
      setAvailableTAs(availableTAsResponse.data.filter((ta: TA) => 
        !tasResponse.data.some((assignedTA: TA) => assignedTA.id === ta.id)
      ));
      
      // Close dialog
      setOpenRemoveDialog(false);
      setTaToRemove(null);
    } catch (error) {
      console.error('Error removing TA:', error);
      setError('Failed to remove TA. Please try again later.');
    }
  };

  // Navigate to TA evaluation page
  const handleEvaluateTA = (taId: string) => {
    navigate(`/staff/tas/${taId}/evaluate`);
  };

  // Navigate to TA tasks page
  const handleViewTasks = (taId: string) => {
    navigate(`/staff/tas/${taId}/tasks`);
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
        <Typography variant="h4">Manage Teaching Assistants</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAssignDialog}
        >
          Assign TA
        </Button>
      </Box>

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

      {/* TAs list */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Teaching Assistants
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : tas.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>TA</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Hours/Week</TableCell>
                    <TableCell>Completion Rate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tas.map((ta) => (
                    <TableRow key={ta.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={ta.profile_image} 
                            sx={{ mr: 2 }}
                          >
                            {ta.full_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{ta.full_name}</Typography>
                            <Typography variant="body2" color="text.secondary">{ta.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{ta.bilkent_id}</TableCell>
                      <TableCell>{ta.department}</TableCell>
                      <TableCell>{ta.hours_per_week}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={ta.task_completion_rate || 0}
                              color={
                                (ta.task_completion_rate || 0) > 80
                                  ? 'success'
                                  : (ta.task_completion_rate || 0) > 60
                                  ? 'primary'
                                  : 'error'
                              }
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {ta.task_completion_rate || 0}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Tasks">
                          <IconButton size="small" onClick={() => handleViewTasks(ta.id)}>
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Evaluate TA">
                          <IconButton size="small" onClick={() => handleEvaluateTA(ta.id)}>
                            <AssessmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send Email">
                          <IconButton size="small" href={`mailto:${ta.email}`}>
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove from Course">
                          <IconButton size="small" color="error" onClick={() => handleRemoveClick(ta.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              No teaching assistants assigned to this course.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Assign TA Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Teaching Assistant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <GridItem xs={12}>
              <FormControl fullWidth error={!!formErrors.ta_id} required>
                <InputLabel id="ta-select-label">Teaching Assistant</InputLabel>
                <Select
                  labelId="ta-select-label"
                  id="ta-select"
                  name="ta_id"
                  value={formData.ta_id}
                  label="Teaching Assistant"
                  onChange={handleSelectChange}
                >
                  {availableTAs.map((ta) => (
                    <MenuItem key={ta.id} value={ta.id}>
                      {ta.full_name} ({ta.bilkent_id})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.ta_id && <FormHelperText>{formErrors.ta_id}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12}>
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
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.course_code}: {course.course_name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.course_id && <FormHelperText>{formErrors.course_id}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                name="hours_per_week"
                label="Hours Per Week"
                type="number"
                fullWidth
                value={formData.hours_per_week}
                onChange={handleInputChange}
                error={!!formErrors.hours_per_week}
                helperText={formErrors.hours_per_week || "Maximum 20 hours per week"}
                required
                inputProps={{ min: 1, max: 20 }}
              />
            </GridItem>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignTA} variant="contained">
            Assign TA
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove TA Confirmation Dialog */}
      <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this teaching assistant from the course? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
          <Button onClick={handleRemoveTA} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffTAsPage;
