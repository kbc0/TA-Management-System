import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  SwapHoriz as SwapHorizIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

// Swap status colors
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'primary',
  cancelled: 'default',
};

// Swap type labels
const SWAP_TYPES: Record<string, string> = {
  task: 'Task Assignment',
  office_hours: 'Office Hours',
  recitation: 'Recitation',
  lab: 'Lab Session',
  other: 'Other',
};

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

interface Task {
  id: string;
  title: string;
  task_type: string;
  due_date: string;
}

interface TA {
  id: string;
  full_name: string;
  bilkent_id: string;
  email: string;
}

interface Swap {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  requester_bilkent_id: string;
  target_id: string;
  target_name: string;
  target_email: string;
  target_bilkent_id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  assignment_id: string;
  assignment_title: string;
  assignment_type: string;
  original_date: string;
  proposed_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  reviewer_id?: string;
  reviewer_name?: string;
  review_date?: string;
  review_notes?: string;
  created_at: string;
}

interface SwapFormData {
  review_notes: string;
}

const StaffSwapsPage: React.FC = () => {
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState<boolean>(false);
  const [openApproveDialog, setOpenApproveDialog] = useState<boolean>(false);
  const [openRejectDialog, setOpenRejectDialog] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<SwapFormData>({
    review_notes: '',
  });
  
  // Fetch swaps data
  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setLoading(true);
        const response = await api.get('/swaps');
        setSwaps(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching swaps:', error);
        setError('Failed to load swap requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSwaps();
  }, []);

  // Filter swaps based on selected tab
  const getFilteredSwaps = () => {
    switch (tabValue) {
      case 0: // All
        return swaps;
      case 1: // Pending
        return swaps.filter(swap => swap.status === 'pending');
      case 2: // Approved
        return swaps.filter(swap => swap.status === 'approved' || swap.status === 'completed');
      case 3: // Rejected
        return swaps.filter(swap => swap.status === 'rejected' || swap.status === 'cancelled');
      default:
        return swaps;
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open swap detail dialog
  const handleViewSwap = (swap: Swap) => {
    setSelectedSwap(swap);
    setFormData({
      review_notes: swap.review_notes || '',
    });
    setOpenDetailDialog(true);
  };

  // Open approve dialog
  const handleOpenApproveDialog = (swap: Swap) => {
    setSelectedSwap(swap);
    setFormData({
      review_notes: '',
    });
    setOpenApproveDialog(true);
  };

  // Open reject dialog
  const handleOpenRejectDialog = (swap: Swap) => {
    setSelectedSwap(swap);
    setFormData({
      review_notes: '',
    });
    setOpenRejectDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle approve swap
  const handleApproveSwap = async () => {
    if (!selectedSwap) return;
    
    try {
      await api.put(`/swaps/${selectedSwap.id}/status`, {
        status: 'approved',
        reviewer_notes: formData.review_notes,
      });
      
      // Show success message
      setSuccessMessage(`Swap request approved successfully. The task has been reassigned between ${selectedSwap.requester_name} and ${selectedSwap.target_name}.`);
      setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
      
      // Refresh swaps list
      const response = await api.get('/swaps');
      setSwaps(response.data);
      
      // Close dialog
      setOpenApproveDialog(false);
      setSelectedSwap(null);
    } catch (error) {
      console.error('Error approving swap:', error);
      setError('Failed to approve swap request. Please try again later.');
    }
  };

  // Handle reject swap
  const handleRejectSwap = async () => {
    if (!selectedSwap) return;
    
    try {
      await api.put(`/swaps/${selectedSwap.id}/status`, {
        status: 'rejected',
        reviewer_notes: formData.review_notes,
      });
      
      // Show success message
      setSuccessMessage(`Swap request rejected successfully.`);
      setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
      
      // Refresh swaps list
      const response = await api.get('/swaps');
      setSwaps(response.data);
      
      // Close dialog
      setOpenRejectDialog(false);
      setSelectedSwap(null);
    } catch (error) {
      console.error('Error rejecting swap:', error);
      setError('Failed to reject swap request. Please try again later.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const filteredSwaps = getFilteredSwaps();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Swap Requests
      </Typography>
      
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Tabs for filtering */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="swap request tabs">
          <Tab label="All" />
          <Tab label={`Pending (${swaps.filter(s => s.status === 'pending').length})`} />
          <Tab label={`Approved (${swaps.filter(s => s.status === 'approved' || s.status === 'completed').length})`} />
          <Tab label={`Rejected (${swaps.filter(s => s.status === 'rejected' || s.status === 'cancelled').length})`} />
        </Tabs>
      </Box>

      {/* Swaps list */}
      <Card>
        <CardContent>
          {filteredSwaps.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Swap Details</TableCell>
                    <TableCell>Requesters</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSwaps.map((swap) => (
                    <TableRow key={swap.id}>
                      <TableCell>
                        <Typography variant="body1">{swap.course_code}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {swap.course_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          <Chip
                            icon={<AssignmentIcon />}
                            label={SWAP_TYPES[swap.assignment_type] || swap.assignment_type}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {swap.assignment_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Original: {formatDate(swap.original_date)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Proposed: {formatDate(swap.proposed_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                            {swap.requester_name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {swap.requester_name} (Requester)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                            {swap.target_name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {swap.target_name} (Target)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                          color={STATUS_COLORS[swap.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewSwap(swap)}>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {swap.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleOpenApproveDialog(swap)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleOpenRejectDialog(swap)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              No swap requests found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Swap Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Swap Request Details</DialogTitle>
        <DialogContent>
          {selectedSwap && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <GridItem xs={12}>
                <Typography variant="h6" gutterBottom>
                  Course: {selectedSwap.course_code} - {selectedSwap.course_name}
                </Typography>
                <Chip
                  label={selectedSwap.status.charAt(0).toUpperCase() + selectedSwap.status.slice(1)}
                  color={STATUS_COLORS[selectedSwap.status]}
                  sx={{ mb: 2 }}
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Requester
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>
                        {selectedSwap.requester_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{selectedSwap.requester_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {selectedSwap.requester_bilkent_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Email: {selectedSwap.requester_email}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Target
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>
                        {selectedSwap.target_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{selectedSwap.target_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {selectedSwap.target_bilkent_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Email: {selectedSwap.target_email}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </GridItem>
              
              <GridItem xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Assignment Details
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedSwap.assignment_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type: {SWAP_TYPES[selectedSwap.assignment_type] || selectedSwap.assignment_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Course: {selectedSwap.course_code} - {selectedSwap.course_name}
                    </Typography>
                    
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="primary">
                        Swap Details
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>From:</strong> {selectedSwap.requester_name} ({selectedSwap.requester_bilkent_id})
                      </Typography>
                      <Typography variant="body2">
                        <strong>To:</strong> {selectedSwap.target_name} ({selectedSwap.target_bilkent_id})
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Original Date/Time</Typography>
                        <Typography variant="body1">
                          {formatDate(selectedSwap.original_date)}
                        </Typography>
                      </GridItem>
                      
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Proposed Date/Time</Typography>
                        <Typography variant="body1">
                          {formatDate(selectedSwap.proposed_date)}
                        </Typography>
                      </GridItem>
                    </Grid>
                    
                    {selectedSwap.status === 'approved' && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="success.contrastText">
                          <strong>Note:</strong> This swap has been approved. The task assignments have been updated in the system.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </GridItem>
              
              <GridItem xs={12}>
                <Typography variant="subtitle2">Reason for Swap</Typography>
                <Typography variant="body1">
                  {selectedSwap.reason || 'No reason provided.'}
                </Typography>
              </GridItem>
              
              <GridItem xs={12}>
                <Divider sx={{ my: 1 }} />
              </GridItem>
              
              {selectedSwap.status !== 'pending' && (
                <>
                  <GridItem xs={12} sm={6}>
                    <Typography variant="subtitle2">Reviewed By</Typography>
                    <Typography variant="body1">
                      {selectedSwap.reviewer_name || 'N/A'}
                    </Typography>
                  </GridItem>
                  
                  <GridItem xs={12} sm={6}>
                    <Typography variant="subtitle2">Review Date</Typography>
                    <Typography variant="body1">
                      {selectedSwap.review_date 
                        ? formatDate(selectedSwap.review_date) 
                        : 'N/A'}
                    </Typography>
                  </GridItem>
                  
                  <GridItem xs={12}>
                    <Typography variant="subtitle2">Review Notes</Typography>
                    <Typography variant="body1">
                      {selectedSwap.review_notes || 'No notes provided.'}
                    </Typography>
                  </GridItem>
                </>
              )}
              
              {selectedSwap.status === 'pending' && (
                <GridItem xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        setOpenDetailDialog(false);
                        handleOpenApproveDialog(selectedSwap);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setOpenDetailDialog(false);
                        handleOpenRejectDialog(selectedSwap);
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                </GridItem>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Swap Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
        <DialogTitle>Approve Swap Request</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to approve this swap request?
          </Typography>
          
          <TextField
            name="review_notes"
            label="Review Notes (Optional)"
            fullWidth
            multiline
            rows={3}
            value={formData.review_notes}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>
          <Button onClick={handleApproveSwap} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Swap Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>Reject Swap Request</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to reject this swap request?
          </Typography>
          
          <TextField
            name="review_notes"
            label="Reason for Rejection (Required)"
            fullWidth
            multiline
            rows={3}
            value={formData.review_notes}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectSwap} 
            color="error" 
            variant="contained"
            disabled={!formData.review_notes.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffSwapsPage;
