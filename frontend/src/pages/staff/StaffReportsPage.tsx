import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';
// Import chart components conditionally to avoid build errors
let Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement;
let Bar, Pie;

// Only import and register chart.js if it's available
try {
  const ChartJS = require('chart.js');
  Chart = ChartJS.Chart;
  CategoryScale = ChartJS.CategoryScale;
  LinearScale = ChartJS.LinearScale;
  BarElement = ChartJS.BarElement;
  Title = ChartJS.Title;
  Tooltip = ChartJS.Tooltip;
  Legend = ChartJS.Legend;
  ArcElement = ChartJS.ArcElement;
  
  // Register ChartJS components
  Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );
  
  // Import react-chartjs-2 components
  const ReactChartJS = require('react-chartjs-2');
  Bar = ReactChartJS.Bar;
  Pie = ReactChartJS.Pie;
} catch (error) {
  console.error('Chart.js or react-chartjs-2 not available:', error);
  // Create placeholder components
  Bar = () => <div>Chart not available</div>;
  Pie = () => <div>Chart not available</div>;
}

// ChartJS registration is now handled in the try-catch block above

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

interface WorkloadReport {
  ta_id: string;
  full_name: string;
  bilkent_id: string;
  email: string;
  course_count: number;
  total_hours_per_week: number;
  task_count: number;
  active_tasks: number;
  completed_tasks: number;
  course_codes: string;
}

interface TaskReport {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  grading: number;
  proctoring: number;
  office_hours: number;
  other: number;
}

interface PerformanceReport {
  ta_id: string;
  full_name: string;
  bilkent_id: string;
  email: string;
  completion_rate: number;
  average_rating: number;
  on_time_percentage: number;
  total_tasks: number;
  completed_tasks: number;
}

const StaffReportsPage: React.FC = () => {
  const { authState } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Report data
  const [workloadData, setWorkloadData] = useState<WorkloadReport[]>([]);
  const [taskData, setTaskData] = useState<TaskReport | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceReport[]>([]);
  
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch courses first
        const response = await api.get('/courses');
        
        // Check if response.data has a courses property
        const coursesFromResponse = response.data.courses || response.data;
        
        // Ensure courses is always an array
        const coursesData = Array.isArray(coursesFromResponse) ? coursesFromResponse : [];
        setCourses(coursesData);
        
        // Fetch initial reports
        if (coursesData.length > 0) {
          await fetchReports('all');
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch reports based on selected course
  const fetchReports = async (courseId: string) => {
    try {
      setLoading(true);
      
      // Fetch workload report
      const workloadResponse = await api.get(`/dashboard/workload${courseId !== 'all' ? `?course_id=${courseId}` : ''}`);
      // Check if response.data has a workload property
      const workloadFromResponse = workloadResponse.data.workload || workloadResponse.data;
      const workloadData = Array.isArray(workloadFromResponse) ? workloadFromResponse : [];
      setWorkloadData(workloadData);
      
      // Fetch task statistics
      const taskResponse = await api.get(`/tasks/statistics${courseId !== 'all' ? `?course_id=${courseId}` : ''}`);
      // Check if response.data has a statistics property
      const taskDataFromResponse = taskResponse.data.statistics || taskResponse.data;
      setTaskData(taskDataFromResponse || null);
      
      // Fetch performance data
      const performanceResponse = await api.get(`/reports/ta-performance${courseId !== 'all' ? `?course_id=${courseId}` : ''}`);
      // Check if response.data has a performance property
      const performanceFromResponse = performanceResponse.data.performance || performanceResponse.data;
      const performanceData = Array.isArray(performanceFromResponse) ? performanceFromResponse : [];
      setPerformanceData(performanceData);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load report data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle course change
  const handleCourseChange = (event: any) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);
    fetchReports(courseId);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Export report as CSV
  const exportReport = () => {
    // This would normally generate a CSV file
    alert('Export functionality would be implemented here');
  };

  // Print report
  const printReport = () => {
    window.print();
  };

  // Prepare chart data for task types
  const getTaskTypeChartData = () => {
    if (!taskData) return {
      labels: ['No Data'],
      datasets: [{
        label: 'No Data Available',
        data: [1],
        backgroundColor: ['rgba(200, 200, 200, 0.6)'],
        borderColor: ['rgba(200, 200, 200, 1)'],
        borderWidth: 1,
      }]
    };
    
    return {
      labels: ['Grading', 'Proctoring', 'Office Hours', 'Other'],
      datasets: [
        {
          label: 'Task Distribution',
          data: [
            taskData.grading || 0,
            taskData.proctoring || 0,
            taskData.office_hours || 0,
            taskData.other || 0,
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for task status
  const getTaskStatusChartData = () => {
    if (!taskData) return {
      labels: ['No Data'],
      datasets: [{
        label: 'No Data Available',
        data: [1],
        backgroundColor: ['rgba(200, 200, 200, 0.6)'],
        borderColor: ['rgba(200, 200, 200, 1)'],
        borderWidth: 1,
      }]
    };
    
    return {
      labels: ['Active', 'Completed', 'Overdue'],
      datasets: [
        {
          label: 'Task Status',
          data: [
            taskData.active || 0,
            taskData.completed || 0,
            taskData.overdue || 0,
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
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
        <Typography variant="h4">Reports</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportReport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={printReport}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Course selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel id="course-select-label">Course</InputLabel>
            <Select
              labelId="course-select-label"
              id="course-select"
              value={selectedCourseId}
              label="Course"
              onChange={handleCourseChange}
            >
              <MenuItem value="all">All Courses</MenuItem>
              {Array.isArray(courses) && courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.course_code}: {course.course_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Report tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="TA Workload" />
          <Tab label="Task Statistics" />
          <Tab label="Performance" />
        </Tabs>
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* TA Workload Report */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              TA Workload Report
            </Typography>
            
            {workloadData.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>TA</TableCell>
                      <TableCell>Bilkent ID</TableCell>
                      <TableCell>Courses</TableCell>
                      <TableCell>Hours/Week</TableCell>
                      <TableCell>Tasks</TableCell>
                      <TableCell>Completion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workloadData.map((ta) => (
                      <TableRow key={ta.ta_id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body1">{ta.full_name}</Typography>
                              <Typography variant="body2" color="text.secondary">{ta.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{ta.bilkent_id}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{ta.course_codes}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ta.course_count} course(s)
                          </Typography>
                        </TableCell>
                        <TableCell>{ta.total_hours_per_week}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {ta.task_count} total
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ta.completed_tasks} completed, {ta.active_tasks} active
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={ta.task_count > 0 ? (ta.completed_tasks / ta.task_count) * 100 : 0}
                                color={
                                  ta.task_count > 0 && (ta.completed_tasks / ta.task_count) * 100 > 80
                                    ? 'success'
                                    : ta.task_count > 0 && (ta.completed_tasks / ta.task_count) * 100 > 60
                                    ? 'primary'
                                    : 'error'
                                }
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {ta.task_count > 0 ? Math.round((ta.completed_tasks / ta.task_count) * 100) : 0}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 4 }}>
                No workload data available for the selected course.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Statistics */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <GridItem xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Status Distribution
                </Typography>
                
                {taskData ? (
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {Pie && <Pie data={getTaskStatusChartData()} />}
                  </Box>
                ) : (
                  <Typography variant="body1" align="center" sx={{ py: 4 }}>
                    No task data available for the selected course.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </GridItem>
          
          <GridItem xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Type Distribution
                </Typography>
                
                {taskData ? (
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {Pie && <Pie data={getTaskTypeChartData()} />}
                  </Box>
                ) : (
                  <Typography variant="body1" align="center" sx={{ py: 4 }}>
                    No task data available for the selected course.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </GridItem>
          
          <GridItem xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Summary
                </Typography>
                
                {taskData ? (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <GridItem xs={6} sm={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {taskData.total || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Tasks
                        </Typography>
                      </Paper>
                    </GridItem>
                    
                    <GridItem xs={6} sm={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {taskData.completed || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed
                        </Typography>
                      </Paper>
                    </GridItem>
                    
                    <GridItem xs={6} sm={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main">
                          {taskData.active || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active
                        </Typography>
                      </Paper>
                    </GridItem>
                    
                    <GridItem xs={6} sm={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {taskData.overdue || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overdue
                        </Typography>
                      </Paper>
                    </GridItem>
                  </Grid>
                ) : (
                  <Typography variant="body1" align="center" sx={{ py: 4 }}>
                    No task data available for the selected course.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </GridItem>
        </Grid>
      )}

      {/* Performance Report */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              TA Performance Report
            </Typography>
            
            {performanceData.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>TA</TableCell>
                      <TableCell>Bilkent ID</TableCell>
                      <TableCell>Completion Rate</TableCell>
                      <TableCell>On-Time %</TableCell>
                      <TableCell>Average Rating</TableCell>
                      <TableCell>Tasks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceData.map((ta) => (
                      <TableRow key={ta.ta_id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body1">{ta.full_name}</Typography>
                              <Typography variant="body2" color="text.secondary">{ta.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{ta.bilkent_id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={ta.completion_rate}
                                color={
                                  ta.completion_rate > 80
                                    ? 'success'
                                    : ta.completion_rate > 60
                                    ? 'primary'
                                    : 'error'
                                }
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {ta.completion_rate}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={ta.on_time_percentage}
                                color={
                                  ta.on_time_percentage > 80
                                    ? 'success'
                                    : ta.on_time_percentage > 60
                                    ? 'primary'
                                    : 'error'
                                }
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {ta.on_time_percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                              {ta.average_rating.toFixed(1)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {[...Array(5)].map((_, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: i < Math.round(ta.average_rating) ? 'primary.main' : 'grey.300',
                                    mx: 0.2,
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {ta.completed_tasks} / {ta.total_tasks}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 4 }}>
                No performance data available for the selected course.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StaffReportsPage;
