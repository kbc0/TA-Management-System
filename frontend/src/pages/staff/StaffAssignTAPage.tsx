import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  FormHelperText,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface TA {
  id: string;
  full_name: string;
  bilkent_id: string;
  email: string;
  department: string;
}

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  semester: string;
  department: string;
}

const StaffAssignTAPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [availableTAs, setAvailableTAs] = useState<TA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [selectedTA, setSelectedTA] = useState<string>('');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(5);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    ta: false,
    hours: false,
    startDate: false,
    endDate: false
  });

  // Fetch course details and available TAs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await api.get(`/courses/${courseId}`);
        setCourse(courseResponse.data);
        
        // Fetch available TAs
        const tasResponse = await api.get('/users?role=ta');
        
        // Ensure we're setting an array of TAs
        // Check if response.data has a users property or is an array directly
        const tasData = tasResponse.data.users || tasResponse.data;
        setAvailableTAs(Array.isArray(tasData) ? tasData : []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId]);

  // Set default end date to 4 months after start date
  useEffect(() => {
    if (startDate) {
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 4);
      setEndDate(defaultEndDate);
    }
  }, [startDate]);

  // Validate form
  const validateForm = () => {
    const errors = {
      ta: !selectedTA,
      hours: hoursPerWeek <= 0,
      startDate: !startDate,
      endDate: !endDate
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Format dates for API
      const formattedStartDate = startDate?.toISOString().split('T')[0];
      const formattedEndDate = endDate?.toISOString().split('T')[0];
      
      // Submit assignment to API
      await api.post(`/courses/${courseId}/tas`, {
        ta_id: selectedTA,
        hours_per_week: hoursPerWeek,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        status: 'active'
      });
      
      setSuccess('TA assigned successfully!');
      
      // Reset form
      setSelectedTA('');
      setHoursPerWeek(5);
      
      // Redirect back to course page after short delay
      setTimeout(() => {
        navigate(`/staff/courses`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error assigning TA:', err);
      setError(err.response?.data?.message || 'Failed to assign TA. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Assign TA to Course
      </Typography>
      
      {course && (
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {course.course_code}: {course.course_name}
        </Typography>
      )}
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <GridItem xs={12}>
                <FormControl fullWidth error={formErrors.ta}>
                  <InputLabel id="ta-select-label">Select Teaching Assistant</InputLabel>
                  <Select
                    labelId="ta-select-label"
                    value={selectedTA}
                    onChange={(e) => setSelectedTA(e.target.value)}
                    label="Select Teaching Assistant"
                    disabled={submitting}
                  >
                    {availableTAs.map((ta) => (
                      <MenuItem key={ta.id} value={ta.id}>
                        {ta.full_name} ({ta.bilkent_id})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.ta && (
                    <FormHelperText>Please select a TA</FormHelperText>
                  )}
                </FormControl>
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hours Per Week"
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 20 } }}
                  error={formErrors.hours}
                  helperText={formErrors.hours ? "Hours must be greater than 0" : ""}
                  disabled={submitting}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formErrors.startDate,
                        helperText: formErrors.startDate ? "Start date is required" : ""
                      }
                    }}
                    disabled={submitting}
                  />
                </LocalizationProvider>
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    minDate={startDate || undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formErrors.endDate,
                        helperText: formErrors.endDate ? "End date is required" : ""
                      }
                    }}
                    disabled={submitting}
                  />
                </LocalizationProvider>
              </GridItem>
              
              <GridItem xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Assign TA'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/staff/courses')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Box>
              </GridItem>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StaffAssignTAPage;
