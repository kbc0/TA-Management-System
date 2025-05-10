// src/components/reports/UserReportDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import './UserReportDashboard.css';
import { useAuth } from '../../context/AuthContext';

interface TaskBreakdown {
  grading: number;
  office_hours: number;
  proctoring: number;
  lab_session: number;
  other: number;
}

interface UserWorkload {
  user_id: number;
  full_name: string;
  bilkent_id: string;
  department: string;
  total_hours: number;
  task_breakdown: TaskBreakdown;
  courses: string[];
}

const UserReportDashboard: React.FC = () => {
  const [workloadData, setWorkloadData] = useState<UserWorkload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchWorkloadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('http://localhost:5001/api/reports/ta-workload', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch workload data');
        }

        const data = await response.json();
        if (isMounted) {
          setWorkloadData(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching workload data:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load workload data');
          
          // Simulating API call with mock data for demonstration
          const mockData: UserWorkload[] = [
            {
              user_id: 1,
              full_name: 'Ayşe Yıldan Çetin',
              bilkent_id: '21803134',
              department: 'Computer Science',
              total_hours: 15,
              task_breakdown: {
                grading: 5,
                office_hours: 3,
                proctoring: 4,
                lab_session: 3,
                other: 0
              },
              courses: ['CS315', 'CS319']
            },
            {
              user_id: 2,
              full_name: 'Mehmet Yılmaz',
              bilkent_id: '21901234',
              department: 'Computer Science',
              total_hours: 8,
              task_breakdown: {
                grading: 2,
                office_hours: 3,
                proctoring: 0,
                lab_session: 3,
                other: 0
              },
              courses: ['CS101', 'CS102']
            },
            {
              user_id: 3,
              full_name: 'Zeynep Kaya',
              bilkent_id: '21805678',
              department: 'Electrical Engineering',
              total_hours: 12,
              task_breakdown: {
                grading: 6,
                office_hours: 2,
                proctoring: 2,
                lab_session: 2,
                other: 0
              },
              courses: ['EEE213', 'EEE312']
            },
            {
              user_id: 4,
              full_name: 'Ahmet Demir',
              bilkent_id: '21704321',
              department: 'Computer Science',
              total_hours: 20,
              task_breakdown: {
                grading: 10,
                office_hours: 4,
                proctoring: 4,
                lab_session: 2,
                other: 0
              },
              courses: ['CS319', 'CS315', 'CS101']
            },
            {
              user_id: 5,
              full_name: 'Elif Şahin',
              bilkent_id: '21908765',
              department: 'Electrical Engineering',
              total_hours: 14,
              task_breakdown: {
                grading: 7,
                office_hours: 3,
                proctoring: 2,
                lab_session: 2,
                other: 0
              },
              courses: ['EEE102', 'CS101']
            }
          ];
          
          setWorkloadData(mockData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWorkloadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate percentage for progress bar in a safe way
  const calculatePercentage = (value: number, total: number) => {
    if (total <= 0) return 0;
    return (value / total) * 100;
  };

  // Filter and sort data - memoized to avoid recalculation on every render
  const filteredAndSortedData = useMemo(() => {
    return workloadData
      .filter(item => 
        (item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bilkent_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterDepartment === '' || item.department === filterDepartment)
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortDirection === 'asc' 
            ? a.full_name.localeCompare(b.full_name)
            : b.full_name.localeCompare(a.full_name);
        } else if (sortBy === 'hours') {
          return sortDirection === 'asc'
            ? a.total_hours - b.total_hours
            : b.total_hours - a.total_hours;
        } else if (sortBy === 'department') {
          return sortDirection === 'asc'
            ? a.department.localeCompare(b.department)
            : b.department.localeCompare(a.department);
        }
        return 0;
      });
  }, [workloadData, searchTerm, filterDepartment, sortBy, sortDirection]);

  // Get unique departments for filter - without using spread on Set
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    workloadData.forEach(item => {
      deptSet.add(item.department);
    });
    return Array.from(deptSet);
  }, [workloadData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTAs = filteredAndSortedData.length;
    const totalHours = filteredAndSortedData.reduce((sum, item) => sum + item.total_hours, 0);
    const averageHours = totalTAs > 0 ? Math.round(totalHours / totalTAs) : 0;
    
    let maxHours = 0;
    let minHours = totalTAs > 0 ? filteredAndSortedData[0].total_hours : 0;
    
    filteredAndSortedData.forEach(item => {
      if (item.total_hours > maxHours) {
        maxHours = item.total_hours;
      }
      if (item.total_hours < minHours) {
        minHours = item.total_hours;
      }
    });
    
    return { totalTAs, averageHours, maxHours, minHours };
  }, [filteredAndSortedData]);

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Export functionality (placeholder)
  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  if (loading) {
    return <div className="loading">Loading workload reports...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="workload-report">
      <div className="report-header">
        <h2>TA Workload Reports</h2>
        <div className="report-actions">
          <button className="action-button export-button" onClick={handleExport}>
            Export
          </button>
          <button className="action-button print-button" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
      
      <div className="stats-summary">
        <div className="stat-card">
          <h3 className="stat-value">{summaryStats.totalTAs}</h3>
          <p className="stat-label">Total TAs</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-value">{summaryStats.averageHours}</h3>
          <p className="stat-label">Avg. Hours</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-value">{summaryStats.maxHours}</h3>
          <p className="stat-label">Max Hours</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-value">{summaryStats.minHours}</h3>
          <p className="stat-label">Min Hours</p>
        </div>
      </div>
      
      <div className="filter-area">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="department-select"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      
      <div className="workload-table">
        <table>
          <thead>
            <tr>
              <th 
                className="sortable"
                onClick={() => handleSortChange('name')}
              >
                TA Name
                {sortBy === 'name' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Bilkent ID</th>
              <th 
                className="sortable"
                onClick={() => handleSortChange('department')}
              >
                Department
                {sortBy === 'department' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSortChange('hours')}
              >
                Total Hours
                {sortBy === 'hours' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Courses</th>
              <th>Task Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">No data found matching your criteria.</td>
              </tr>
            ) : (
              filteredAndSortedData.map(ta => (
                <tr key={ta.user_id}>
                  <td>{ta.full_name}</td>
                  <td>{ta.bilkent_id}</td>
                  <td>{ta.department}</td>
                  <td className="hours-cell">{ta.total_hours} hours</td>
                  <td>{ta.courses.join(', ')}</td>
                  <td>
                    <div className="progress-container">
                      {Object.entries(ta.task_breakdown).map(([key, value]) => {
                        if (value <= 0) return null;
                        
                        const taskType = key as keyof TaskBreakdown;
                        const percentage = calculatePercentage(value, ta.total_hours);
                        
                        return (
                          <div 
                            key={key}
                            className={`progress-segment ${taskType}`} 
                            style={{ width: `${percentage}%` }}
                            title={`${key.replace('_', ' ')}: ${value} hours`}
                          ></div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color grading"></div>
          <span>Grading</span>
        </div>
        <div className="legend-item">
          <div className="legend-color office_hours"></div>
          <span>Office Hours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color proctoring"></div>
          <span>Proctoring</span>
        </div>
        <div className="legend-item">
          <div className="legend-color lab_session"></div>
          <span>Lab Sessions</span>
        </div>
        <div className="legend-item">
          <div className="legend-color other"></div>
          <span>Other</span>
        </div>
      </div>
    </div>
  );
};

export default UserReportDashboard;