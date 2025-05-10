// src/api/leaves.ts
import { apiUrl } from './config';

export interface LeaveRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_id: number | null;
  approver_name?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface LeaveRequestCreateData {
  start_date: string;
  end_date: string;
  reason: string;
}

// Get all leave requests
export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/leaves`, {
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

  return await response.json();
};

// Get leave requests for current user
export const getMyLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/leaves/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch your leave requests');
  }

  return await response.json();
};

// Get pending leave requests (for approvers)
export const getPendingLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/leaves/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch pending leave requests');
  }

  return await response.json();
};

// Create a new leave request
export const createLeaveRequest = async (leaveData: LeaveRequestCreateData): Promise<LeaveRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/leaves`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leaveData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create leave request');
  }

  return await response.json();
};

// Approve a leave request
export const approveLeaveRequest = async (leaveId: number): Promise<LeaveRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/leaves/${leaveId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to approve leave request');
  }

  return await response.json();
};

// Reject a leave request
export const rejectLeaveRequest = async (leaveId: number): Promise<LeaveRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/leaves/${leaveId}/reject`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to reject leave request');
  }

  return await response.json();
};

// Cancel a leave request
export const cancelLeaveRequest = async (leaveId: number): Promise<{ message: string }> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/leaves/${leaveId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel leave request');
  }

  return await response.json();
};
