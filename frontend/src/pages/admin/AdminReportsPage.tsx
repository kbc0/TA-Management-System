import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import GridItem from '../../components/common/GridItem';
import api from '../../services/api';

// Using the configured API service

// Report types
type ReportType = 'ta-performance' | 'course-utilization';

// Interface for TA Performance data
interface TAPerformanceData {
  id: number;
  full_name: string;
  bilkent_id: string;
  email: string;
  course_count: number;
  courses: string;
  total_tasks: number;
  completed_tasks: string;
  completion_rate: string;
  avg_completion_days: number | null;
  leave_requests: number;
  swap_requests: number;
  task_breakdown: {
    task_type: string;
    count: number;
    completed: string;
  }[];
  leave_breakdown: {
    status: string;
    count: number;
  }[];
}

// Interface for Course Utilization data
interface CourseUtilizationData {
  id: number;
  course_code: string;
  course_name: string;
  semester: string;
  department: string;
  credits: number;
  ta_count: number;
  total_ta_hours: number | null;
  hours_per_credit: number | null;
  task_count: number;
  completed_tasks: string;
  task_completion_rate: string;
  tas: any[];
  task_breakdown: {
    task_type: string;
    count: number;
    completed: string;
  }[];
}

// No semester summary interface needed anymore

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminReportsPage: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<ReportType>('ta-performance');
  
  // State for report data
  const [taPerformanceData, setTaPerformanceData] = useState<TAPerformanceData[]>([]);
  const [courseUtilizationData, setCourseUtilizationData] = useState<CourseUtilizationData[]>([]);
  
  // State for loading
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [semester, setSemester] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [department, setDepartment] = useState<string>('');
  
  // State for notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch report data based on active tab
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // No need to validate semester parameter anymore
      
      // Build query parameters
      const params = new URLSearchParams();
      if (semester) params.append('semester', semester);
      params.append('year', year.toString());
      if (department) params.append('department', department);
      
      // No special validation needed anymore
      
      const response = await api.get(`/reports/${activeTab}`, { params });
      
      // Handle nested response structures based on report type
      switch (activeTab) {
        case 'ta-performance':
          let taData;
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            taData = response.data.data;
          } else if (Array.isArray(response.data)) {
            taData = response.data;
          } else {
            console.warn('Unexpected API response format for TA performance report:', response.data);
            taData = [];
          }
          setTaPerformanceData(taData);
          break;
          
        case 'course-utilization':
          let courseData;
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            courseData = response.data.data;
          } else if (Array.isArray(response.data)) {
            courseData = response.data;
          } else {
            console.warn('Unexpected API response format for course utilization report:', response.data);
            courseData = [];
          }
          setCourseUtilizationData(courseData);
          break;
          
        // No semester-summary case needed anymore
      }
    } catch (error: any) {
      console.error(`Error fetching ${activeTab} report:`, error);
      // Handle API errors with more specific messaging
      if (error.response && error.response.data && error.response.data.message) {
        setError(`${error.response.data.message}. Please try again.`);
      } else {
        setError(`Failed to load ${activeTab.replace('-', ' ')} report. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Export report data
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (semester) params.append('semester', semester);
      params.append('year', year.toString());
      if (department) params.append('department', department);
      params.append('format', format);
      
      const response = await api.get(`/reports/export/${activeTab}`, { params, responseType: 'blob' });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        open: true,
        message: `Report exported successfully as ${format.toUpperCase()}`,
        severity: 'success',
      });
    } catch (error) {
      console.error(`Error exporting ${activeTab} report:`, error);
      setNotification({
        open: true,
        message: `Failed to export report. Please try again.`,
        severity: 'error',
      });
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: ReportType) => {
    setActiveTab(newValue);
  };

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, [activeTab, semester, year, department]);

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Render TA Performance Report
  const renderTAPerformanceReport = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => fetchReportData()}
          >
            Retry
          </Button>
        </Box>
      );
    }

    if (taPerformanceData.length === 0) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">
            No TA performance data available for the selected filters.
          </Typography>
        </Box>
      );
    }

    // Prepare data for task breakdown chart
    const taskBreakdownData = taPerformanceData.length > 0 && taPerformanceData[0].task_breakdown
      ? taPerformanceData[0].task_breakdown.map(item => ({
          name: item.task_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          completed: parseInt(item.completed) || 0,
          total: item.count
        }))
      : [];

    // Prepare data for leave breakdown pie chart
    const leaveBreakdownData = taPerformanceData.length > 0 && taPerformanceData[0].leave_breakdown
      ? taPerformanceData[0].leave_breakdown.map(item => ({
          name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          value: item.count
        }))
      : [];

    return (
      <Grid container spacing={3}>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Task Completion" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={taskBreakdownData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                  <Bar dataKey="total" fill="#82ca9d" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridItem>
        
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Leave Request Status" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {leaveBreakdownData.map((entry, index) => (
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
        
        <GridItem xs={12}>
          <Card>
            <CardHeader title="TA Performance Summary" />
            <Divider />
            <CardContent>
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Bilkent ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Courses</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Course Count</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Tasks</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completed Tasks</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taPerformanceData.map((ta) => (
                        <tr key={ta.id}>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{ta.full_name}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{ta.bilkent_id}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{ta.email}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{ta.courses || 'None'}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{ta.course_count || 0}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{ta.total_tasks || 0}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{ta.completed_tasks || 0}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{parseFloat(ta.completion_rate).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </GridItem>

        <GridItem xs={12}>
          <Card>
            <CardHeader title="Task Breakdown" />
            <Divider />
            <CardContent>
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Task Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Count</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completed</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taPerformanceData.length > 0 && taPerformanceData[0].task_breakdown.map((task, index) => {
                        const completionRate = task.count > 0 ? (parseInt(task.completed) / task.count * 100) : 0;
                        return (
                          <tr key={index}>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                              {task.task_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{task.count}</td>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{task.completed}</td>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{completionRate.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    );
  };

  // Render Course Utilization Report
  const renderCourseUtilizationReport = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => fetchReportData()}
          >
            Retry
          </Button>
        </Box>
      );
    }

    if (courseUtilizationData.length === 0) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">
            No course utilization data available for the selected filters.
          </Typography>
        </Box>
      );
    }

    // Prepare data for task breakdown chart
    const taskBreakdownData = courseUtilizationData.length > 0 && courseUtilizationData[0].task_breakdown
      ? courseUtilizationData[0].task_breakdown.map(item => ({
          name: item.task_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          completed: parseInt(item.completed) || 0,
          total: item.count
        }))
      : [];

    return (
      <Grid container spacing={3}>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Task Completion by Type" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={taskBreakdownData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                  <Bar dataKey="total" fill="#82ca9d" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridItem>
        
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Task Completion Rate" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={courseUtilizationData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course_code" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={(course) => parseFloat(course.task_completion_rate)} fill="#82ca9d" name="Completion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridItem>
        
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Course Utilization Summary" />
            <Divider />
            <CardContent>
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Course Code</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Course Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Department</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Semester</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>TA Count</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Task Count</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completed Tasks</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseUtilizationData.map((course) => (
                        <tr key={course.id}>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.course_code}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.course_name}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.department}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.semester}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.ta_count}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.task_count}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.completed_tasks}</td>
                          <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{course.task_completion_rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </GridItem>

        <GridItem xs={12}>
          <Card>
            <CardHeader title="Task Breakdown by Type" />
            <Divider />
            <CardContent>
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Task Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Count</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completed</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseUtilizationData.length > 0 && courseUtilizationData[0].task_breakdown.map((task, index) => {
                        const completionRate = task.count > 0 ? (parseInt(task.completed) / task.count * 100) : 0;
                        return (
                          <tr key={index}>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                              {task.task_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{task.count}</td>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{task.completed}</td>
                            <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{completionRate.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    );
  };

  // Semester Summary Report removed as requested

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Reports
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={() => handleExport('pdf')}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<TableIcon />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="TA Performance" value="ta-performance" />
            <Tab label="Course Utilization" value="course-utilization" />
          </Tabs>
          
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={semester}
                onChange={(e) => setSemester(e.target.value as string)}
                label="Semester"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Fall">Fall</MenuItem>
                <MenuItem value="Spring">Spring</MenuItem>
                <MenuItem value="Summer">Summer</MenuItem>
                <MenuItem value="Winter">Winter</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              sx={{ minWidth: 100 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value as string)}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Computer Science">Computer Science</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="Biology">Biology</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton color="primary" onClick={fetchReportData}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'ta-performance' && renderTAPerformanceReport()}
        {activeTab === 'course-utilization' && renderCourseUtilizationReport()}
      </Box>

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

export default AdminReportsPage;
