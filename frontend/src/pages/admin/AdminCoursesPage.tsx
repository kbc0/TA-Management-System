import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import GridItem from '../../components/common/GridItem';
import api from '../../services/api';

// Using the configured API service

// Course interface
interface Course {
  id: number;
  course_code: string;
  course_name: string;
  description: string;
  semester: string;
  credits: number;
  department: string;
  instructor_id: number;
  instructor_name: string;
  is_active: number; // 1 for active, 0 for inactive
  created_at: string;
  updated_at: string;
}

// TA Assignment interface
interface TAAssignment {
  _id: string;
  taId: string;
  taName: string;
  taEmail: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
}

const AdminCoursesPage: React.FC = () => {
  // State for courses data
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for course form
  const [openCourseForm, setOpenCourseForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    department: '',
    semester: '',
    credits: 3,
    instructor_name: '',
    instructor_id: 0,
    description: '',
    is_active: 1,
  });
  
  // State for delete confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  
  // State for TA assignments
  const [taAssignments, setTaAssignments] = useState<TAAssignment[]>([]);
  const [openTADialog, setOpenTADialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loadingTAs, setLoadingTAs] = useState(false);
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch courses data
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      
      // Handle nested response structure and ensure it's an array
      let coursesData;
      if (response.data && response.data.courses && Array.isArray(response.data.courses)) {
        coursesData = response.data.courses;
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      } else {
        console.warn('Unexpected API response format:', response.data);
        coursesData = [];
      }
      
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch TA assignments for a course
  const fetchTAAssignments = async (courseId: string) => {
    try {
      setLoadingTAs(true);
      const response = await api.get(`/courses/${courseId}/tas`);
      
      // Handle nested response structure and ensure it's an array
      let taData;
      if (response.data && response.data.assignments && Array.isArray(response.data.assignments)) {
        taData = response.data.assignments;
      } else if (Array.isArray(response.data)) {
        taData = response.data;
      } else {
        console.warn('Unexpected TA assignments response format:', response.data);
        taData = [];
      }
      
      setTaAssignments(taData);
    } catch (error) {
      console.error('Error fetching TA assignments:', error);
      setNotification({
        open: true,
        message: 'Failed to load TA assignments. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoadingTAs(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, courses]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open add course form
  const handleAddCourse = () => {
    setFormMode('add');
    setFormData({
      course_code: '',
      course_name: '',
      department: '',
      semester: '',
      credits: 3,
      instructor_name: '',
      instructor_id: 0,
      description: '',
      is_active: 1,
    });
    setOpenCourseForm(true);
  };

  // Open edit course form
  const handleEditCourse = (course: Course) => {
    setFormMode('edit');
    setCurrentCourse(course);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      department: course.department,
      semester: course.semester,
      credits: course.credits,
      instructor_name: course.instructor_name,
      instructor_id: course.instructor_id,
      description: course.description,
      is_active: course.is_active,
    });
    setOpenCourseForm(true);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit course form
  const handleSubmitCourseForm = async () => {
    try {
      if (formMode === 'add') {
        // Add new course
        const response = await api.post('/courses', {
          course_code: formData.course_code,
          course_name: formData.course_name,
          department: formData.department,
          instructor_name: formData.instructor_name,
          instructor_id: formData.instructor_id || null,
          semester: formData.semester,
          credits: formData.credits,
          description: formData.description,
          is_active: formData.is_active,
        });
        
        setNotification({
          open: true,
          message: 'Course added successfully',
          severity: 'success',
        });
      } else if (currentCourse) {
        // Update existing course
        const response = await api.patch(`/courses/${currentCourse.id}`, {
          course_code: formData.course_code,
          course_name: formData.course_name,
          department: formData.department,
          instructor_name: formData.instructor_name,
          instructor_id: formData.instructor_id || null,
          semester: formData.semester,
          credits: formData.credits,
          description: formData.description,
          is_active: formData.is_active,
        });
        
        setNotification({
          open: true,
          message: 'Course updated successfully',
          severity: 'success',
        });
      }
      setOpenCourseForm(false);
      fetchCourses(); // Refresh course list
    } catch (error) {
      console.error('Error saving course:', error);
      setNotification({
        open: true,
        message: `Failed to ${formMode === 'add' ? 'add' : 'update'} course. Please try again.`,
        severity: 'error',
      });
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setOpenDeleteDialog(true);
  };

  // Confirm course deletion
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      const response = await api.delete(`/courses/${courseToDelete.id}`);
      setNotification({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success',
      });
      fetchCourses(); // Refresh course list
    } catch (error) {
      console.error('Error deleting course:', error);
      setNotification({
        open: true,
        message: 'Failed to delete course. Please try again.',
        severity: 'error',
      });
    } finally {
      setOpenDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  // Open TA assignments dialog
  const handleViewTAs = (course: Course) => {
    setSelectedCourse(course);
    setOpenTADialog(true);
    fetchTAAssignments(course.id.toString());
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
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
          onClick={() => fetchCourses()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Course Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCourse}
        >
          Add Course
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search Courses"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchCourses()}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.course_code}</TableCell>
                      <TableCell>{course.course_name}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>{course.instructor_name}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        <Chip 
                          label={course.is_active ? 'Active' : 'Inactive'} 
                          color={course.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditCourse(course)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(course)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewTAs(course)}
                          size="small"
                        >
                          <PeopleIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCourses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {/* Course Form Dialog */}
      <Dialog open={openCourseForm} onClose={() => setOpenCourseForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formMode === 'add' ? 'Add New Course' : 'Edit Course'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <GridItem xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Course Code"
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleFormChange}
                  required
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={9}>
                <TextField
                  fullWidth
                  label="Course Name"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleFormChange}
                  required
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  required
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  label="Instructor Name"
                  name="instructor_name"
                  value={formData.instructor_name}
                  onChange={handleFormChange}
                  required
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleFormChange}
                  placeholder="e.g. 2025-Spring"
                  required
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Instructor ID"
                  name="instructor_id"
                  type="number"
                  value={formData.instructor_id}
                  onChange={handleFormChange}
                  required
                />
              </GridItem>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </GridItem>
              <GridItem xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="is_active"
                    value={formData.is_active.toString()}
                    onChange={handleFormChange}
                    label="Status"
                  >
                    <MenuItem value="1">Active</MenuItem>
                    <MenuItem value="0">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseForm(false)}>Cancel</Button>
          <Button onClick={handleSubmitCourseForm} variant="contained" color="primary">
            {formMode === 'add' ? 'Add Course' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the course "{courseToDelete?.course_code}: {courseToDelete?.course_name}"?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            This action cannot be undone. All associated data, including TA assignments, will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* TA Assignments Dialog */}
      <Dialog open={openTADialog} onClose={() => setOpenTADialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Teaching Assistants for {selectedCourse?.course_code}: {selectedCourse?.course_name}
        </DialogTitle>
        <DialogContent>
          {loadingTAs ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {taAssignments.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Hours/Week</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {taAssignments.map((assignment) => (
                        <TableRow key={assignment._id}>
                          <TableCell>{assignment.taName}</TableCell>
                          <TableCell>{assignment.taEmail}</TableCell>
                          <TableCell>{assignment.hoursPerWeek}</TableCell>
                          <TableCell>
                            {new Date(assignment.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(assignment.endDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ py: 2 }}>
                  No teaching assistants assigned to this course.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTADialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCoursesPage;
