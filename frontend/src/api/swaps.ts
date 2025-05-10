// src/api/swaps.ts
import { apiUrl } from './config';

export interface SwapRequest {
  id: number;
  requester_id: number;
  requester_name?: string;
  target_id: number;
  target_name?: string;
  assignment_id: number;
  assignment_type: 'task' | 'exam';
  assignment_title?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approver_id: number | null;
  approver_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SwapRequestCreateData {
  target_id: number;
  assignment_id: number;
  assignment_type: 'task' | 'exam';
}

// Get all swap requests
export const getAllSwapRequests = async (): Promise<SwapRequest[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch swap requests');
  }

  return await response.json();
};

// Get swap requests for current user
export const getMySwapRequests = async (): Promise<SwapRequest[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch your swap requests');
  }

  return await response.json();
};

// Get pending swap requests for current user to approve
export const getPendingSwapRequests = async (): Promise<SwapRequest[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch pending swap requests');
  }

  return await response.json();
};

// Get eligible swap targets for an assignment
export interface EligibleSwapTarget {
  id: number;
  fullName: string;
  bilkentId?: string;
  email?: string;
}

export const getEligibleSwapTargets = async (
  assignmentId: number, 
  assignmentType: 'task' | 'exam'
): Promise<EligibleSwapTarget[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(
    `${apiUrl}/swaps/eligible?assignmentId=${assignmentId}&assignmentType=${assignmentType}`, 
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch eligible swap targets');
  }

  return await response.json();
};

// Create a new swap request
export const createSwapRequest = async (swapData: SwapRequestCreateData): Promise<SwapRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(swapData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create swap request');
  }

  return await response.json();
};

// Approve a swap request (as the target TA)
export const approveSwapRequest = async (swapId: number): Promise<SwapRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps/${swapId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to approve swap request');
  }

  return await response.json();
};

// Reject a swap request (as the target TA)
export const rejectSwapRequest = async (swapId: number): Promise<SwapRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps/${swapId}/reject`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to reject swap request');
  }

  return await response.json();
};

// Final approval of a swap request (as staff/admin)
export const finalApproveSwapRequest = async (swapId: number): Promise<SwapRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps/${swapId}/final-approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to give final approval for swap request');
  }

  return await response.json();
};

// Cancel a swap request (as the requester)
export const cancelSwapRequest = async (swapId: number): Promise<{ message: string }> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps/${swapId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel swap request');
  }

  return await response.json();
};
