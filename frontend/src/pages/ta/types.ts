// src/pages/ta/types.ts
import { SwapRequest as ApiSwapRequest } from '../../api/swaps';

// Extended interface for the UI with additional properties needed by the TASwapRequestPage
export interface UISwapRequest extends ApiSwapRequest {
  title: string;
  yourTask: {
    course: string;
    task: string;
    date: string;
    time: string;
    location: string;
    status: string;
    requester: string;
    with: string;
  };
  proposedTask: {
    ta: string;
    course: string;
    task: string;
    date: string;
    time: string;
  };
  reason: string;
  timeline: {
    sent: string;
    taResponse: string;
    instructorApproval: string;
  };
}

// Helper function to transform API SwapRequest to UISwapRequest
export const transformApiToUiSwapRequest = (apiSwapRequest: ApiSwapRequest): UISwapRequest => {
  // Extract course ID and other details from the API response
  // Note: The backend might provide these fields differently, adjust as needed
  const courseId = typeof apiSwapRequest.assignment_id === 'number' ? 
    apiSwapRequest.assignment_id.toString() : 'Unknown';
  
  return {
    ...apiSwapRequest,
    title: `Swap Request #${apiSwapRequest.id}`,
    yourTask: {
      course: apiSwapRequest.assignment_title?.split(' ')[0] || 'Unknown Course',
      task: apiSwapRequest.assignment_title || 'Unknown Assignment',
      date: new Date(apiSwapRequest.created_at).toLocaleDateString(),
      time: 'N/A',
      location: 'N/A',
      status: apiSwapRequest.status,
      requester: apiSwapRequest.requester_name || 'Unknown',
      with: apiSwapRequest.target_name || 'Unknown'
    },
    proposedTask: {
      ta: apiSwapRequest.target_name || 'Unknown',
      course: apiSwapRequest.assignment_title?.split(' ')[0] || 'Unknown Course',
      task: apiSwapRequest.assignment_title || 'Unknown Assignment',
      date: new Date(apiSwapRequest.created_at).toLocaleDateString(),
      time: 'N/A'
    },
    reason: apiSwapRequest.status === 'pending' ? 'Pending approval' : 
            apiSwapRequest.status === 'approved' ? 'Approved' : 'Rejected',
    timeline: {
      sent: new Date(apiSwapRequest.created_at).toLocaleString(),
      taResponse: apiSwapRequest.status === 'pending' ? 
        'Pending' : 
        `${apiSwapRequest.status.charAt(0).toUpperCase() + apiSwapRequest.status.slice(1)} on ${new Date(apiSwapRequest.updated_at).toLocaleString()}`,
      instructorApproval: apiSwapRequest.status === 'approved' && apiSwapRequest.approver_id ? 
        `Approved by ${apiSwapRequest.approver_name || 'Staff'} on ${new Date(apiSwapRequest.updated_at).toLocaleString()}` : 
        'Pending'
    }
  };
};
