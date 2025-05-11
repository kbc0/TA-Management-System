import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import GridItem from '../../components/common/GridItem';
import api from '../../services/api'; // Import configured API service instead of using axios directly

// Using the configured API service

// Settings interface
interface SystemSettings {
  general: {
    systemName: string;
    contactEmail: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: string;
  };
  email: {
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    emailEnabled: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuthEnabled: boolean;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableInAppNotifications: boolean;
    defaultNotificationEvents: string[];
  };
}

// Default settings
const defaultSettings: SystemSettings = {
  general: {
    systemName: 'TA Management System',
    contactEmail: 'admin@example.com',
    maintenanceMode: false,
    allowRegistration: true,
    defaultUserRole: 'ta',
  },
  email: {
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'smtp_user',
    smtpPassword: '',
    fromEmail: 'noreply@example.com',
    emailEnabled: false,
  },
  security: {
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    twoFactorAuthEnabled: false,
  },
  notifications: {
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    defaultNotificationEvents: [
      'application_status_change',
      'task_assigned',
      'evaluation_submitted',
    ],
  },
};

// Available notification events
const notificationEvents = [
  { id: 'application_status_change', name: 'Application Status Change' },
  { id: 'task_assigned', name: 'Task Assigned' },
  { id: 'task_updated', name: 'Task Updated' },
  { id: 'task_completed', name: 'Task Completed' },
  { id: 'evaluation_submitted', name: 'Evaluation Submitted' },
  { id: 'leave_request_status', name: 'Leave Request Status Change' },
  { id: 'swap_request_status', name: 'Swap Request Status Change' },
  { id: 'user_role_change', name: 'User Role Change' },
  { id: 'system_announcement', name: 'System Announcement' },
];

