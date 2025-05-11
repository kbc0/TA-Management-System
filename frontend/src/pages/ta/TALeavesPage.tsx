import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Event as EventIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface Leave {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewer_notes?: string;
}

interface NewLeaveRequest {
  leave_type: string;
  start_date: Date | null;
  end_date: Date | null;
  reason: string;
}

const TALeavesPage: React.FC = () => {
  const { authState } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openNewLeaveDialog, setOpenNewLeaveDialog] = useState<boolean>(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [newLeave, setNewLeave] = useState<NewLeaveRequest>({
    leave_type: 'personal',
    start_date: null,
    end_date: null,
    reason: '',
  });
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch leaves data
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const response = await api.get('/leaves/my-leaves');
        setLeaves(response.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching leaves data:', error);
        setError('Failed to load leave requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  // Open new leave request dialog
  const handleOpenNewLeaveDialog = () => {
    setOpenNewLeaveDialog(true);
  };

  // Close new leave request dialog
  const handleCloseNewLeaveDialog = () => {
    setOpenNewLeaveDialog(false);
    // Reset form
    setNewLeave({
      leave_type: 'personal',
      start_date: null,
      end_date: null,
      reason: '',
    });
    setFormErrors({});
  };

  // Open leave details dialog
  const handleOpenDetailsDialog = (leave: Leave) => {
    setSelectedLeave(leave);
    setOpenDetailsDialog(true);
  };

  // Close leave details dialog
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  // Handle leave type change
  const handleLeaveTypeChange = (event: SelectChangeEvent) => {
    setNewLeave({
      ...newLeave,
      leave_type: event.target.value,
    });
  };

  // Handle start date change
  const handleStartDateChange = (date: Date | null) => {
    setNewLeave({
      ...newLeave,
      start_date: date,
    });
    
    // Clear error if date is selected
    if (date) {
      setFormErrors({
        ...formErrors,
        start_date: '',
      });
    }
  };

  // Handle end date change
  const handleEndDateChange = (date: Date | null) => {
    setNewLeave({
      ...newLeave,
      end_date: date,
    });
    
    // Clear error if date is selected
    if (date) {
      setFormErrors({
        ...formErrors,
        end_date: '',
      });
    }
  };

  // Handle reason change
  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLeave({
      ...newLeave,
      reason: event.target.value,
    });
    
    // Clear error if reason is entered
    if (event.target.value) {
      setFormErrors({
        ...formErrors,
        reason: '',
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newLeave.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!newLeave.end_date) {
      errors.end_date = 'End date is required';
    }
    
    if (newLeave.start_date && newLeave.end_date && newLeave.start_date > newLeave.end_date) {
      errors.end_date = 'End date must be after start date';
    }
    
    if (!newLeave.reason.trim()) {
      errors.reason = 'Reason is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new leave request
  const handleSubmitLeaveRequest = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      const response = await api.post('/leaves', {
        leave_type: newLeave.leave_type,
        start_date: newLeave.start_date?.toISOString().split('T')[0],
        end_date: newLeave.end_date?.toISOString().split('T')[0],
        reason: newLeave.reason,
      });
      
      // Add new leave to the list - response.data.leave contains the leave object
      if (response.data && response.data.leave) {
        setLeaves([...leaves, response.data.leave]);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
      
      // Close dialog
      handleCloseNewLeaveDialog();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setFormErrors({
        ...formErrors,
        submit: 'Failed to submit leave request. Please try again.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  // Calculate duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
    return diffDays;
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            My Leave Requests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewLeaveDialog}
          >
            New Leave Request
          </Button>
        </Box>
        
        {/* Leave Requests Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Date Range</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)}
                    </TableCell>
                    <TableCell>{formatDateRange(leave.start_date, leave.end_date)}</TableCell>
                    <TableCell>{calculateDuration(leave.start_date, leave.end_date)} days</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        size="small"
                        color={getStatusColor(leave.status) as any}
                      />
                    </TableCell>
                    <TableCell>{new Date(leave.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenDetailsDialog(leave)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => window.history.back()}
        >
          Back to Dashboard
        </Button>
        
        {/* New Leave Request Dialog */}
        <Dialog
          open={openNewLeaveDialog}
          onClose={handleCloseNewLeaveDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please fill in the details for your leave request.
            </DialogContentText>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="leave-type-label">Leave Type</InputLabel>
              <Select
                labelId="leave-type-label"
                id="leave-type"
                value={newLeave.leave_type}
                label="Leave Type"
                onChange={handleLeaveTypeChange}
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="sick">Sick</MenuItem>
                <MenuItem value="conference">Conference</MenuItem>
                <MenuItem value="family">Family</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Start Date"
                value={newLeave.start_date}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    error: !!formErrors.start_date,
                    helperText: formErrors.start_date
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="End Date"
                value={newLeave.end_date}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    error: !!formErrors.end_date,
                    helperText: formErrors.end_date
                  }
                }}
              />
            </Box>
            
            <TextField
              margin="normal"
              id="reason"
              label="Reason"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={newLeave.reason}
              onChange={handleReasonChange}
              error={!!formErrors.reason}
              helperText={formErrors.reason}
            />
            
            {formErrors.submit && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {formErrors.submit}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewLeaveDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitLeaveRequest} 
              color="primary"
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Leave Details Dialog */}
        <Dialog
          open={openDetailsDialog}
          onClose={handleCloseDetailsDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedLeave && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {selectedLeave.leave_type.charAt(0).toUpperCase() + selectedLeave.leave_type.slice(1)} Leave Request
                  </Typography>
                  <Chip 
                    label={selectedLeave.status} 
                    size="small"
                    color={getStatusColor(selectedLeave.status) as any}
                  />
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <GridItem xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Date Range
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDateRange(selectedLeave.start_date, selectedLeave.end_date)}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Duration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {calculateDuration(selectedLeave.start_date, selectedLeave.end_date)} days
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Submitted On
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedLeave.created_at).toLocaleDateString()}
                    </Typography>
                  </GridItem>
                  
                  <GridItem xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      label={selectedLeave.status} 
                      size="small"
                      color={getStatusColor(selectedLeave.status) as any}
                    />
                    
                    {selectedLeave.updated_at && selectedLeave.status !== 'pending' && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Reviewed On
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {new Date(selectedLeave.updated_at).toLocaleDateString()}
                        </Typography>
                      </>
                    )}
                    
                    {selectedLeave.reviewer_notes && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Reviewer Notes
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body2">
                            {selectedLeave.reviewer_notes}
                          </Typography>
                        </Paper>
                      </>
                    )}
                  </GridItem>
                  
                  <GridItem xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Reason
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {selectedLeave.reason}
                      </Typography>
                    </Paper>
                  </GridItem>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetailsDialog}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TALeavesPage;
