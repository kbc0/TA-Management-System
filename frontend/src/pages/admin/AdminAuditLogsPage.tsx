import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
  CircularProgress,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import api from '../../services/api';

// Audit Log interface based on API response
interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id: string | null;
  user_id: string;
  description: string;
  metadata: {
    userRole?: string;
    role?: string;
    requiredPermissions?: string[];
    query?: any;
    params?: any;
    responseStatus?: number;
    [key: string]: any;
  };
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const AdminAuditLogsPage: React.FC = () => {
  // State for audit logs data
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State for pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // State for log details
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false);
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch audit logs on component mount
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filter logs when search term changes
  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm]);

  // Function to fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs');
      
      // Handle API response structure
      let logsData: AuditLog[] = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        logsData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        logsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        logsData = response.data;
      }
      
      setLogs(logsData);
      setFilteredLogs(logsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError('Failed to fetch audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to export logs as CSV
  const exportLogs = async () => {
    try {
      setNotification({
        open: true,
        message: 'Exporting audit logs...',
        severity: 'info',
      });

      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get('/audit-logs/export', {
        params,
        responseType: 'blob'
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get current date for filename
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];
      link.setAttribute('download', `audit-logs-${formattedDate}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        open: true,
        message: 'Audit logs exported successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      setNotification({
        open: true,
        message: 'Failed to export audit logs. Please try again.',
        severity: 'error',
      });
    }
  };

  // Function to filter logs based on search term
  const filterLogs = () => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = logs.filter((log) => {
      return (
        log.action.toLowerCase().includes(term) ||
        log.entity.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        log.user_id.toString().toLowerCase().includes(term) ||
        log.ip_address.toLowerCase().includes(term)
      );
    });
    
    setFilteredLogs(filtered);
    setPage(0);
  };

  // Function to view log details
  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setOpenDetailsDialog(true);
  };

  // Function to close the notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Function to truncate long strings
  const truncateString = (str: string, length: number): string => {
    if (!str) return '';
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };

  // Function to get color for action type
  const getActionChipColor = (action: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    if (action.includes('login') || action.includes('auth')) return 'primary';
    if (action.includes('create') || action.includes('add')) return 'success';
    if (action.includes('delete') || action.includes('remove')) return 'error';
    if (action.includes('update') || action.includes('edit')) return 'warning';
    if (action.includes('access') || action.includes('view')) return 'info';
    return 'default';
  };

  // Function to get color for entity type
  const getEntityChipColor = (entity: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (entity) {
      case 'user': return 'primary';
      case 'course': return 'success';
      case 'task': return 'warning';
      case 'audit_log': return 'info';
      default: return 'default';
    }
  };

  // Get page slice of logs
  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Audit Logs
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportLogs}
        >
          Export
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardHeader title="System Activity" />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search logs"
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
            <IconButton 
              color="primary" 
              onClick={fetchAuditLogs}
              title="Refresh logs"
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          {loading && filteredLogs.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Entity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((log) => (
                        <TableRow 
                          key={log.id}
                          sx={{
                            '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                          }}
                        >
                          <TableCell>{log.id}</TableCell>
                          <TableCell>
                            <Chip 
                              label={log.action}
                              size="small"
                              color={getActionChipColor(log.action)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={log.entity}
                              size="small"
                              color={getEntityChipColor(log.entity)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{log.user_id}</TableCell>
                          <TableCell>
                            <Tooltip title={log.description}>
                              <span>{truncateString(log.description, 50)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{log.ip_address}</TableCell>
                          <TableCell>{formatDate(log.created_at)}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => viewLogDetails(log)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
                            {searchTerm ? 'No matching logs found' : 'No audit logs available'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog 
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Log Details {selectedLog && `(ID: ${selectedLog.id})`}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Basic Information</Typography>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Action</Typography>
                    <Typography variant="body1" gutterBottom>
                      <Chip 
                        label={selectedLog.action}
                        size="small"
                        color={getActionChipColor(selectedLog.action)}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Entity</Typography>
                    <Typography variant="body1" gutterBottom>
                      <Chip 
                        label={selectedLog.entity}
                        size="small"
                        color={getEntityChipColor(selectedLog.entity)}
                      />
                      {selectedLog.entity_id && ` (ID: ${selectedLog.entity_id})`}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">User ID</Typography>
                    <Typography variant="body1" gutterBottom>{selectedLog.user_id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Time</Typography>
                    <Typography variant="body1" gutterBottom>{formatDate(selectedLog.created_at)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">IP Address</Typography>
                    <Typography variant="body1" gutterBottom>{selectedLog.ip_address}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">User Agent</Typography>
                    <Typography variant="body1" gutterBottom sx={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      <Tooltip title={selectedLog.user_agent}>
                        <span>{truncateString(selectedLog.user_agent, 40)}</span>
                      </Tooltip>
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">Description</Typography>
                  <Typography variant="body1" gutterBottom>{selectedLog.description}</Typography>
                </Box>
              </Paper>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Metadata</Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.5
                }}>
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
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

export default AdminAuditLogsPage;