const AdminSettingsPage: React.FC = () => {
  // State for settings
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // State for notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings', {

      });
      setSettings(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings. Please try again later.');
      // Use default settings if fetch fails
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.post('/settings', settings, {

      });
      setNotification({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({
        open: true,
        message: 'Failed to save settings. Please try again.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle general settings change
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [name]: type === 'checkbox' ? checked : value,
      },
    });
  };

  // Handle email settings change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [name]: type === 'checkbox' ? checked : name === 'smtpPort' ? parseInt(value) : value,
      },
    });
  };

  // Handle security settings change
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    if (name.startsWith('passwordPolicy.')) {
      const policyName = name.split('.')[1];
      setSettings({
        ...settings,
        security: {
          ...settings.security,
          passwordPolicy: {
            ...settings.security.passwordPolicy,
            [policyName]: type === 'checkbox' ? checked : parseInt(value),
          },
        },
      });
    } else {
      setSettings({
        ...settings,
        security: {
          ...settings.security,
          [name]: type === 'checkbox' ? checked : parseInt(value),
        },
      });
    }
  };

  // Handle notification settings change
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: checked,
      },
    });
  };

  // Toggle notification event
  const toggleNotificationEvent = (eventId: string) => {
    const currentEvents = settings.notifications.defaultNotificationEvents;
    const updatedEvents = currentEvents.includes(eventId)
      ? currentEvents.filter(id => id !== eventId)
      : [...currentEvents, eventId];
    
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        defaultNotificationEvents: updatedEvents,
      },
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            sx={{ mr: 1 }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="General" />
            <Tab label="Email" />
            <Tab label="Security" />
            <Tab label="Notifications" />
          </Tabs>

          {/* General Settings */}
          {activeTab === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="System Name"
                    name="systemName"
                    value={settings.general.systemName}
                    onChange={handleGeneralChange}
                    margin="normal"
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    name="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={handleGeneralChange}
                    margin="normal"
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Default User Role</InputLabel>
                    <Select
                      name="defaultUserRole"
                      value={settings.general.defaultUserRole}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          general: {
                            ...settings.general,
                            defaultUserRole: e.target.value as string,
                          },
                        });
                      }}
                      label="Default User Role"
                    >
                      <MenuItem value="ta">Teaching Assistant</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.general.allowRegistration}
                          onChange={handleGeneralChange}
                          name="allowRegistration"
                          color="primary"
                        />
                      }
                      label="Allow User Registration"
                    />
                  </Box>
                </GridItem>
                
                <GridItem xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.general.maintenanceMode}
                          onChange={handleGeneralChange}
                          name="maintenanceMode"
                          color="primary"
                        />
                      }
                      label="Maintenance Mode"
                    />
                    <Typography variant="caption" color="textSecondary" display="block">
                      When enabled, only administrators can access the system.
                    </Typography>
                  </Box>
                </GridItem>
              </Grid>
            </Box>
          )}

          {/* Email Settings */}
          {activeTab === 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Email Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <GridItem xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email.emailEnabled}
                        onChange={handleEmailChange}
                        name="emailEnabled"
                        color="primary"
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="SMTP Server"
                    name="smtpServer"
                    value={settings.email.smtpServer}
                    onChange={handleEmailChange}
                    margin="normal"
                    disabled={!settings.email.emailEnabled}
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="SMTP Port"
                    name="smtpPort"
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={handleEmailChange}
                    margin="normal"
                    disabled={!settings.email.emailEnabled}
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="SMTP Username"
                    name="smtpUsername"
                    value={settings.email.smtpUsername}
                    onChange={handleEmailChange}
                    margin="normal"
                    disabled={!settings.email.emailEnabled}
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="SMTP Password"
                    name="smtpPassword"
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={handleEmailChange}
                    margin="normal"
                    disabled={!settings.email.emailEnabled}
                  />
                </GridItem>
                
                <GridItem xs={12}>
                  <TextField
                    fullWidth
                    label="From Email Address"
                    name="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={handleEmailChange}
                    margin="normal"
                    disabled={!settings.email.emailEnabled}
                  />
                </GridItem>
                
                <GridItem xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      disabled={!settings.email.emailEnabled || saving}
                      onClick={async () => {
                        try {
                          setSaving(true);
                          const response = await api.post('/settings/email-test', settings.email, {
                    
                          });
                          setNotification({
                            open: true,
                            message: 'Test email sent successfully',
                            severity: 'success',
                          });
                        } catch (error) {
                          console.error('Error sending test email:', error);
                          setNotification({
                            open: true,
                            message: 'Failed to send test email. Please check your settings.',
                            severity: 'error',
                          });
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      Send Test Email
                    </Button>
                  </Box>
                </GridItem>
              </Grid>
            </Box>
          )}

          {/* Security Settings */}
          {activeTab === 2 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    name="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={handleSecurityChange}
                    margin="normal"
                    inputProps={{ min: 5, max: 1440 }}
                  />
                </GridItem>
                
                <GridItem xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Login Attempts"
                    name="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={handleSecurityChange}
                    margin="normal"
                    inputProps={{ min: 3, max: 10 }}
                  />
                </GridItem>
                
                <GridItem xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Password Policy
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Minimum Password Length"
                    name="passwordPolicy.minLength"
                    type="number"
                    value={settings.security.passwordPolicy.minLength}
                    onChange={handleSecurityChange}
                    margin="normal"
                    inputProps={{ min: 6, max: 30 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordPolicy.requireUppercase}
                        onChange={handleSecurityChange}
                        name="passwordPolicy.requireUppercase"
                        color="primary"
                      />
                    }
                    label="Require Uppercase Letters"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordPolicy.requireLowercase}
                        onChange={handleSecurityChange}
                        name="passwordPolicy.requireLowercase"
                        color="primary"
                      />
                    }
                    label="Require Lowercase Letters"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordPolicy.requireNumbers}
                        onChange={handleSecurityChange}
                        name="passwordPolicy.requireNumbers"
                        color="primary"
                      />
                    }
                    label="Require Numbers"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordPolicy.requireSpecialChars}
                        onChange={handleSecurityChange}
                        name="passwordPolicy.requireSpecialChars"
                        color="primary"
                      />
                    }
                    label="Require Special Characters"
                  />
                </GridItem>
                
                <GridItem xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.twoFactorAuthEnabled}
                          onChange={handleSecurityChange}
                          name="twoFactorAuthEnabled"
                          color="primary"
                        />
                      }
                      label="Enable Two-Factor Authentication"
                    />
                    <Typography variant="caption" color="textSecondary" display="block">
                      When enabled, users can opt-in to use two-factor authentication for their accounts.
                    </Typography>
                  </Box>
                </GridItem>
              </Grid>
            </Box>
          )}

          {/* Notification Settings */}
          {activeTab === 3 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <GridItem xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.enableEmailNotifications}
                        onChange={handleNotificationChange}
                        name="enableEmailNotifications"
                        color="primary"
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </GridItem>
                
                <GridItem xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.enableInAppNotifications}
                        onChange={handleNotificationChange}
                        name="enableInAppNotifications"
                        color="primary"
                      />
                    }
                    label="Enable In-App Notifications"
                  />
                </GridItem>
                
                <GridItem xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Default Notification Events
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                    Select which events should trigger notifications by default. Users can override these settings in their profile.
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ mt: 2 }}>
                    <List>
                      {notificationEvents.map((event) => (
                        <ListItem key={event.id} divider>
                          <ListItemText primary={event.name} />
                          <ListItemSecondaryAction>
                            <Switch
                              edge="end"
                              checked={settings.notifications.defaultNotificationEvents.includes(event.id)}
                              onChange={() => toggleNotificationEvent(event.id)}
                              color="primary"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </GridItem>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

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

export default AdminSettingsPage;
