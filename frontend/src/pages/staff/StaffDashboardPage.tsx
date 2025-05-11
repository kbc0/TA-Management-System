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
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  SwapHoriz as SwapHorizIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Dashboard data interface
interface DashboardData {
  user: any;
  courses: any[];
  tas: any[];
  pendingLeaveRequests: any[];
  pendingSwapRequests: any[];
  taskCompletionStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

const StaffDashboardPage: React.FC = () => {
  const { authState } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Use the configured api service that automatically includes auth token
        const response = await api.get('/dashboard');
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
    courses: [
      {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
        semester: 'Spring 2025',
        ta_count: 3,
      },
      {
        id: 2,
        course_code: 'CS223',
        course_name: 'Digital Design',
        semester: 'Spring 2025',
        ta_count: 2,
      },
      {
        id: 3,
        course_code: 'CS315',
        course_name: 'Programming Languages',
        semester: 'Spring 2025',
        ta_count: 1,
      },
    ],
    tas: [
      {
        id: 1,
        fullName: 'John Smith',
        bilkentId: '21801234',
        courses: ['CS101', 'CS223'],
        task_completion_rate: 85,
      },
      {
        id: 2,
        fullName: 'Emily Johnson',
        bilkentId: '21901234',
        courses: ['CS101'],
        task_completion_rate: 92,
      },
      {
        id: 4,
        fullName: 'Michael Brown',
        bilkentId: '22001234',
        courses: ['CS223', 'CS315'],
        task_completion_rate: 78,
      },
    ],
    pendingLeaveRequests: [
      {
        id: 1,
        user_id: 1,
        requester_name: 'John Smith',
        leave_type: 'conference',
        start_date: '2025-05-25',
        end_date: '2025-05-30',
        status: 'pending',
      },
      {
        id: 2,
        user_id: 2,
        requester_name: 'Emily Johnson',
        leave_type: 'medical',
        start_date: '2025-05-15',
        end_date: '2025-05-18',
        status: 'pending',
      },
    ],
    pendingSwapRequests: [
      {
        id: 1,
        requester_id: 1,
        requester_name: 'John Smith',
        target_id: 2,
        target_name: 'Emily Johnson',
        assignment_type: 'task',
        status: 'pending',
      },
    ],
    taskCompletionStats: {
      total: 45,
      completed: 32,
      pending: 10,
      overdue: 3,
    },
  };

  // Use mock data for now
  const data = dashboardData || mockData;

  // Calculate completion percentage
  const completionPercentage = Math.round((data.taskCompletionStats.completed / data.taskCompletionStats.total) * 100);

  return (
    <Box sx={{ p: 2 }}>
      {/* Welcome message */}
      <Typography variant="h4" gutterBottom>
        Welcome, {data.user?.fullName || 'Instructor'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's an overview of your courses and teaching assistants
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Courses Overview */}
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
                        secondary={`${course.semester} • ${course.ta_count} TAs assigned`}
                      />
                      <Button
                        size="small"
                        href={`/staff/courses/${course.id}`}
                      >
                        Details
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You don't have any courses assigned.
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/staff/courses"
              >
                Manage Courses
              </Button>
            </CardContent>
          </Card>
        </GridItem>

        {/* TA Overview */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Teaching Assistants" />
            <Divider />
            <CardContent>
              {data.tas.length > 0 ? (
                <List>
                  {data.tas.map((ta) => (
                    <ListItem key={ta.id}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={ta.fullName}
                        secondary={`ID: ${ta.bilkentId} • Courses: ${ta.courses.join(', ')}`}
                      />
                      <Box sx={{ width: '100px', mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={ta.task_completion_rate}
                          color={
                            ta.task_completion_rate > 80
                              ? 'success'
                              : ta.task_completion_rate > 60
                              ? 'primary'
                              : 'error'
                          }
                        />
                        <Typography variant="caption" align="center" display="block">
                          {ta.task_completion_rate}% completed
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No teaching assistants assigned to your courses.
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/staff/tas"
              >
                Manage TAs
              </Button>
            </CardContent>
          </Card>
        </GridItem>

        {/* Task Completion Stats */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Task Completion Statistics" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Overall completion rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={completionPercentage}
                      color={
                        completionPercentage > 80
                          ? 'success'
                          : completionPercentage > 60
                          ? 'primary'
                          : 'error'
                      }
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {completionPercentage}%
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <GridItem xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" align="center">
                        {data.taskCompletionStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Total Tasks
                      </Typography>
                    </CardContent>
                  </Card>
                </GridItem>
                <GridItem xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" align="center" color="success.main">
                        {data.taskCompletionStats.completed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Completed
                      </Typography>
                    </CardContent>
                  </Card>
                </GridItem>
                <GridItem xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" align="center" color="primary.main">
                        {data.taskCompletionStats.pending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Pending
                      </Typography>
                    </CardContent>
                  </Card>
                </GridItem>
                <GridItem xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" align="center" color="error.main">
                        {data.taskCompletionStats.overdue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Overdue
                      </Typography>
                    </CardContent>
                  </Card>
                </GridItem>
              </Grid>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={<AssessmentIcon />}
                href="/staff/reports"
              >
                View Detailed Reports
              </Button>
            </CardContent>
          </Card>
        </GridItem>

        {/* Pending Approvals */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Pending Approvals" />
            <Divider />
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Leave Requests
              </Typography>
              {data.pendingLeaveRequests.length > 0 ? (
                <List>
                  {data.pendingLeaveRequests.map((leave) => (
                    <ListItem key={leave.id}>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${leave.requester_name} - ${leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)}`}
                        secondary={`${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        href={`/staff/leaves/${leave.id}`}
                      >
                        Review
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending leave requests.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Swap Requests
              </Typography>
              {data.pendingSwapRequests.length > 0 ? (
                <List>
                  {data.pendingSwapRequests.map((swap) => (
                    <ListItem key={swap.id}>
                      <ListItemIcon>
                        <SwapHorizIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${swap.requester_name} ↔ ${swap.target_name}`}
                        secondary={`${swap.assignment_type.charAt(0).toUpperCase() + swap.assignment_type.slice(1)} Assignment`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        href={`/staff/swaps/${swap.id}`}
                      >
                        Review
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending swap requests.
                </Typography>
              )}

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/staff/approvals"
              >
                View All Pending Approvals
              </Button>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default StaffDashboardPage;
