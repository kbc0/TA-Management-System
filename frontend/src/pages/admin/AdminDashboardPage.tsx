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
  Paper,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import GridItem from '../../components/common/GridItem';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Dashboard data interface
interface DashboardData {
  user: any;
  systemStats: {
    totalUsers: number;
    totalCourses: number;
    activeTAs: number;
    activeStaff: number;
  };
  userDistribution: {
    name: string;
    value: number;
  }[];
  courseStats: {
    name: string;
    tas: number;
    tasks: number;
  }[];
  recentAuditLogs: any[];
  pendingApprovals: number;
}

const AdminDashboardPage: React.FC = () => {
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
    systemStats: {
      totalUsers: 125,
      totalCourses: 24,
      activeTAs: 85,
      activeStaff: 35,
    },
    userDistribution: [
      { name: 'TAs', value: 85 },
      { name: 'Staff', value: 35 },
      { name: 'Admins', value: 5 },
    ],
    courseStats: [
      { name: 'CS101', tas: 5, tasks: 25 },
      { name: 'CS223', tas: 3, tasks: 18 },
      { name: 'CS315', tas: 2, tasks: 15 },
      { name: 'CS342', tas: 4, tasks: 22 },
      { name: 'CS443', tas: 3, tasks: 20 },
    ],
    recentAuditLogs: [
      {
        id: 1,
        user: 'John Smith',
        action: 'USER_LOGIN',
        timestamp: '2025-05-10T14:30:00Z',
        ip_address: '192.168.1.1',
      },
      {
        id: 2,
        user: 'Admin User',
        action: 'USER_CREATED',
        timestamp: '2025-05-10T13:45:00Z',
        ip_address: '192.168.1.2',
      },
      {
        id: 3,
        user: 'Emily Johnson',
        action: 'PERMISSION_CHANGED',
        timestamp: '2025-05-10T12:15:00Z',
        ip_address: '192.168.1.3',
      },
      {
        id: 4,
        user: 'Michael Brown',
        action: 'COURSE_CREATED',
        timestamp: '2025-05-10T11:30:00Z',
        ip_address: '192.168.1.4',
      },
      {
        id: 5,
        user: 'Sarah Wilson',
        action: 'TA_ASSIGNED',
        timestamp: '2025-05-10T10:45:00Z',
        ip_address: '192.168.1.5',
      },
    ],
    pendingApprovals: 8,
  };

  // Use mock data for now
  const data = dashboardData || mockData;

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Box sx={{ p: 2 }}>
      {/* Welcome message */}
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        System overview and management
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* System Stats */}
        <GridItem xs={12}>
          <Grid container spacing={3}>
            <GridItem xs={6} sm={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {data.systemStats.totalUsers}
                </Typography>
                <Typography variant="body2">Total Users</Typography>
              </Paper>
            </GridItem>
            <GridItem xs={6} sm={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                }}
              >
                <SchoolIcon sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {data.systemStats.totalCourses}
                </Typography>
                <Typography variant="body2">Total Courses</Typography>
              </Paper>
            </GridItem>
            <GridItem xs={6} sm={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {data.systemStats.activeTAs}
                </Typography>
                <Typography variant="body2">Active TAs</Typography>
              </Paper>
            </GridItem>
            <GridItem xs={6} sm={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'info.light',
                  color: 'info.contrastText',
                }}
              >
                <SupervisorAccountIcon sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {data.systemStats.activeStaff}
                </Typography>
                <Typography variant="body2">Active Staff</Typography>
              </Paper>
            </GridItem>
          </Grid>
        </GridItem>

        {/* User Distribution */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="User Distribution" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridItem>

        {/* Course Statistics */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Course Statistics" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.courseStats}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tas" fill="#8884d8" name="TAs" />
                  <Bar dataKey="tasks" fill="#82ca9d" name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridItem>

        {/* Recent Audit Logs */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent System Activity" 
              action={
                <Button 
                  size="small" 
                  startIcon={<HistoryIcon />}
                  href="/admin/audit-logs"
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {data.recentAuditLogs.map((log) => (
                  <ListItem key={log.id}>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={log.action.replace(/_/g, ' ')}
                      secondary={`${log.user} • ${new Date(log.timestamp).toLocaleString()} • ${log.ip_address}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </GridItem>

        {/* Quick Actions */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Administrative Actions" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <GridItem xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PersonIcon />}
                    href="/admin/users"
                    sx={{ mb: 2 }}
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SchoolIcon />}
                    href="/admin/courses"
                    sx={{ mb: 2 }}
                  >
                    Manage Courses
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SecurityIcon />}
                    href="/admin/roles"
                    sx={{ mb: 2 }}
                  >
                    Manage Roles
                  </Button>
                </GridItem>
                <GridItem xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<NotificationsIcon />}
                    href="/admin/notifications"
                    sx={{ mb: 2 }}
                  >
                    Send Notifications
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AssessmentIcon />}
                    href="/admin/reports"
                    sx={{ mb: 2 }}
                  >
                    System Reports
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SettingsIcon />}
                    href="/admin/settings"
                    sx={{ mb: 2 }}
                  >
                    System Settings
                  </Button>
                </GridItem>
              </Grid>
              
              {data.pendingApprovals > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    href="/admin/approvals"
                    startIcon={<NotificationsIcon />}
                  >
                    {data.pendingApprovals} Pending Approval{data.pendingApprovals !== 1 && 's'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
