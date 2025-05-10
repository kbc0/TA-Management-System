// src/components/leave/LeaveStatisticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import './LeaveStatisticsDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { Pie } from 'react-chartjs-2';
// Import Chart.js in a TypeScript-compatible way
import { Chart, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';

// Register only the required components instead of using spread with registerables
Chart.register(ArcElement, Tooltip, Legend);

interface LeaveStatistics {
  total_requests: number;
  approved: number;
  rejected: number;
  pending: number;
  total_days_taken: number;
}

interface ConflictTask {
  id: number;
  title: string;
  date: string;
  time: string;
  conflictType: "pending" | "approved";
}

const LeaveStatisticsDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<LeaveStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [conflictTasks, setConflictTasks] = useState<ConflictTask[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchLeaveStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('http://localhost:5001/api/leaves/statistics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch leave statistics');
        }

        const data = await response.json();
        if (isMounted) {
          setStatistics(data);
        }
        
        // Also fetch conflicts for admin/staff
        if (user && ['admin', 'department_chair', 'staff'].includes(user.role)) {
          try {
            const conflictsResponse = await fetch('http://localhost:5001/api/leaves/conflicts', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (conflictsResponse.ok) {
              const conflictsData = await conflictsResponse.json();
              if (isMounted) {
                setConflictTasks(conflictsData);
              }
            }
          } catch (conflictErr) {
            console.error('Error fetching conflicts:', conflictErr);
            // Don't fail the whole component if conflicts fetch fails
          }
        }
        
        if (isMounted) {
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching leave statistics:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load leave statistics');
          
          // Fallback data for demonstration purposes only
          setStatistics({
            total_requests: 16,
            approved: 10,
            rejected: 2,
            pending: 4,
            total_days_taken: 42
          });
          
          // Sample conflict tasks for demonstration
          if (user && ['admin', 'department_chair', 'staff'].includes(user.role)) {
            setConflictTasks([
              {
                id: 101,
                title: "CS101 Lab Session",
                date: "March 20, 2025",
                time: "10:00 - 12:00",
                conflictType: "pending",
              },
              {
                id: 201,
                title: "CS319 Midterm",
                date: "April 5, 2025",
                time: "10:00 - 12:00",
                conflictType: "approved",
              }
            ]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLeaveStatistics();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return <div className="loading">Loading leave statistics...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <p>Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  if (!statistics) {
    return <div className="no-data">No leave statistics available.</div>;
  }

  // Calculate percentages for the chart
  const total = statistics.total_requests || 1; // Avoid division by zero
  const approvedPercentage = Math.round((statistics.approved / total) * 100);
  const rejectedPercentage = Math.round((statistics.rejected / total) * 100);
  const pendingPercentage = Math.round((statistics.pending / total) * 100);

  // Prepare chart data with proper typing
  const chartData: ChartData<'pie'> = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [statistics.approved, statistics.pending, statistics.rejected],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderColor: ['#28a745', '#ffc107', '#dc3545'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="container-fluid custom-task-header">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Leave Summary</h5>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="card-title mb-0">Leave Statistics</h6>
                    </div>
                    <div className="card-body">
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <th>Total Requests</th>
                            <td>{statistics.total_requests}</td>
                          </tr>
                          <tr>
                            <th>Approved</th>
                            <td>{statistics.approved}</td>
                          </tr>
                          <tr>
                            <th>Pending</th>
                            <td>{statistics.pending}</td>
                          </tr>
                          <tr>
                            <th>Rejected</th>
                            <td>{statistics.rejected}</td>
                          </tr>
                          <tr>
                            <th>Total Days Taken</th>
                            <td>{statistics.total_days_taken}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="card-title mb-0">Leave Distribution</h6>
                    </div>
                    <div className="card-body">
                      <div className="chart-container">
                        <Pie 
                          data={chartData} 
                          options={chartOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer text-muted">
                <small>Last updated: {new Date().toLocaleDateString()}</small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          {user && (user.role === 'department_chair' || user.role === 'admin' || user.role === 'staff') && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Upcoming Tasks During Leave</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {conflictTasks.length === 0 ? (
                    <div className="list-group-item text-center text-muted">
                      No conflicts found
                    </div>
                  ) : (
                    conflictTasks.map((task) => (
                      <div key={task.id} className="list-group-item">
                        <div className="d-flex w-100 justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{task.title}</h6>
                            <p className="mb-1 text-muted">
                              {task.date} | {task.time}
                            </p>
                          </div>
                          <span className="badge bg-danger">Conflict</span>
                        </div>
                        <small className="text-muted">
                          {task.conflictType === 'pending' 
                            ? 'TAs with pending leave requests' 
                            : 'TAs with approved leave'}
                        </small>
                        <div className="mt-2">
                          <button className="btn btn-sm btn-primary resolve-conflict-btn">
                            Resolve Conflicts
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Types of Leave</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Medical
                  <span className="badge bg-primary rounded-pill">3</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Conference
                  <span className="badge bg-primary rounded-pill">6</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Personal
                  <span className="badge bg-primary rounded-pill">3</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Family
                  <span className="badge bg-primary rounded-pill">4</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveStatisticsDashboard;