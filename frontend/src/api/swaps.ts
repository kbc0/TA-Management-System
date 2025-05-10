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
    `${apiUrl}/swaps/eligible-targets/${assignmentId}/${assignmentType}`, 
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

  // Transform the response to match our expected format
  const data = await response.json();
  return data.map((user: any) => ({
    id: user.id,
    fullName: user.full_name,
    bilkentId: user.bilkent_id,
    email: user.email
  }));
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

// Get a specific swap request by ID
export const getSwapRequestById = async (swapId: number): Promise<SwapRequest> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/swaps/${swapId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch swap request');
  }

  const swapData = await response.json();
  
  // Transform the data to include the UI-specific fields
  return {
    ...swapData,
    title: `Swap Request #${swapData.id}`,
    yourTask: {
      course: swapData.assignment_type === 'task' ? 
        swapData.course_code || 'Unknown Course' : 
        swapData.exam_course_code || 'Unknown Course',
      task: swapData.assignment_title || 'Unknown Assignment',
      date: new Date(swapData.assignment_type === 'task' ? 
        swapData.due_date : 
        swapData.exam_date).toLocaleDateString(),
      time: swapData.assignment_type === 'task' ? 
        'N/A' : 
        `${swapData.start_time || '00:00'} - ${swapData.end_time || '00:00'}`,
      location: swapData.assignment_type === 'task' ? 
        'N/A' : 
        swapData.room_number || 'Unknown Location'
    },
    proposedTask: {
      course: swapData.target_course_code || 'Unknown Course',
      task: swapData.target_assignment_title || 'Unknown Assignment',
      date: new Date(swapData.target_due_date || swapData.target_exam_date || Date.now()).toLocaleDateString(),
      time: swapData.assignment_type === 'task' ? 
        'N/A' : 
        `${swapData.target_start_time || '00:00'} - ${swapData.target_end_time || '00:00'}`
    },
    reason: swapData.reason || 'No reason provided',
    timeline: {
      sent: new Date(swapData.created_at).toLocaleString(),
      taResponse: swapData.status === 'pending' ? 
        'Pending' : 
        `${swapData.status.charAt(0).toUpperCase() + swapData.status.slice(1)} on ${new Date(swapData.updated_at).toLocaleString()}`,
      instructorApproval: swapData.status === 'approved' && swapData.approver_id ? 
        `Approved by ${swapData.approver_name || 'Staff'} on ${new Date(swapData.approved_at || swapData.updated_at).toLocaleString()}` : 
        'Pending'
    }
  };
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
