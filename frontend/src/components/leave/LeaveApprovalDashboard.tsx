// src/components/leave/LeaveApprovalDashboard.tsx
import React, { useState, useEffect } from 'react';
import './LeaveApprovalDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LeaveRequest {
  id: number;
  user_id: number;
  requester_name: string;
  requester_bilkent_id: string;
  requester_email: string;
  leave_type: 'conference' | 'medical' | 'family_emergency' | 'personal' | 'other';
  start_date: string;
  end_date: string;
  duration: number;
  reason: string;
  supporting_document_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id: number | null;
  reviewer_name: string | null;
  reviewer_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const LeaveApprovalDashboard: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('http://localhost:5001/api/leaves', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch leave requests');
        }

        const data = await response.json();
        if (isMounted) {
          setLeaveRequests(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching leave requests:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load leave requests');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLeaveRequests();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReviewClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setReviewNotes('');
    setIsReviewing(true);
  };

  const handleReviewSubmit = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`http://localhost:5001/api/leaves/${selectedRequest.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reviewer_notes: reviewNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update leave request status');
      }

      const updatedLeave = await response.json();
      
      // Update the leave requests list
      setLeaveRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequest.id ? updatedLeave.leave : req
        )
      );
      
      // Reset review state
      setIsReviewing(false);
      setSelectedRequest(null);
      setReviewNotes('');
      
    } catch (err: any) {
      console.error('Error updating leave request status:', err);
      setError(err.message || 'Failed to update leave request status');
    }
  };

  const handleCancelReview = () => {
    setIsReviewing(false);
    setSelectedRequest(null);
    setReviewNotes('');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getLeaveTypeDisplay = (type: string) => {
    switch (type) {
      case 'conference': return 'Conference';
      case 'medical': return 'Medical';
      case 'family_emergency': return 'Family Emergency';
      case 'personal': return 'Personal';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const filteredRequests = activeFilter === 'all' 
    ? leaveRequests 
    : leaveRequests.filter(req => req.status === activeFilter);

  if (loading) {
    return <div className="loading">Loading leave requests...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user || !['admin', 'department_chair', 'staff'].includes(user.role)) {
    return (
      <div className="permission-error">
        You do not have permission to approve leave requests.
      </div>
    );
  }

  return (
    <div className="approval-dashboard">
      <div className="dashboard-header">
        <h2>Leave Approval Dashboard</h2>
        <div className="filter-buttons">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              className={`filter-btn ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && (
                <span className="pending-count">
                  {leaveRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="request-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            No {activeFilter === 'all' ? '' : activeFilter} leave requests found.
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Leave Type</th>
                <th>Date Range</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.id} className={request.status === 'pending' ? 'pending-row' : ''}>
                  <td>
                    <div className="requester-info">
                      <span className="requester-name">{request.requester_name}</span>
                      <span className="requester-id">{request.requester_bilkent_id}</span>
                    </div>
                  </td>
                  <td>{getLeaveTypeDisplay(request.leave_type)}</td>
                  <td>
                    <div className="date-range">
                      <div>{formatDate(request.start_date)}</div>
                      <div>to</div>
                      <div>{formatDate(request.end_date)}</div>
                    </div>
                  </td>
                  <td>{request.duration} days</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatDate(request.created_at)}</td>
                  <td>
                    {request.status === 'pending' ? (
                      <button 
                        className="review-button"
                        onClick={() => handleReviewClick(request)}
                      >
                        Review
                      </button>
                    ) : (
                      <button 
                        className="view-details-button"
                        onClick={() => handleReviewClick(request)}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Review Modal */}
      {isReviewing && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Leave Request Review</h3>
              <button 
                className="close-button"
                onClick={handleCancelReview}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="review-section">
                <div className="requester-details">
                  <h4>Requester Details</h4>
                  <p><strong>Name:</strong> {selectedRequest.requester_name}</p>
                  <p><strong>ID:</strong> {selectedRequest.requester_bilkent_id}</p>
                  <p><strong>Email:</strong> {selectedRequest.requester_email}</p>
                </div>
                <div className="leave-details">
                  <h4>Leave Details</h4>
                  <p><strong>Type:</strong> {getLeaveTypeDisplay(selectedRequest.leave_type)}</p>
                  <p><strong>Duration:</strong> {selectedRequest.duration} days</p>
                  <p>
                    <strong>Period:</strong> {formatDate(selectedRequest.start_date)} to {formatDate(selectedRequest.end_date)}
                  </p>
                </div>
              </div>
              
              <div className="reason-section">
                <h4>Reason for Leave</h4>
                <p>{selectedRequest.reason}</p>
              </div>
              
              {selectedRequest.supporting_document_url && (
                <div className="document-section">
                  <h4>Supporting Document</h4>
                  <a 
                    href={selectedRequest.supporting_document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="document-link"
                  >
                    View Document
                  </a>
                </div>
              )}
              
              {selectedRequest.status !== 'pending' && (
                <div className="review-info">
                  <div><strong>Status:</strong> {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}</div>
                  {selectedRequest.reviewer_name && (
                    <div><strong>Reviewed By:</strong> {selectedRequest.reviewer_name}</div>
                  )}
                  {selectedRequest.reviewed_at && (
                    <div><strong>Reviewed On:</strong> {formatDate(selectedRequest.reviewed_at)}</div>
                  )}
                  {selectedRequest.reviewer_notes && (
                    <div><strong>Notes:</strong> {selectedRequest.reviewer_notes}</div>
                  )}
                </div>
              )}
              
              {selectedRequest.status === 'pending' && (
                <div className="notes-section">
                  <label>Review Notes (optional):</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter any notes about this leave request..."
                  ></textarea>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {selectedRequest.status === 'pending' ? (
                <>
                  <button 
                    className="reject-button" 
                    onClick={() => handleReviewSubmit('rejected')}
                  >
                    Reject
                  </button>
                  <button 
                    className="approve-button" 
                    onClick={() => handleReviewSubmit('approved')}
                  >
                    Approve
                  </button>
                  <button 
                    className="cancel-button" 
                    onClick={handleCancelReview}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="close-button" 
                  onClick={handleCancelReview}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalDashboard;