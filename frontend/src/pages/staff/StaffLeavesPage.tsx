import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

// Leave status colors
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

// Leave type labels
const LEAVE_TYPES: Record<string, string> = {
  medical: 'Medical Leave',
  conference: 'Conference/Workshop',
  personal: 'Personal Leave',
  other: 'Other',
};

interface Leave {
  id: string;
  user_id: string;
  requester_name: string;
  requester_email: string;
  requester_bilkent_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id?: string;
  reviewer_name?: string;
  review_date?: string;
  review_notes?: string;
  created_at: string;
}

interface LeaveDetailFormData {
  review_notes: string;
}

const StaffLeavesPage: React.FC = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState<boolean>(false);
  const [openApproveDialog, setOpenApproveDialog] = useState<boolean>(false);
  const [openRejectDialog, setOpenRejectDialog] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<LeaveDetailFormData>({
    review_notes: '',
  });
  
  // Fetch leaves data
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const response = await api.get('/leaves');
        setLeaves(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching leaves:', error);
        setError('Failed to load leave requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  // Filter leaves based on selected tab
  const getFilteredLeaves = () => {
    switch (tabValue) {
      case 0: // All
        return leaves;
      case 1: // Pending
        return leaves.filter(leave => leave.status === 'pending');
      case 2: // Approved
        return leaves.filter(leave => leave.status === 'approved');
      case 3: // Rejected
        return leaves.filter(leave => leave.status === 'rejected');
      default:
        return leaves;
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open leave detail dialog
  const handleViewLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setFormData({
      review_notes: leave.review_notes || '',
    });
    setOpenDetailDialog(true);
  };

  // Open approve dialog
  const handleOpenApproveDialog = (leave: Leave) => {
    setSelectedLeave(leave);
    setFormData({
      review_notes: '',
    });
    setOpenApproveDialog(true);
  };

  // Open reject dialog
  const handleOpenRejectDialog = (leave: Leave) => {
    setSelectedLeave(leave);
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

  // Handle approve leave
  const handleApproveLeave = async () => {
    if (!selectedLeave) return;
    
    try {
      await api.put(`/leaves/${selectedLeave.id}/status`, {
        status: 'approved',
        reviewer_notes: formData.review_notes,
      });
      
      // Refresh leaves list
      const response = await api.get('/leaves');
      setLeaves(response.data);
      
      // Close dialog
      setOpenApproveDialog(false);
      setSelectedLeave(null);
    } catch (error) {
      console.error('Error approving leave:', error);
      setError('Failed to approve leave request. Please try again later.');
    }
  };

  // Handle reject leave
  const handleRejectLeave = async () => {
    if (!selectedLeave) return;
    
    try {
      await api.put(`/leaves/${selectedLeave.id}/status`, {
        status: 'rejected',
        reviewer_notes: formData.review_notes,
      });
      
      // Refresh leaves list
      const response = await api.get('/leaves');
      setLeaves(response.data);
      
      // Close dialog
      setOpenRejectDialog(false);
      setSelectedLeave(null);
    } catch (error) {
      console.error('Error rejecting leave:', error);
      setError('Failed to reject leave request. Please try again later.');
    }
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString()} (1 day)`;
    }
    
    // Calculate days difference
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${diffDays} days)`;
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

  const filteredLeaves = getFilteredLeaves();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Leave Requests
      </Typography>

      {/* Tabs for filtering */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="leave request tabs">
          <Tab label="All" />
          <Tab label={`Pending (${leaves.filter(l => l.status === 'pending').length})`} />
          <Tab label={`Approved (${leaves.filter(l => l.status === 'approved').length})`} />
          <Tab label={`Rejected (${leaves.filter(l => l.status === 'rejected').length})`} />
        </Tabs>
      </Box>

      {/* Leaves list */}
      <Card>
        <CardContent>
          {filteredLeaves.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Requester</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {leave.requester_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{leave.requester_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {leave.requester_bilkent_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {LEAVE_TYPES[leave.leave_type] || leave.leave_type}
                      </TableCell>
                      <TableCell>
                        {formatDateRange(leave.start_date, leave.end_date)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          color={STATUS_COLORS[leave.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewLeave(leave)}>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {leave.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleOpenApproveDialog(leave)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleOpenRejectDialog(leave)}
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
              No leave requests found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Leave Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <GridItem xs={12} sm={6}>
                <Typography variant="subtitle2">Requester</Typography>
                <Typography variant="body1">{selectedLeave.requester_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {selectedLeave.requester_bilkent_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {selectedLeave.requester_email}
                </Typography>
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <Typography variant="subtitle2">Leave Type</Typography>
                <Typography variant="body1">
                  {LEAVE_TYPES[selectedLeave.leave_type] || selectedLeave.leave_type}
                </Typography>
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <Typography variant="subtitle2">Date Range</Typography>
                <Typography variant="body1">
                  {formatDateRange(selectedLeave.start_date, selectedLeave.end_date)}
                </Typography>
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                  color={STATUS_COLORS[selectedLeave.status]}
                />
              </GridItem>
              
              <GridItem xs={12}>
                <Typography variant="subtitle2">Reason</Typography>
                <Typography variant="body1">
                  {selectedLeave.reason || 'No reason provided.'}
                </Typography>
              </GridItem>
              
              <GridItem xs={12}>
                <Divider sx={{ my: 1 }} />
              </GridItem>
              
              {selectedLeave.status !== 'pending' && (
                <>
                  <GridItem xs={12} sm={6}>
                    <Typography variant="subtitle2">Reviewed By</Typography>
                    <Typography variant="body1">
                      {selectedLeave.reviewer_name || 'N/A'}
                    </Typography>
                  </GridItem>
                  
                  <GridItem xs={12} sm={6}>
                    <Typography variant="subtitle2">Review Date</Typography>
                    <Typography variant="body1">
                      {selectedLeave.review_date 
                        ? new Date(selectedLeave.review_date).toLocaleString() 
                        : 'N/A'}
                    </Typography>
                  </GridItem>
                  
                  <GridItem xs={12}>
                    <Typography variant="subtitle2">Review Notes</Typography>
                    <Typography variant="body1">
                      {selectedLeave.review_notes || 'No notes provided.'}
                    </Typography>
                  </GridItem>
                </>
              )}
              
              {selectedLeave.status === 'pending' && (
                <GridItem xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        setOpenDetailDialog(false);
                        handleOpenApproveDialog(selectedLeave);
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
                        handleOpenRejectDialog(selectedLeave);
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

      {/* Approve Leave Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
        <DialogTitle>Approve Leave Request</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to approve this leave request?
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
          <Button onClick={handleApproveLeave} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Leave Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to reject this leave request?
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
            onClick={handleRejectLeave} 
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

export default StaffLeavesPage;
