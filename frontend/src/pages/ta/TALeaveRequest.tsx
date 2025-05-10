// src/pages/ta/TALeaveRequest.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TALeaveRequest.css";
import { Chart, registerables } from "chart.js";
import { LeaveRequest as LeaveRequestType, getMyLeaveRequests, createLeaveRequest, cancelLeaveRequest } from "../../api/leaves";
import { handleApiError } from "../../api/apiUtils";
import { useAuth } from "../../context/AuthContext";
Chart.register(...registerables);

// Interface for frontend display of leave requests
interface LeaveRequestDisplay {
  id: number;
  reason: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: "pending" | "approved" | "rejected";
  type: "medical" | "conference" | "personal" | "family" | "other";
  submittedDate: string;
  details?: string;
  documents?: string[];
  conflicts?: ConflictTask[];
}

interface ConflictTask {
  id: number;
  title: string;
  date: string;
  time: string;
  conflictType: "pending" | "approved";
}

const TALeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [conflictTasks, setConflictTasks] = useState<ConflictTask[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestDisplay | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState("leave-requests");
  const [leaveFilter, setLeaveFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [showNewConfirmModal, setShowNewConfirmModal] = useState(false);
  const navigate = useNavigate(); 

  // New Leave Request formu için
  interface NewLeaveForm {
    reason: string;
    type: LeaveRequestDisplay["type"] | "";
    startDate: string;
    endDate: string;
    details: string;
  }

  const [newLeave, setNewLeave] = useState<NewLeaveForm>({
    reason: "",
    type: "",
    startDate: "",
    endDate: "",
    details: "",
  });

  // Fetch leave requests from the API
  useEffect(() => {
    // Apply some UI fixes
    document.querySelector(".navbar-collapse")?.classList.remove("show");
    document.body.style.paddingTop = "0";
    document.body.style.margin = "0";
    document.documentElement.scrollTop = 0;
    
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const leaveData = await getMyLeaveRequests();
        
        // Transform the API data to match our display format
        const transformedData: LeaveRequestDisplay[] = leaveData.map(leave => {
          // Calculate duration in days
          const startDate = new Date(leave.start_date);
          const endDate = new Date(leave.end_date);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
          
          // Determine leave type based on reason (simplified)
          let leaveType: LeaveRequestDisplay["type"] = "other";
          if (leave.reason.toLowerCase().includes("medical")) {
            leaveType = "medical";
          } else if (leave.reason.toLowerCase().includes("conference")) {
            leaveType = "conference";
          } else if (leave.reason.toLowerCase().includes("family")) {
            leaveType = "family";
          } else if (leave.reason.toLowerCase().includes("personal")) {
            leaveType = "personal";
          }
          
          return {
            id: leave.id,
            reason: leave.reason,
            startDate: formatDateForDisplay(leave.start_date),
            endDate: formatDateForDisplay(leave.end_date),
            duration: diffDays,
            status: leave.status as "pending" | "approved" | "rejected",
            type: leaveType,
            submittedDate: formatDateForDisplay(leave.created_at),
            details: leave.reason, 
            conflicts: [] 
          };
        });
        
        setLeaveRequests(transformedData);
        setError(null);
        
        // For now, we'll use empty conflict tasks
        // In a real implementation, you would fetch conflicts from the backend
        setConflictTasks([]);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError(handleApiError(err, "Failed to load leave requests"));
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, []);

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle delete/cancel leave request
  const handleDelete = async (id: number) => {
    try {
      await cancelLeaveRequest(id);
      setLeaveRequests((prev) => prev.filter((request) => request.id !== id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error canceling leave request:", err);
      setError(handleApiError(err, "Failed to cancel leave request"));
    }
  };


  // Generate chart data based on actual leave requests
  const chartData = {
    labels: ["Medical", "Conference", "Personal", "Family", "Other"],
    datasets: [
      {
        data: [
          leaveRequests.filter(r => r.type === "medical").length,
          leaveRequests.filter(r => r.type === "conference").length,
          leaveRequests.filter(r => r.type === "personal").length,
          leaveRequests.filter(r => r.type === "family").length,
          leaveRequests.filter(r => r.type === "other").length
        ],
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6c757d"],
      },
    ],
  };

  return (
    <div className="container-fluid p-0 role-ta">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#" style={{ gap: "20px" }}>
            <img
              src="/bilkent-logo.jpg"
              alt="Bilkent University"
              height="30"
              className="me-3"
            />
            TA Management System
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeMenu === "home" ? "active" : ""
                  }`}
                  href="#"
                  onClick={() => {
                    navigate("/ta-home");
                  }}
                >
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeMenu === "profile" ? "active" : ""
                  }`}
                  href="#"
                  onClick={() => {
                    navigate("/ta-profile");
                  }}
                >
                  My Profile
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeMenu === "tasks" ? "active" : ""
                  }`}
                  href="#"
                  onClick={() => {
                    navigate("/ta-my-tasks");
                  }}
                >
                  My Tasks
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeMenu === "leave-requests" ? "active" : ""
                  }`}
                  href="#"
                  onClick={() => {
                    navigate("/ta-leave-request");
                  }}
                >
                  Leave Requests
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeMenu === "swap-requests" ? "active" : ""
                  }`}
                  href="#"
                  onClick={() => {
                    navigate("/ta-swap-request");
                  }}
                >
                  Swap Requests
                </a>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
                {/*
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-bell"></i>
                  <span className="badge bg-danger notification-badge">3</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <h6 className="dropdown-header">Notifications</h6>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      New task assigned
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Leave request approved
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item text-center" href="#">
                      View All
                    </a>
                  </li>
                </ul>*/}
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-user-circle"></i> {user?.fullName || 'User'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {/* <li>
                    <hr className="dropdown-divider" />
                  </li>*/}
                  <li>
                    <span
                      className="dropdown-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/back-to-login")}
                    >
                      Logout
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid custom-task-header">
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">My Leave Requests</h5>
                <div className="btn-group">
                  {(["all", "pending", "approved", "rejected"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        className={`btn btn-sm btn-outline-secondary ${
                          leaveFilter === status ? "active" : ""
                        }`}
                        onClick={() => setLeaveFilter(status)}
                      >
                        {status === "all"
                          ? "All"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Reason</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests
                      .filter((r) =>
                        leaveFilter === "all" ? true : r.status === leaveFilter
                      )
                      .map((request) => (
                        <tr key={request.id}>
                          <td>{request.reason}</td>
                          <td>{request.startDate}</td>
                          <td>{request.endDate}</td>
                          <td>{request.duration} days</td>
                          <td>
                            <span
                              className={`badge bg-${request.status === "approved" ? "success" : request.status === "pending" ? "warning" : "danger"}`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <i className="fas fa-eye"></i>
                            </button>
                            {request.status === "pending" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="card-footer text-end">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewRequestModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  New Leave Request
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <div className="card">
                <div className="card-header pt-md-3 pt-2 pb-md-2 pb-1">
  <h5 className="card-title mb-md-2 mb-1">Leave Statistics</h5>
</div>
                  <div className="card-body">
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th>Total Requests</th>
                          <td>{leaveRequests.length}</td>
                        </tr>
                        <tr>
                          <th>Approved</th>
                          <td>
                            {
                              leaveRequests.filter(
                                (r) => r.status === "approved"
                              ).length
                            }
                          </td>
                        </tr>
                        <tr>
                          <th>Pending</th>
                          <td>
                            {
                              leaveRequests.filter(
                                (r) => r.status === "pending"
                              ).length
                            }
                          </td>
                        </tr>
                        <tr>
                          <th>Rejected</th>
                          <td>
                            {
                              leaveRequests.filter(
                                (r) => r.status === "rejected"
                              ).length
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <h5 className="card-title mb-4">Leave Distribution</h5>
                <div className="chart-container">
                  <Pie
                    data={chartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Upcoming Tasks During Leave</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {conflictTasks.map((task) => (
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
                        Conflicts with {task.conflictType} leave request
                      </small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer text-center">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>You are going to delete this leave request. Are you sure?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    selectedRequest && handleDelete(selectedRequest.id)
                  }
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showNewConfirmModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body">
                <p>Are you sure you want to create this leave request?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNewConfirmModal(false);
                    setShowNewRequestModal(true);
                  }}
                >
                  No
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      // Create the leave request using the API
                      await createLeaveRequest({
                        start_date: newLeave.startDate,
                        end_date: newLeave.endDate,
                        reason: `${newLeave.type}: ${newLeave.reason}\n\nDetails: ${newLeave.details}`
                      });
                      
                      // Refresh the leave requests from the API
                      const leaveData = await getMyLeaveRequests();
                      
                      // Transform the API data to match our display format
                      const transformedData: LeaveRequestDisplay[] = leaveData.map(leave => {
                        // Calculate duration in days
                        const startDate = new Date(leave.start_date);
                        const endDate = new Date(leave.end_date);
                        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        
                        // Determine leave type based on reason
                        let leaveType: LeaveRequestDisplay["type"] = "other";
                        if (leave.reason.toLowerCase().includes("medical")) {
                          leaveType = "medical";
                        } else if (leave.reason.toLowerCase().includes("conference")) {
                          leaveType = "conference";
                        } else if (leave.reason.toLowerCase().includes("family")) {
                          leaveType = "family";
                        } else if (leave.reason.toLowerCase().includes("personal")) {
                          leaveType = "personal";
                        }
                        
                        return {
                          id: leave.id,
                          reason: leave.reason,
                          startDate: formatDateForDisplay(leave.start_date),
                          endDate: formatDateForDisplay(leave.end_date),
                          duration: diffDays,
                          status: leave.status as "pending" | "approved" | "rejected",
                          type: leaveType,
                          submittedDate: formatDateForDisplay(leave.created_at),
                          details: leave.reason,
                          conflicts: []
                        };
                      });
                      
                      setLeaveRequests(transformedData);
                      
                      // Close modals and reset form
                      setShowNewConfirmModal(false);
                      setNewLeave({
                        reason: "",
                        type: "",
                        startDate: "",
                        endDate: "",
                        details: "",
                      });
                    } catch (err) {
                      console.error("Error creating leave request:", err);
                      setError(handleApiError(err, "Failed to create leave request"));
                      setShowNewConfirmModal(false);
                    }
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Leave Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowNewRequestModal(false)}
                />
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newLeave.reason}
                      onChange={(e) =>
                        setNewLeave({ ...newLeave, reason: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={newLeave.type}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNewLeave({
                          ...newLeave,
                          type: e.target.value as NewLeaveForm["type"],
                        })
                      }
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="medical">Medical</option>
                      <option value="conference">Conference</option>
                      <option value="personal">Personal</option>
                      <option value="family">Family</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newLeave.startDate}
                        onChange={(e) =>
                          setNewLeave({
                            ...newLeave,
                            startDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newLeave.endDate}
                        onChange={(e) =>
                          setNewLeave({ ...newLeave, endDate: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Details</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newLeave.details}
                      onChange={(e) =>
                        setNewLeave({ ...newLeave, details: e.target.value })
                      }
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowNewRequestModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    // Simple validation: are all fields filled?
                    const { reason, type, startDate, endDate } = newLeave;
                    if (!reason || !type || !startDate || !endDate) {
                      alert("Please fill in all required fields.");
                      return;
                    }
                    
                    try {
                      // Create the leave request
                      await createLeaveRequest({
                        start_date: startDate,
                        end_date: endDate,
                        reason: `${type}: ${reason}\n\nDetails: ${newLeave.details}` // Combine type and reason
                      });
                      
                      // Refresh the leave requests
                      const leaveData = await getMyLeaveRequests();
                      
                      // Transform the API data to match our display format
                      const transformedData: LeaveRequestDisplay[] = leaveData.map(leave => {
                        // Calculate duration in days
                        const startDate = new Date(leave.start_date);
                        const endDate = new Date(leave.end_date);
                        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        
                        // Determine leave type based on reason (simplified)
                        let leaveType: LeaveRequestDisplay["type"] = "other";
                        if (leave.reason.toLowerCase().includes("medical")) {
                          leaveType = "medical";
                        } else if (leave.reason.toLowerCase().includes("conference")) {
                          leaveType = "conference";
                        } else if (leave.reason.toLowerCase().includes("family")) {
                          leaveType = "family";
                        } else if (leave.reason.toLowerCase().includes("personal")) {
                          leaveType = "personal";
                        }
                        
                        return {
                          id: leave.id,
                          reason: leave.reason,
                          startDate: formatDateForDisplay(leave.start_date),
                          endDate: formatDateForDisplay(leave.end_date),
                          duration: diffDays,
                          status: leave.status as "pending" | "approved" | "rejected",
                          type: leaveType,
                          submittedDate: formatDateForDisplay(leave.created_at),
                          details: leave.reason,
                          conflicts: []
                        };
                      });
                      
                      setLeaveRequests(transformedData);
                      
                      // Reset form and close modal
                      setNewLeave({
                        reason: "",
                        type: "",
                        startDate: "",
                        endDate: "",
                        details: ""
                      });
                      setShowNewRequestModal(false);
                      setShowNewConfirmModal(true);
                    } catch (err) {
                      console.error("Error creating leave request:", err);
                      setError(handleApiError(err, "Failed to create leave request"));
                    }
                  }}
                >
                  Create Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TALeaveRequest;
