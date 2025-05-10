// src/pages/admin/AuditLogsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuditLogsPage.css';

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id: string | null;
  user_id: string | null;
  description: string;
  metadata?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

interface FilterOptions {
  action: string;
  entity: string;
  entity_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
}

interface Pagination {
  page: number;
  limit: number;
}

const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [allLogs, setAllLogs] = useState<AuditLog[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10
  });

  const [filters, setFilters] = useState<FilterOptions>({
    action: '',
    entity: '',
    entity_id: '',
    user_id: '',
    start_date: '',
    end_date: ''
  });
  
  const [tempFilters, setTempFilters] = useState<FilterOptions>({
    action: '',
    entity: '',
    entity_id: '',
    user_id: '',
    start_date: '',
    end_date: ''
  });

  // Fetch logs from the server
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Build query parameters based on filters
      const queryParams = new URLSearchParams();
      
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.entity) queryParams.append('entity', filters.entity);
      if (filters.entity_id) queryParams.append('entity_id', filters.entity_id);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      
      // Fetch all logs without pagination
      queryParams.append('limit', '1000');
      queryParams.append('offset', '0');
      
      console.log('Fetching logs with params:', queryParams.toString());
      
      const response = await axios.get(`http://localhost:5001/api/audit-logs?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const logs = response.data.data;
        setAllLogs(logs);
        setTotalLogs(logs.length);
      } else {
        setError(response.data.message || 'Failed to fetch audit logs');
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  // Fetch logs when component mounts or filters change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Apply client-side pagination
  useEffect(() => {
    if (allLogs.length > 0) {
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      setDisplayedLogs(allLogs.slice(startIndex, endIndex));
    } else {
      setDisplayedLogs([]);
    }
  }, [allLogs, pagination.page, pagination.limit]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempFilters((prev: FilterOptions) => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to first page when applying filters
  };

  const resetFilters = () => {
    const emptyFilters = {
      action: '',
      entity: '',
      entity_id: '',
      user_id: '',
      start_date: '',
      end_date: ''
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes('create')) return 'action-badge-create';
    if (action.includes('update')) return 'action-badge-update';
    if (action.includes('delete')) return 'action-badge-delete';
    if (action.includes('login')) return 'action-badge-login';
    if (action.includes('access')) return 'action-badge-access';
    if (action.includes('approve')) return 'action-badge-approve';
    if (action.includes('reject')) return 'action-badge-reject';
    if (action.includes('system')) return 'action-badge-system';
    if (action.includes('signup')) return 'action-badge-signup';
    if (action.includes('authorization')) return 'action-badge-authorization';
    return 'action-badge-default';
  };

  const getEntityBadgeClass = (entity: string) => {
    switch (entity) {
      case 'user': return 'entity-badge-user';
      case 'task': return 'entity-badge-task';
      case 'course': return 'entity-badge-course';
      case 'leave': return 'entity-badge-leave';
      case 'swap': return 'entity-badge-swap';
      case 'system': return 'entity-badge-system';
      case 'audit': return 'entity-badge-audit';
      default: return 'entity-badge-default';
    }
  };
  
  // Get available actions and entities for filter dropdowns
  const availableActions = [
    { value: '', label: 'All Actions' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'signup', label: 'Signup' },
    { value: 'system_startup', label: 'System Startup' },
    { value: 'create_user', label: 'Create User' },
    { value: 'update_user', label: 'Update User' },
    { value: 'delete_user', label: 'Delete User' },
    { value: 'create_task', label: 'Create Task' },
    { value: 'update_task', label: 'Update Task' },
    { value: 'delete_task', label: 'Delete Task' },
    { value: 'complete_task', label: 'Complete Task' },
  ];
  
  const availableEntities = [
    { value: '', label: 'All Entities' },
    { value: 'user', label: 'User' },
    { value: 'task', label: 'Task' },
    { value: 'course', label: 'Course' },
    { value: 'system', label: 'System' },
    { value: 'leave', label: 'Leave' },
    { value: 'swap', label: 'Swap' },
  ];

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <h1>System Audit Logs</h1>
        <button 
          className="toggle-filters-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="audit-logs-filters">
          <h2>Filter Logs</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="action">Action</label>
              <select
                id="action"
                name="action"
                value={tempFilters.action}
                onChange={handleFilterChange}
              >
                {availableActions.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="entity">Entity</label>
              <select
                id="entity"
                name="entity"
                value={tempFilters.entity}
                onChange={handleFilterChange}
              >
                {availableEntities.map(entity => (
                  <option key={entity.value} value={entity.value}>{entity.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="entity_id">Entity ID</label>
              <input 
                type="text" 
                id="entity_id" 
                name="entity_id" 
                value={tempFilters.entity_id}
                onChange={handleFilterChange}
                placeholder="Entity ID"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="user_id">User ID</label>
              <input 
                type="text" 
                id="user_id" 
                name="user_id" 
                value={tempFilters.user_id}
                onChange={handleFilterChange}
                placeholder="User ID"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="start_date">Start Date</label>
              <input 
                type="date" 
                id="start_date" 
                name="start_date" 
                value={tempFilters.start_date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="end_date">End Date</label>
              <input 
                type="date" 
                id="end_date" 
                name="end_date" 
                value={tempFilters.end_date}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button 
              className="reset-filters-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
            <button 
              className="apply-filters-btn"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading audit logs...</span>
        </div>
      ) : (
        <>
          {displayedLogs.length === 0 ? (
            <div className="no-logs-message">
              <i className="fas fa-info-circle"></i>
              <span>No audit logs found matching the current filters.</span>
            </div>
          ) : (
            <div className="audit-logs-table">
              <div className="audit-logs-table-header">
                <div className="log-timestamp">Timestamp</div>
                <div className="log-action">Action</div>
                <div className="log-entity">Entity</div>
                <div className="log-entity-id">Entity ID</div>
                <div className="log-user">User</div>
                <div className="log-description">Description</div>
                <div className="log-ip">IP Address</div>
              </div>
              <div className="audit-logs-table-body">
                {displayedLogs.map(log => (
                  <div key={log.id} className="audit-log-row">
                    <div className="log-timestamp">{formatDate(log.created_at)}</div>
                    <div className="log-action">
                      <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="log-entity">
                      <span className={`entity-badge ${getEntityBadgeClass(log.entity)}`}>
                        {log.entity.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="log-entity-id">{log.entity_id || 'N/A'}</div>
                    <div className="log-user">{log.user_id || 'System'}</div>
                    <div className="log-description">{log.description}</div>
                    <div className="log-ip">{log.ip_address || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayedLogs.length > 0 && (
            <div className="audit-logs-pagination">
              <div className="pagination-info">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, totalLogs)} of {totalLogs} logs
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(1)}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button 
                  className="pagination-btn"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                
                <span className="pagination-current">Page {pagination.page} of {Math.ceil(totalLogs / pagination.limit)}</span>
                
                <button 
                  className="pagination-btn"
                  disabled={pagination.page === Math.ceil(totalLogs / pagination.limit)}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button 
                  className="pagination-btn"
                  disabled={pagination.page === Math.ceil(totalLogs / pagination.limit)}
                  onClick={() => handlePageChange(Math.ceil(totalLogs / pagination.limit))}
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
                
                <div className="pagination-limit">
                  <label htmlFor="limit">Rows per page:</label>
                  <select 
                    id="limit" 
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination({ page: 1, limit: Number(e.target.value) });
                    }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogsPage;
