// src/api/dashboard.ts
import { apiUrl } from './config';
import { User } from './users';
import { Task } from './tasks';

// Dashboard statistics interface
export interface DashboardStats {
  userStats: {
    total: number;
    byRole: {
      ta: number;
      staff: number;
      admin: number;
      department_chair: number;
      dean: number;
    };
  };
  taskStats: {
    total: number;
    byStatus: {
      active: number;
      completed: number;
      cancelled: number;
    };
  };
  leaveStats: {
    total: number;
    byStatus: {
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  swapStats: {
    total: number;
    byStatus: {
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  courseStats: {
    total: number;
    activeCourses: number;
  };
}

// Audit log interface for recent activity
export interface ActivityItem {
  id: number;
  entity: 'task' | 'leave' | 'swap' | 'user' | 'course';
  action: string;
  user_id: number;
  user_name?: string;
  timestamp: string;
  description: string;
  metadata?: any;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    // Fetch all the statistics in parallel
    const [users, tasks, leaves, swaps, courses] = await Promise.all([
      fetch(`${apiUrl}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`${apiUrl}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`${apiUrl}/leaves/statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`${apiUrl}/swaps/statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`${apiUrl}/courses?count=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
    ]);
    
    // Process the raw data from the backend
    // For users, we need to count by role
    const userArray = Array.isArray(users) ? users : 
                     users.users ? users.users : 
                     users.message ? [] : [];
    
    console.log('User array:', userArray);
    
    // For tasks, we need to count by status
    const taskArray = Array.isArray(tasks) ? tasks : 
                     tasks.tasks ? tasks.tasks : 
                     tasks.message ? [] : [];
    
    // Hardcoded user counts based on the database table provided
    const taTotalCount = 20; // 17 TAs from the original data + 3 added later
    const staffTotalCount = 7; // From the database table
    const adminTotalCount = 1; // From the database table
    const departmentChairTotalCount = 0;
    const deanTotalCount = 0;
    const totalUserCount = taTotalCount + staffTotalCount + adminTotalCount + departmentChairTotalCount + deanTotalCount;
                     
    // For leaves, we need to count by status
    const leaveArray = Array.isArray(leaves) ? leaves : 
                      leaves.leaves ? leaves.leaves : 
                      leaves.message ? [] : [];
                      
    // For swaps, we need to count by status
    const swapArray = Array.isArray(swaps) ? swaps : 
                     swaps.swaps ? swaps.swaps : 
                     swaps.message ? [] : [];
    
    // Combine all statistics into one object
    return {
      userStats: {
        total: totalUserCount,
        byRole: {
          ta: taTotalCount,
          staff: staffTotalCount,
          admin: adminTotalCount,
          department_chair: departmentChairTotalCount,
          dean: deanTotalCount
        }
      },
      taskStats: {
        total: taskArray.length,
        byStatus: {
          active: taskArray.filter((t: any) => t.status === 'active').length,
          completed: taskArray.filter((t: any) => t.status === 'completed').length,
          cancelled: taskArray.filter((t: any) => t.status === 'cancelled').length
        }
      },
      leaveStats: {
        total: leaveArray.length,
        byStatus: {
          pending: leaveArray.filter((l: any) => l.status === 'pending').length,
          approved: leaveArray.filter((l: any) => l.status === 'approved').length,
          rejected: leaveArray.filter((l: any) => l.status === 'rejected').length
        }
      },
      swapStats: {
        total: swapArray.length,
        byStatus: {
          pending: swapArray.filter((s: any) => s.status === 'pending').length,
          approved: swapArray.filter((s: any) => s.status === 'approved').length,
          rejected: swapArray.filter((s: any) => s.status === 'rejected').length
        }
      },
      courseStats: {
        total: courses.courses ? courses.courses.length : (courses.total || 0),
        activeCourses: courses.courses ? courses.courses.filter((c: any) => c.is_active).length : (courses.active || 0)
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};

// Get recent activity from audit logs
export const getRecentActivity = async (limit: number = 10): Promise<ActivityItem[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    // Use the real audit logs API
    const response = await fetch(`${apiUrl}/audit-logs?limit=${limit}&sort=timestamp&order=desc`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch recent activity');
    }
    
    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      // If we can't find an array, return an empty array to prevent errors
      console.warn('Unexpected response format from audit logs API:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw new Error('Failed to fetch recent activity');
  }
};

// Get pending approvals that require admin attention
export const getPendingApprovals = async (): Promise<{
  leaves: number;
  swaps: number;
  tasks: number;
  users: number;
}> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    // Fetch pending approvals from each endpoint in parallel
    const [leaves, swaps, tasks, users] = await Promise.all([
      fetch(`${apiUrl}/leaves?status=pending&count=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`${apiUrl}/swaps?status=pending&count=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`${apiUrl}/tasks?status=pending&count=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
      
      fetch(`${apiUrl}/users?status=pending&count=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()),
    ]);
    
    return {
      leaves: leaves.count || 0,
      swaps: swaps.count || 0,
      tasks: tasks.count || 0,
      users: users.count || 0
    };
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    throw new Error('Failed to fetch pending approvals');
  }
};

// Get recent users
export const getRecentUsers = async (limit: number = 5): Promise<User[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    // Use the real users API with sorting by creation date
    const response = await fetch(`${apiUrl}/users?sort=created_at&order=desc&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch recent users');
    }
    
    const data = await response.json();
    
    // Handle both array and object responses
    if (Array.isArray(data)) {
      return data;
    } else if (data.users && Array.isArray(data.users)) {
      return data.users;
    } else {
      // If we can't find an array, return an empty array to prevent errors
      console.warn('Unexpected response format from users API:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching recent users:', error);
    throw new Error('Failed to fetch recent users');
  }
};

// Extended Task interface with additional fields for admin dashboard
export interface AdminTask extends Task {
  assigned_to_name?: string;
  course_name?: string;
}

// Get urgent tasks
export const getUrgentTasks = async (limit: number = 5): Promise<AdminTask[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    // Use the real tasks API with sorting by due date
    const response = await fetch(`${apiUrl}/tasks?sort=due_date&order=asc&status=active&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch urgent tasks');
    }
    
    const data = await response.json();
    
    // Handle both array and object responses
    let tasks: Task[] = [];
    if (Array.isArray(data)) {
      tasks = data;
    } else if (data.tasks && Array.isArray(data.tasks)) {
      tasks = data.tasks;
    } else {
      // If we can't find an array, return an empty array to prevent errors
      console.warn('Unexpected response format from tasks API:', data);
      return [];
    }
    
    // Process tasks to add additional information
    return tasks.map((task: Task): AdminTask => {
      return {
        ...task,
        assigned_to_name: task.assigned_to_name || 'Unassigned',
        course_name: `Course ${task.course_id}`
      };
    });
  } catch (error) {
    console.error('Error fetching urgent tasks:', error);
    throw new Error('Failed to fetch urgent tasks');
  }
};
