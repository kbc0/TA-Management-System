import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  TextField,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  bilkentId: string;
  department: string;
  role: string;
  title: string;
  phone: string;
  office: string;
  bio: string;
  profileImage?: string;
  joinDate: string;
}

const StaffProfilePage: React.FC = () => {
  const { authState } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Use the correct endpoint for user profile
        const response = await api.get(`/users/${authState.user?.id}`);
        
        // Ensure we have valid profile data
        if (response.data) {
          // Check if the response has a user property
          const userData = response.data.user || response.data;
          setProfile(userData);
          setFormData({
            phone: userData.phone || '',
            office: userData.office || '',
            bio: userData.bio || '',
          });
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (authState.user?.id) {
      fetchProfile();
    }
  }, [authState.user?.id]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Use the correct endpoint for updating user profile
      await api.patch(`/users/${authState.user?.id}`, formData);
      
      // Update profile with new data
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      
      // Exit edit mode
      setEditMode(false);
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        office: profile.office || '',
        bio: profile.bio || '',
      });
    }
    
    // Exit edit mode
    setEditMode(false);
  };

  // Close success message
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Show loading spinner while fetching data
  if (loading && !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if fetch failed
  if (error && !profile) {
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
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <GridItem xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile?.profileImage}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                {profile?.fullName?.charAt(0) || <PersonIcon />}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profile?.fullName}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile?.title || 'Instructor'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.department}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">{profile?.email}</Typography>
              </Box>
              
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">ID: {profile?.bilkentId}</Typography>
              </Box>
              
              {!editMode && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ mt: 3 }}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </GridItem>

        {/* Profile Details */}
        <GridItem xs={12} md={8}>
          <Card>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <Typography variant="h6" gutterBottom>
                    Edit Profile
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <GridItem xs={12} sm={6}>
                      <TextField
                        name="phone"
                        label="Phone Number"
                        fullWidth
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                      />
                    </GridItem>
                    
                    <GridItem xs={12} sm={6}>
                      <TextField
                        name="office"
                        label="Office Location"
                        fullWidth
                        value={formData.office || ''}
                        onChange={handleInputChange}
                      />
                    </GridItem>
                    
                    <GridItem xs={12}>
                      <TextField
                        name="bio"
                        label="Bio"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself, your research interests, and teaching experience."
                      />
                    </GridItem>
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </form>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Profile Information
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Contact Information
                    </Typography>
                    <Grid container spacing={2}>
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Email</Typography>
                        <Typography variant="body1">{profile?.email}</Typography>
                      </GridItem>
                      
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Phone</Typography>
                        <Typography variant="body1">{profile?.phone || 'Not provided'}</Typography>
                      </GridItem>
                      
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Office</Typography>
                        <Typography variant="body1">{profile?.office || 'Not provided'}</Typography>
                      </GridItem>
                      
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Department</Typography>
                        <Typography variant="body1">{profile?.department}</Typography>
                      </GridItem>
                    </Grid>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Bio
                    </Typography>
                    <Typography variant="body1">
                      {profile?.bio || 'No bio provided.'}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Account Information
                    </Typography>
                    <Grid container spacing={2}>
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Role</Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {profile?.role || 'Instructor'}
                        </Typography>
                      </GridItem>
                      
                      <GridItem xs={12} sm={6}>
                        <Typography variant="subtitle2">Member Since</Typography>
                        <Typography variant="body1">
                          {profile?.joinDate 
                            ? new Date(profile.joinDate).toLocaleDateString() 
                            : 'Not available'}
                        </Typography>
                      </GridItem>
                    </Grid>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </GridItem>
      </Grid>

      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessMessage} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffProfilePage;
