import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  semester: string;
  hours_per_week: number;
  instructor_name?: string;
  ta_count?: number;
  description?: string;
}

const TACoursesPage: React.FC = () => {
  const { authState } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Get the current user's ID from auth context
        const userId = authState.user?.id;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        const response = await api.get(`/courses/ta/${userId}`);
        // The backend returns { courses: [...] } so we need to extract the courses array
        const coursesData = response.data.courses || [];
        setCourses(coursesData);
        
        // Select the first course by default if available
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching courses data:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [authState.user?.id]);

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

  // If no courses are found
  if (courses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Courses
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You are not assigned to any courses yet.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => window.history.back()}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Courses
      </Typography>
      
      <Grid container spacing={3}>
        {/* Course List */}
        <GridItem xs={12} md={4}>
          <Card>
            <CardHeader title="Assigned Courses" />
            <Divider />
            <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
              {courses.map((course) => (
                <ListItemButton
                  key={course.id} 
                  onClick={() => setSelectedCourse(course)}
                  selected={selectedCourse?.id === course.id}
                >
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${course.course_code}: ${course.course_name}`}
                    secondary={`${course.semester} • ${course.hours_per_week} hours/week`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Card>
        </GridItem>
        
        {/* Course Details */}
        <GridItem xs={12} md={8}>
          {selectedCourse && (
            <Card>
              <CardHeader 
                title={`${selectedCourse.course_code}: ${selectedCourse.course_name}`}
                subheader={selectedCourse.semester}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <GridItem xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Course Details
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" scope="row" width="30%">
                              Course Code
                            </TableCell>
                            <TableCell>{selectedCourse.course_code}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Course Name
                            </TableCell>
                            <TableCell>{selectedCourse.course_name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Semester
                            </TableCell>
                            <TableCell>{selectedCourse.semester}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Hours Per Week
                            </TableCell>
                            <TableCell>{selectedCourse.hours_per_week}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              Instructor
                            </TableCell>
                            <TableCell>{selectedCourse.instructor_name || 'Not assigned'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </GridItem>
                  
                  <GridItem xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Course Description
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {selectedCourse.description || 'No description available for this course.'}
                      </Typography>
                    </Paper>
                  </GridItem>
                  
                  <GridItem xs={12} sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Button
                        variant="outlined"
                        startIcon={<AssignmentIcon />}
                        href={`/ta/tasks?courseId=${selectedCourse.id}`}
                      >
                        View Course Tasks
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => window.history.back()}
                      >
                        Back to Dashboard
                      </Button>
                    </Box>
                  </GridItem>
                </Grid>
              </CardContent>
            </Card>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default TACoursesPage;
