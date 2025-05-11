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
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  semester: string;
  department: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  ta_count: number;
  created_at: string;
  updated_at: string;
}

interface TA {
  id: string;
  full_name: string;
  bilkent_id: string;
  email: string;
  department: string;
  hours_per_week: number;
}

const StaffCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseTAs, setCourseTAs] = useState<TA[]>([]);
  const [loadingTAs, setLoadingTAs] = useState<boolean>(false);
  
  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/courses');
        
        // Check if response.data has a courses property
        const coursesData = response.data.courses || response.data;
        
        // Ensure courses is always an array
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch TAs for a selected course
  const fetchCourseTAs = async (courseId: string) => {
    try {
      setLoadingTAs(true);
      const response = await api.get(`/courses/${courseId}/tas`);
      setCourseTAs(response.data);
    } catch (error) {
      console.error('Error fetching course TAs:', error);
      setCourseTAs([]);
    } finally {
      setLoadingTAs(false);
    }
  };

  // Handle course selection
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    fetchCourseTAs(course.id);
  };

  // Navigate to task management for a course
  const handleManageTasks = (courseId: string) => {
    navigate(`/staff/courses/${courseId}/tasks`);
  };

  // Navigate to TA assignment for a course
  const handleAssignTA = (courseId: string) => {
    navigate(`/staff/courses/${courseId}/assign-ta`);
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

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Courses</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Course List */}
        <GridItem xs={12} md={selectedCourse ? 6 : 12}>
          <Card>
            <CardContent>
              {courses.length > 0 ? (
                <List>
                  {courses.map((course) => (
                    <ListItem 
                      key={course.id}
                      component="div"
                      onClick={() => handleCourseSelect(course)}
                      sx={{ 
                        borderLeft: selectedCourse?.id === course.id ? 4 : 0, 
                        borderColor: 'primary.main',
                        mb: 1,
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        cursor: 'pointer',
                        bgcolor: selectedCourse?.id === course.id ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                      }}
                    >
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {course.course_code}: {course.course_name}
                            </Typography>
                            <Chip 
                              label={course.semester} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Department: {course.department} • TAs: {course.ta_count || 0}
                            </Typography>
                          </>
                        }
                      />
                      <Box>
                        <Tooltip title="Manage Tasks">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageTasks(course.id);
                            }}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign TA">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignTA(course.id);
                            }}
                          >
                            <PersonIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  You don't have any courses assigned.
                </Typography>
              )}
            </CardContent>
          </Card>
        </GridItem>

        {/* Course Details */}
        {selectedCourse && (
          <GridItem xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedCourse.course_code}: {selectedCourse.course_name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {selectedCourse.semester} • {selectedCourse.department}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body1" paragraph>
                  {selectedCourse.description || 'No description available.'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Teaching Assistants
                </Typography>
                
                {loadingTAs ? (
                  <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : courseTAs.length > 0 ? (
                  <List dense>
                    {courseTAs.map((ta) => (
                      <ListItem key={ta.id}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={ta.full_name}
                          secondary={`ID: ${ta.bilkent_id} • ${ta.hours_per_week} hrs/week`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No teaching assistants assigned to this course.
                  </Typography>
                )}
                
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AssignmentIcon />}
                    onClick={() => handleManageTasks(selectedCourse.id)}
                  >
                    Manage Tasks
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => handleAssignTA(selectedCourse.id)}
                  >
                    Assign TA
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
};

export default StaffCoursesPage;
