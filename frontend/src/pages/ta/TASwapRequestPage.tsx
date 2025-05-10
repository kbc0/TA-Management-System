import "bootstrap/dist/css/bootstrap.min.css";
import "./TASwapRequestPage.css";
import { useState, useEffect } from "react";
import SwapRequestDetailsModal from "./SwapRequestDetailsModal";
import { UISwapRequest, transformApiToUiSwapRequest } from "./types";
import { 
  getMySwapRequests, 
  getPendingSwapRequests, 
  getSwapRequestById, 
  createSwapRequest, 
  approveSwapRequest, 
  rejectSwapRequest, 
  cancelSwapRequest, 
  getEligibleSwapTargets,
  EligibleSwapTarget
} from "../../api/swaps";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { handleApiError } from "../../api/apiUtils";

type FilterType = "All" | "pending" | "approved" | "rejected";

interface RequestsState {
  myRequests: UISwapRequest[];
  othersRequests: UISwapRequest[];
}

interface NewSwapForm {
  assignmentId: string;
  reason: string;
  targetTa: string;
}

const TASwapRequestPage = () => {
  // State for UI components
  const [filter, setFilter] = useState<FilterType>("All");
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewSwapModal, setShowNewSwapModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState("swap-requests");
  
  // State for data
  const [requests, setRequests] = useState<RequestsState>({
    myRequests: [],
    othersRequests: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTAs, setAvailableTAs] = useState<EligibleSwapTarget[]>([]);
  const [assignments, setAssignments] = useState<{id: string, label: string}[]>([]);
  
  // Form state
  const [newSwap, setNewSwap] = useState<NewSwapForm>({
    assignmentId: "",
    reason: "",
    targetTa: "",
  });
  
  // Selected request details
  const [detailedRequest, setDetailedRequest] = useState<UISwapRequest | null>(null);
  
  // Hooks
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle create button click - validate form and show confirmation
  const handleCreate = () => {
    const { assignmentId, reason, targetTa } = newSwap;
    if (!assignmentId || !reason || !targetTa) {
      alert("Please fill out all fields before creating request.");
      return;
    }

    setShowConfirmModal(true);
  };

  // Apply UI fixes when component mounts
  useEffect(() => {
    document.body.style.paddingTop = "80px";
    document.querySelector(".navbar-collapse")?.classList.remove("show");
    document.body.style.paddingTop = "70px";
    document.body.style.margin = "0";
    document.documentElement.scrollTop = 0;
  }, []);

  // Fetch swap requests data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch real swap requests from the API
        const mySwapRequests = await getMySwapRequests();
        const pendingRequests = await getPendingSwapRequests();
        
        // Transform API responses to UI format
        const transformedMyRequests = mySwapRequests.map(transformApiToUiSwapRequest);
        const transformedPendingRequests = pendingRequests.map(transformApiToUiSwapRequest);
        
        setRequests({
          myRequests: transformedMyRequests,
          othersRequests: transformedPendingRequests
        });
        setError(null);
        
        // Fetch sample assignments for the form
        // In a real implementation, these would come from an API
        setAssignments([
          { id: "1", label: "CS101 Lab Session - May 15 2025, 10:00-12:00" },
          { id: "2", label: "CS315 Grading - May 20 2025, 14:00-16:00" },
          { id: "3", label: "CS342 Exam Proctoring - May 25 2025, 09:00-12:00" },
        ]);
      } catch (err) {
        console.error('Error fetching swap requests:', err);
        setError(handleApiError(err, 'Failed to load swap requests'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch eligible TAs when an assignment is selected
  useEffect(() => {
    const fetchEligibleTAs = async () => {
      if (!newSwap.assignmentId) {
        setAvailableTAs([]);
        return;
      }
      
      try {
        const assignmentId = parseInt(newSwap.assignmentId);
        if (isNaN(assignmentId)) return;
        
        const eligibleTAs = await getEligibleSwapTargets(assignmentId, 'task');
        setAvailableTAs(eligibleTAs);
      } catch (err) {
        console.error('Error fetching eligible TAs:', err);
        setError(handleApiError(err, 'Failed to load eligible TAs'));
      }
    };
    
    fetchEligibleTAs();
  }, [newSwap.assignmentId]);

  // Handle action button click (accept/decline)
  const handleAction = (id: number, action: "accept" | "decline") => {
    setSelectedRequest(id);
    if (action === "accept") {
      setShowAcceptModal(true);
    } else {
      setShowDeclineModal(true);
    }
  };

  // Handle view details button click
  const handleViewDetails = (request: UISwapRequest) => {
    setDetailedRequest(request);
    setShowDetailModal(true);
  };

  // Cancel a swap request
  const cancelRequest = async (id: number) => {
    try {
      // Call the API to cancel the request
      await cancelSwapRequest(id);
      
      // Remove the request from the list
      setRequests((prev) => ({
        ...prev,
        myRequests: prev.myRequests.filter((r) => r.id !== id),
      }));
      
      // Close the detail modal if open
      closeDetailModal();
      
      // Show success message
      alert('Request cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling request:', err);
      alert('Failed to cancel request. Please try again.');
    }
  };

  // Close the detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailedRequest(null);
  };

  const confirmAction = async (type: "accept" | "decline") => {
    if (!selectedRequest) return;

    try {
      // Call the appropriate API based on action type
      if (type === "accept") {
        await approveSwapRequest(selectedRequest);
      } else {
        await rejectSwapRequest(selectedRequest);
      }
      
      // Refresh the data after action
      const pendingRequests = await getPendingSwapRequests();
      const transformedPendingRequests = pendingRequests.map(transformApiToUiSwapRequest);
      
      // Update the state
      setRequests(prev => ({
        ...prev,
        othersRequests: transformedPendingRequests
      }));
      
      // Close modals
      setShowAcceptModal(false);
      setShowDeclineModal(false);
      setSelectedRequest(null);
      
      // Show success message
      alert(`Request ${type === "accept" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      console.error(`Error ${type === "accept" ? "approving" : "rejecting"} request:`, err);
      alert(`Failed to ${type} request. Please try again.`);
    }
  };

  // Filter requests based on the active filter
  const filteredRequests = (requestsList: UISwapRequest[]) => {
    if (filter === "All") return requestsList;
    // Convert filter to lowercase to match API status format
    return requestsList.filter((r) => r.status === filter.toLowerCase());
  };

  // Send a new swap request
  const handleSendRequest = async () => {
    try {
      // Create the swap request through the API
      const response = await createSwapRequest({
        target_id: parseInt(newSwap.targetTa),
        assignment_id: parseInt(newSwap.assignmentId),
        assignment_type: 'task' // Assuming it's a task for now
      });
      
      // Transform the API response to UI format
      const transformedResponse = transformApiToUiSwapRequest(response);
      
      // Update the state with the new request
      setRequests({
        ...requests,
        myRequests: [...requests.myRequests, transformedResponse],
      });
      
      // Close modals and reset form
      setShowConfirmModal(false);
      setNewSwap({
        assignmentId: "",
        reason: "",
        targetTa: "",
      });
      
      // Show success message
      alert('Swap request created successfully!');
    } catch (err) {
      console.error('Error creating swap request:', err);
      alert('Failed to create swap request. Please try again.');
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="swap-requests-container">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src="bilkent-logo.jpg" alt="Bilkent University" height="30" />
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
            <ul className="navbar-nav me-auto">
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
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-user-circle me-2"></i>Kamil Berkay Çetin
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
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

      <main className="container-fluid h-100 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1
            className="h5 mb-0 p-2 rounded"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            Swap Requests
          </h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowNewSwapModal(true)}
          >
            <i className="fas fa-plus me-2"></i>New Swap Request
          </button>
        </div>

        <div className="filters mb-4">
          {(["All", "pending", "approved", "rejected"] as FilterType[]).map(
            (filter) => (
              <button
                key={filter}
                className={`filter-btn ${filter === filter ? "active" : ""}`}
                onClick={() => setFilter(filter)}
              >
                {filter === "All" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            )
          )}
        </div>

        <div className="row g-4">
          {/* My Swap Requests */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light">
                <h2
                  className="h5 mb-0 p-2 rounded"
                  style={{ backgroundColor: "#f0f0f0" }}
                >
                  My Swap Requests
                </h2>
              </div>
              <div className="card-body">
                {filteredRequests(requests.myRequests).map((request) => (
                  <div key={request.id} className="request-card mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h3 className="h6 fw-bold mb-1">{request.title}</h3>
                        <div className="text-muted small mb-2">
                          {request.yourTask.date && (
                            <span className="me-3">{request.yourTask.date}</span>
                          )}
                          {request.yourTask.time && (
                            <span className="me-3">{request.yourTask.time}</span>
                          )}
                        </div>
                        <p className="small mb-0">
                          Requested to swap with: {request.yourTask.with}
                        </p>
                      </div>
                      <div
                        className={`status-badge ${request.status.toLowerCase()}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <button
                        className="btn btn-link btn-sm text-danger p-0 me-3"
                        onClick={() => cancelRequest(request.id)}
                      >
                        Cancel Request
                      </button>
                      <button
                        className="btn btn-link btn-sm p-0"
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Requests From Others */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light">
                <h2 className="h5 mb-0">Swap Requests From Others</h2>
              </div>
              <div className="card-body">
                {filteredRequests(requests.othersRequests).map((request) => (
                  <div key={request.id} className="request-card mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h3 className="h6 fw-bold mb-1">{request.title}</h3>
                        <div className="text-muted small mb-2">
                          <span className="me-3">{request.yourTask.date}</span>
                          <span className="me-3">{request.yourTask.time}</span>
                        </div>
                        <p className="small mb-0">
                          Requested by: {request.yourTask.requester}
                        </p>
                      </div>
                      <div
                        className={`status-badge ${request.status.toLowerCase()}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </div>
                    <div className="mt-2">
                      {request.status === "pending" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleAction(request.id, "accept")}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() => handleAction(request.id, "decline")}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-link btn-sm p-0"
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAcceptModal && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Acceptance</h5>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to accept this request?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => confirmAction("accept")}
                >
                  Yes, Accept
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Decline</h5>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to decline this request?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={() => confirmAction("decline")}
                >
                  Yes, Decline
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeclineModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Swap Request Modal */}
      {showNewSwapModal && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Swap Request</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowNewSwapModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <form>
                  {/* Select Assignment to Swap */}
                  <div className="mb-4">
                    <label className="form-label">
                      Select Assignment to Swap
                    </label>
                    <select
                      className="form-select"
                      value={newSwap.assignmentId}
                      onChange={(e) =>
                        setNewSwap({ ...newSwap, assignmentId: e.target.value })
                      }
                    >
                      <option value="">Select an assignment</option>
                      {assignments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                    {/* TODO: replace `assignments` with backend API call for user's assignments */}
                  </div>

                  {/* Reason for Swap */}
                  <div className="mb-4">
                    <label className="form-label">Reason for Swap</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newSwap.reason}
                      onChange={(e) =>
                        setNewSwap({ ...newSwap, reason: e.target.value })
                      }
                    />
                  </div>

                  {/* Select TA to Swap With */}
                  <div className="mb-4">
                    <label className="form-label">Select TA to Swap With</label>
                    <div className="ta-dropdown">
                      <select
                        className="form-select"
                        size={5}
                        style={{ overflowY: "auto" }}
                        value={newSwap.targetTa}
                        onChange={(e) =>
                          setNewSwap({ ...newSwap, targetTa: e.target.value })
                        }
                      >
                        <option value="">Select a TA</option>
                        {availableTAs.map((ta) => (
                          <option key={ta.id} value={ta.id}>
                            {ta.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* TODO: replace `availableTas` with backend API call for available TAs based on assignment */}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowNewSwapModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleCreate}
                    >
                      Create Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Creation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content p-3">
              <div className="modal-body text-center">
                <p>You are going to create swap request. Are you sure?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger me-2"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowNewSwapModal(true);
                  }}
                >
                  No
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSendRequest}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailedRequest && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Swap Request Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetailModal}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Title</th>
                      <td>{detailedRequest.title}</td>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <td>{detailedRequest.yourTask.date}</td>
                    </tr>
                    <tr>
                      <th>Time</th>
                      <td>{detailedRequest.yourTask.time}</td>
                    </tr>
                    <tr>
                      <th>Location</th>
                      <td>{detailedRequest.yourTask.location || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Swap With</th>
                      <td>{detailedRequest.yourTask.with || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>{detailedRequest.status}</td>
                    </tr>
                    {/* Burada gelecekteki backend veri çekimi yapılabilir */}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeDetailModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SwapRequestDetailsModal
        show={!!detailedRequest}
        request={detailedRequest}
        onClose={closeDetailModal}
        onCancelRequest={(id: number) => {
          console.log("Cancelled request:", id);
          closeDetailModal();
        }}
      />
    </div>
  );
};

export default TASwapRequestPage;
