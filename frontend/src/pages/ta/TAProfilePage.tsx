import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Avatar, 
  Divider, 
  Button, 
  TextField,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface ProfileData {
  id: number;
  bilkent_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

const TAProfilePage: React.FC = () => {
  const { authState } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState<{currentPassword: string, newPassword: string, confirmPassword: string}>({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userId = authState.user?.id;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        const response = await api.get(`/users/${userId}`);
        console.log('Profile data:', response.data.user);
        setProfile(response.data.user);
        setEditedProfile(response.data.user);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (authState.isAuthenticated) {
      fetchProfile();
    }
  }, [authState.isAuthenticated, authState.user?.id]);

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (editMode) {
      // Reset edited profile to original values when canceling
      setEditedProfile(profile || {});
    }
    setEditMode(!editMode);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      
      // Send the updated profile to the backend
      const userId = authState.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await api.patch(`/users/${userId}`, editedProfile);
      
      // Update the profile state with the response data
      setProfile(prev => ({
        ...prev!,
        ...response.data.user
      }));
      
      // Exit edit mode
      setEditMode(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Handle password dialog open
  const handlePasswordDialogOpen = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordDialogOpen(true);
  };
  
  // Handle password dialog close
  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
  };
  
  // Handle password input change
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle change password
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New password and confirmation do not match',
        severity: 'error'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'New password must be at least 6 characters long',
        severity: 'error'
      });
      return;
    }
    
    try {
      setPasswordLoading(true);
      
      const userId = authState.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Send password change request to backend
      await api.patch(`/users/${userId}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Close dialog and show success message
      handlePasswordDialogClose();
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change password',
        severity: 'error'
      });
    } finally {
      setPasswordLoading(false);
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

  // Show error message if there was an error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }} 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={3}>
        <GridItem xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main' 
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                {profile?.full_name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.role?.toUpperCase()}
              </Typography>
              
              <Box sx={{ mt: 2, width: '100%' }}>
                <Button
                  variant={editMode ? "outlined" : "contained"}
                  startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                  onClick={toggleEditMode}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
                
                {editMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    fullWidth
                  >
                    Save Changes
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </GridItem>
        
        <GridItem xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Personal Information" 
              subheader="Your account details"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <GridItem xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Full Name
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        name="full_name"
                        value={editedProfile.full_name || ''}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{profile?.full_name}</Typography>
                    )}
                  </Box>
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Bilkent ID
                    </Typography>
                    <Typography variant="body1">{profile?.bilkent_id}</Typography>
                  </Box>
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        name="email"
                        value={editedProfile.email || ''}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{profile?.email}</Typography>
                    )}
                  </Box>
                </GridItem>
                
                <GridItem xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Account Created
                    </Typography>
                    <Typography variant="body1">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </GridItem>
              </Grid>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader 
              title="Account Settings" 
              subheader="Manage your account preferences"
            />
            <Divider />
            <CardContent>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                onClick={handlePasswordDialogOpen}
              >
                Change Password
              </Button>
              <Button 
                variant="outlined" 
                color="error"
              >
                Notification Settings
              </Button>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter your current password and a new password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="currentPassword"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.currentPassword}
            onChange={handlePasswordInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={handlePasswordInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={handlePasswordInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            color="primary"
            disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TAProfilePage;