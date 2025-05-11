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
import {
  SwapHoriz as SwapHorizIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface Swap {
  id: number;
  assignment_type: string;
  original_assignment_id: number;
  target_ta_id: number;
  target_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewer_notes?: string;
  assignment_details?: {
    title: string;
    course_code: string;
    date: string;
  };
}

interface Task {
  id: number;
  title: string;
  course_code: string;
  due_date: string;
}

interface TA {
  id: number;
  fullName: string;
  bilkentId: string;
}

interface NewSwapRequest {
  assignment_type: string;
  original_assignment_id: number | '';
  target_ta_id: number | '';
  reason: string;
}

const TASwapsPage: React.FC = () => {
  const { authState } = useAuth();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tas, setTAs] = useState<TA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openNewSwapDialog, setOpenNewSwapDialog] = useState<boolean>(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [newSwap, setNewSwap] = useState<NewSwapRequest>({
    assignment_type: 'task',
    original_assignment_id: '',
    target_ta_id: '',
    reason: '',
  });
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch swaps data
  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setLoading(true);
        
        // Fetch swap requests
        const swapsResponse = await api.get('/swaps/my-swaps');
        setSwaps(swapsResponse.data || []);
        
        // Fetch tasks for the new swap dialog
        try {
          const tasksResponse = await api.get('/tasks/my-tasks');
          if (Array.isArray(tasksResponse.data)) {
            setTasks(tasksResponse.data);
          } else {
            console.warn('Tasks response is not an array:', tasksResponse.data);
            setTasks([]);
          }
        } catch (taskError) {
          console.error('Error fetching tasks:', taskError);
          setTasks([]);
        }
        
        // Fetch TAs for the new swap dialog
        try {
          const tasResponse = await api.get('/users/tas');
          if (Array.isArray(tasResponse.data)) {
            // Filter out the current user from the TA list
            const filteredTAs = tasResponse.data.filter((ta: TA) => ta.id !== authState.user?.id) || [];
            setTAs(filteredTAs);
          } else {
            console.warn('TAs response is not an array:', tasResponse.data);
            setTAs([]);
          }
        } catch (taError) {
          console.error('Error fetching TAs:', taError);
          setTAs([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching swaps data:', error);
        setError('Failed to load swap requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSwaps();
  }, [authState.user?.id]);

  // Open new swap request dialog
  const handleOpenNewSwapDialog = () => {
    setOpenNewSwapDialog(true);
  };

  // Close new swap request dialog
  const handleCloseNewSwapDialog = () => {
    setOpenNewSwapDialog(false);
    // Reset form
    setNewSwap({
      assignment_type: 'task',
      original_assignment_id: '',
      target_ta_id: '',
      reason: '',
    });
    setFormErrors({});
  };

  // Open swap details dialog
  const handleOpenDetailsDialog = (swap: Swap) => {
    setSelectedSwap(swap);
    setOpenDetailsDialog(true);
  };

  // Close swap details dialog
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  // Handle assignment type change
  const handleAssignmentTypeChange = (event: SelectChangeEvent) => {
    setNewSwap({
      ...newSwap,
      assignment_type: event.target.value,
      original_assignment_id: '', // Reset selection when type changes
    });
  };

  // Handle original assignment change
  const handleOriginalAssignmentChange = (event: SelectChangeEvent) => {
    setNewSwap({
      ...newSwap,
      original_assignment_id: Number(event.target.value),
    });
    
    // Clear error if assignment is selected
    if (event.target.value) {
      setFormErrors({
        ...formErrors,
        original_assignment_id: '',
      });
    }
  };

  // Handle target TA change
  const handleTargetTAChange = (event: SelectChangeEvent) => {
    setNewSwap({
      ...newSwap,
      target_ta_id: Number(event.target.value),
    });
    
    // Clear error if TA is selected
    if (event.target.value) {
      setFormErrors({
        ...formErrors,
        target_ta_id: '',
      });
    }
  };

  // Handle reason change
  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewSwap({
      ...newSwap,
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
    
    if (!newSwap.original_assignment_id) {
      errors.original_assignment_id = 'Assignment is required';
    }
    
    if (!newSwap.target_ta_id) {
      errors.target_ta_id = 'Target TA is required';
    }
    
    if (!newSwap.reason.trim()) {
      errors.reason = 'Reason is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new swap request
  const handleSubmitSwapRequest = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      const response = await api.post('/swaps', {
        assignment_type: newSwap.assignment_type,
        original_assignment_id: newSwap.original_assignment_id,
        target_id: newSwap.target_ta_id, // Changed to match backend expectation
        reason: newSwap.reason,
      });
      
      // Add new swap to the list - response.data.swap contains the swap object
      if (response.data && response.data.swap) {
        // Make sure the swap object has all the required fields
        const newSwapData = response.data.swap;
        
        // Ensure assignment_type exists to prevent charAt error
        if (!newSwapData.assignment_type) {
          newSwapData.assignment_type = newSwap.assignment_type;
        }
        
        setSwaps([...swaps, newSwapData]);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
      
      // Close dialog
      handleCloseNewSwapDialog();
    } catch (error) {
      console.error('Error submitting swap request:', error);
      setFormErrors({
        ...formErrors,
        submit: 'Failed to submit swap request. Please try again.',
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
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          My Swap Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewSwapDialog}
        >
          New Swap Request
        </Button>
      </Box>
      
      {/* Swap Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Target TA</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted On</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {swaps.length > 0 ? (
              swaps.map((swap) => (
                <TableRow key={swap.id}>
                  <TableCell>
                    {swap.assignment_type.charAt(0).toUpperCase() + swap.assignment_type.slice(1)}
                  </TableCell>
                  <TableCell>
                    {swap.assignment_details ? (
                      `${swap.assignment_details.title} (${swap.assignment_details.course_code})`
                    ) : (
                      `Assignment #${swap.original_assignment_id}`
                    )}
                  </TableCell>
                  <TableCell>{swap.target_name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={swap.status} 
                      size="small"
                      color={getStatusColor(swap.status) as any}
                    />
                  </TableCell>
                  <TableCell>{new Date(swap.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenDetailsDialog(swap)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No swap requests found.
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
      
      {/* New Swap Request Dialog */}
      <Dialog
        open={openNewSwapDialog}
        onClose={handleCloseNewSwapDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Swap Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please fill in the details for your swap request.
          </DialogContentText>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="assignment-type-label">Assignment Type</InputLabel>
            <Select
              labelId="assignment-type-label"
              id="assignment-type"
              value={newSwap.assignment_type}
              label="Assignment Type"
              onChange={handleAssignmentTypeChange}
            >
              <MenuItem value="task">Task</MenuItem>
              <MenuItem value="office_hours">Office Hours</MenuItem>
              <MenuItem value="lab_session">Lab Session</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal" error={!!formErrors.original_assignment_id}>
            <InputLabel id="original-assignment-label">Assignment</InputLabel>
            <Select
              labelId="original-assignment-label"
              id="original-assignment"
              value={newSwap.original_assignment_id === '' ? '' : newSwap.original_assignment_id.toString()}
              label="Assignment"
              onChange={handleOriginalAssignmentChange}
              disabled={tasks.length === 0}
            >
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <MenuItem key={task.id} value={task.id.toString()}>
                    {task.title} ({task.course_code}) - Due: {new Date(task.due_date).toLocaleDateString()}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No assignments available
                </MenuItem>
              )}
            </Select>
            {formErrors.original_assignment_id && (
              <Typography variant="caption" color="error">
                {formErrors.original_assignment_id}
              </Typography>
            )}
            {tasks.length === 0 && (
              <Typography variant="caption" color="error">
                You don't have any assigned tasks to swap
              </Typography>
            )}
          </FormControl>
          
          <FormControl fullWidth margin="normal" error={!!formErrors.target_ta_id}>
            <InputLabel id="target-ta-label">Target TA</InputLabel>
            <Select
              labelId="target-ta-label"
              id="target-ta"
              value={newSwap.target_ta_id === '' ? '' : newSwap.target_ta_id.toString()}
              label="Target TA"
              onChange={handleTargetTAChange}
              disabled={tas.length === 0}
            >
              {tas.length > 0 ? (
                tas.map((ta) => (
                  <MenuItem key={ta.id} value={ta.id.toString()}>
                    {ta.fullName} ({ta.bilkentId})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No other TAs available
                </MenuItem>
              )}
            </Select>
            {formErrors.target_ta_id && (
              <Typography variant="caption" color="error">
                {formErrors.target_ta_id}
              </Typography>
            )}
            {tas.length === 0 && (
              <Typography variant="caption" color="error">
                No other TAs are available for swap
              </Typography>
            )}
          </FormControl>
          
          <TextField
            margin="normal"
            id="reason"
            label="Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newSwap.reason}
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
          <Button onClick={handleCloseNewSwapDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitSwapRequest}
            variant="contained"
            disabled={submitLoading || tasks.length === 0 || tas.length === 0}
          >
            {submitLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Swap Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedSwap && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {selectedSwap.assignment_type.charAt(0).toUpperCase() + selectedSwap.assignment_type.slice(1)} Swap Request
                </Typography>
                <Chip 
                  label={selectedSwap.status} 
                  size="small"
                  color={getStatusColor(selectedSwap.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <GridItem xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Assignment
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedSwap.assignment_details ? (
                      `${selectedSwap.assignment_details.title} (${selectedSwap.assignment_details.course_code})`
                    ) : (
                      `Assignment #${selectedSwap.original_assignment_id}`
                    )}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Target TA
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedSwap.target_name}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Submitted On
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedSwap.created_at).toLocaleDateString()}
                  </Typography>
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedSwap.status} 
                    size="small"
                    color={getStatusColor(selectedSwap.status) as any}
                  />
                  
                  {selectedSwap.updated_at && selectedSwap.status !== 'pending' && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Reviewed On
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {new Date(selectedSwap.updated_at).toLocaleDateString()}
                      </Typography>
                    </>
                  )}
                  
                  {selectedSwap.reviewer_notes && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Reviewer Notes
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2">
                          {selectedSwap.reviewer_notes}
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
                      {selectedSwap.reason}
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
  );
};

export default TASwapsPage;
