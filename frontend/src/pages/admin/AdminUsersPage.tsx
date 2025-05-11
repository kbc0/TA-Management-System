import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
// Import configured API service instead of using axios directly
import api from '../../services/api';

// User interface
interface User {
  id: number;
  bilkent_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const AdminUsersPage: React.FC = () => {
  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for user form
  const [openUserForm, setOpenUserForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    bilkent_id: '',
    role: '',
  });
  
  // State for delete confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Use the configured API service which will automatically include the token
      const response = await api.get('/users');
      
      // Check if the response has a nested structure and ensure it's an array
      let usersData;
      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else {
        console.warn('Unexpected API response format:', response.data);
        usersData = [];
      }
      
      console.log('Users data:', usersData);
      
      setUsers(usersData);
      setFilteredUsers(usersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.bilkent_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, users]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open add user form
  const handleAddUser = () => {
    setFormMode('add');
    setFormData({
      full_name: '',
      email: '',
      password: '',
      bilkent_id: '',
      role: '',
    });
    setOpenUserForm(true);
  };

  // Open edit user form
  const handleEditUser = (user: User) => {
    setFormMode('edit');
    setCurrentUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      bilkent_id: user.bilkent_id,
      role: user.role,
    });
    setOpenUserForm(true);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit user form
  const handleSubmitUserForm = async () => {
    try {
      if (formMode === 'add') {
        const response = await api.post(
          '/users',
          formData
        );
        setNotification({
          open: true,
          message: 'User added successfully',
          severity: 'success',
        });
      } else if (currentUser) {
        // If editing, password is optional
        const updateData = { ...formData } as { [key: string]: any };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        // Update the user
        const response = await api.patch(
          `/users/${currentUser.id}`,
          updateData
        );
        
        setNotification({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      }
      setOpenUserForm(false);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error saving user:', error);
      setNotification({
        open: true,
        message: `Failed to ${formMode === 'add' ? 'create' : 'update'} user. Please try again.`,
        severity: 'error',
      });
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  // Confirm user deletion (deactivation)
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await api.patch(
        `/users/${userToDelete.id}/deactivate`,
        {}
      );
      setNotification({
        open: true,
        message: 'User deactivated successfully',
        severity: 'success',
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error deactivating user:', error);
      setNotification({
        open: true,
        message: 'Failed to deactivate user. Please try again.',
        severity: 'error',
      });
    } finally {
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Show loading spinner while fetching data
  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if fetch failed
  if (error && users.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => fetchUsers()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchUsers()}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bilkent ID</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.bilkent_id}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                          color={
                            user.role === 'admin' 
                              ? 'error' 
                              : user.role === 'staff' 
                                ? 'primary' 
                                : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(user.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditUser(user)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={openUserForm} onClose={() => setOpenUserForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formMode === 'add' ? 'Add New User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label={formMode === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              required={formMode === 'add'}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Bilkent ID"
              name="bilkent_id"
              value={formData.bilkent_id}
              onChange={handleFormChange}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                label="Role"
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="ta">Teaching Assistant</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserForm(false)}>Cancel</Button>
          <Button onClick={handleSubmitUserForm} variant="contained" color="primary">
            {formMode === 'add' ? 'Add User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deactivation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate user "{userToDelete?.full_name}"? This will prevent them from logging in, but their data will be preserved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminUsersPage;
