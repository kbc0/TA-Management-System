import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
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
} from '@mui/material';
import GridItem from '../../components/common/GridItem';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Dashboard data interface
interface DashboardData {
  user: any;
  upcomingTasks: any[];
  courses: any[];
  pendingLeaves: any[];
  pendingSwaps: any[];
}

const TADashboardPage: React.FC = () => {
  const { authState } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/dashboard`, {
          withCredentials: true,
        });
        setDashboardData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  // Mock data for development (remove when API is ready)
  const mockData: DashboardData = {
    user: authState.user,
    upcomingTasks: [
      {
        id: 1,
        title: 'Grade Midterm Exams',
        due_date: '2025-05-15',
        course_id: 'CS101',
        task_type: 'grading',
      },
      {
        id: 2,
        title: 'Office Hours',
        due_date: '2025-05-12',
        course_id: 'CS223',
        task_type: 'office_hours',
      },
      {
        id: 3,
        title: 'Proctor Final Exam',
        due_date: '2025-05-20',
        course_id: 'CS101',
        task_type: 'proctoring',
      },
    ],
    courses: [
      {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
        semester: 'Spring 2025',
        hours_per_week: 10,
      },
      {
        id: 2,
        course_code: 'CS223',
        course_name: 'Digital Design',
        semester: 'Spring 2025',
        hours_per_week: 5,
      },
    ],
    pendingLeaves: [
      {
        id: 1,
        leave_type: 'conference',
        start_date: '2025-05-25',
        end_date: '2025-05-30',
        status: 'pending',
      },
    ],
    pendingSwaps: [
      {
        id: 1,
        assignment_type: 'task',
        original_assignment_id: 3,
        target_name: 'Emily Johnson',
        status: 'pending',
      },
    ],
  };

  // Use mock data for now
  const data = dashboardData || mockData;

  return (
    <Box sx={{ p: 2 }}>
      {/* Welcome message */}
      <Typography variant="h4" gutterBottom>
        Welcome, {data.user?.full_name || 'TA'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's an overview of your teaching assistant activities
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Assigned Courses */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="My Courses" />
            <Divider />
            <CardContent>
              {data.courses.length > 0 ? (
                <List>
                  {data.courses.map((course) => (
                    <ListItem key={course.id}>
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${course.course_code}: ${course.course_name}`}
                        secondary={`${course.semester} • ${course.hours_per_week} hours/week`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You are not assigned to any courses yet.
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/ta/courses"
              >
                View All Courses
              </Button>
            </CardContent>
          </Card>
        </GridItem>

        {/* Upcoming Tasks */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Upcoming Tasks" />
            <Divider />
            <CardContent>
              {data.upcomingTasks.length > 0 ? (
                <List>
                  {data.upcomingTasks.map((task) => (
                    <ListItem key={task.id}>
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={`${task.course_id} • Due: ${new Date(task.due_date).toLocaleDateString()}`}
                      />
                      <Chip
                        label={task.task_type}
                        size="small"
                        color={
                          task.task_type === 'grading'
                            ? 'primary'
                            : task.task_type === 'proctoring'
                            ? 'secondary'
                            : 'default'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You have no upcoming tasks.
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/ta/tasks"
              >
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </GridItem>

        {/* Leave Requests */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Leave Requests" />
            <Divider />
            <CardContent>
              {data.pendingLeaves.length > 0 ? (
                <List>
                  {data.pendingLeaves.map((leave) => (
                    <ListItem key={leave.id}>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave`}
                        secondary={`${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`}
                      />
                      <Chip
                        label={leave.status}
                        size="small"
                        color={
                          leave.status === 'approved'
                            ? 'success'
                            : leave.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You have no pending leave requests.
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/ta/leaves"
              >
                View All Leaves
              </Button>
            </CardContent>
          </Card>
        </GridItem>

        {/* Swap Requests */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Swap Requests" />
            <Divider />
            <CardContent>
              {data.pendingSwaps.length > 0 ? (
                <List>
                  {data.pendingSwaps.map((swap) => (
                    <ListItem key={swap.id}>
                      <ListItemIcon>
                        <SwapHorizIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Swap with ${swap.target_name}`}
                        secondary={`${swap.assignment_type.charAt(0).toUpperCase() + swap.assignment_type.slice(1)} Assignment`}
                      />
                      <Chip
                        label={swap.status}
                        size="small"
                        color={
                          swap.status === 'approved'
                            ? 'success'
                            : swap.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You have no pending swap requests.
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/ta/swaps"
              >
                View All Swaps
              </Button>
            </CardContent>
          </Card>
        </GridItem>

        {/* Quick Actions */}
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Quick Actions" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <GridItem xs={6} sm={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<EventIcon />}
                    href="/ta/leaves/new"
                  >
                    Request Leave
                  </Button>
                </GridItem>
                <GridItem xs={6} sm={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SwapHorizIcon />}
                    href="/ta/swaps/new"
                  >
                    Initiate Swap
                  </Button>
                </GridItem>
                <GridItem xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AssignmentIcon />}
                    href="/ta/tasks"
                  >
                    View Tasks
                  </Button>
                </GridItem>
                <GridItem xs={6} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SchoolIcon />}
                    href="/ta/courses"
                  >
                    View Courses
                  </Button>
                </GridItem>
              </Grid>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default TADashboardPage;
