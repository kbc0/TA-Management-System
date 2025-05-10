import "bootstrap/dist/css/bootstrap.min.css";
import "./TASwapRequestPage.css";
import { useState, useEffect } from "react";
import SwapRequestDetailsModal from "./SwapRequestDetailsModal";
import { SwapRequest } from "../../types";
import { useNavigate } from "react-router-dom"; // En üste ekle

type FilterType = "All" | "Pending" | "Accepted" | "Declined";

interface RequestsState {
  myRequests: SwapRequest[];
  othersRequests: SwapRequest[];
}

interface NewSwapForm {
  /*yourCourse: string;
  yourTask: string;
  yourDate: string;
  yourTime: string;
  withTa: string;
  proposedCourse: string;
  proposedTask: string;
  proposedDate: string;
  proposedTime: string;
  reason: string;*/
  assignmentId: string;
  reason: string;
  targetTa: string;
}

const TASwapRequestPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewSwapModal, setShowNewSwapModal] = useState(false);
  const [requests, setRequests] = useState<RequestsState>({
    myRequests: [],
    othersRequests: [],
  });
  const navigate = useNavigate(); // Fonksiyon içinde tanımla

  const [activeMenu, setActiveMenu] = useState("swap-requests");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newSwap, setNewSwap] = useState<NewSwapForm>({
    assignmentId: "",
    reason: "",
    targetTa: "",
  });

  const [detailedRequest, setDetailedRequest] = useState<SwapRequest | null>(
    null
  );

  const handleCreate = () => {
    const { assignmentId, reason, targetTa } = newSwap;
    if (!assignmentId || !reason || !targetTa) {
      alert("Please fill out all fields before creating request.");
      return;
    }

    setShowConfirmModal(true);
    //setShowNewSwapModal(false);///////////BU COMMENTİ AÇ Bİ NOLACAK
    // reset newSwap if needed
  };

  // const filteredRequests = (list: SwapRequest[]) =>
  // list.filter(r => activeFilter === "All" || r.status === activeFilter);

  const newSwapRequest: SwapRequest = {
    id: 0,
    title: "New Swap Request",
    status: "Pending",
    yourTask: {
      course: "",
      task: "",
      date: "",
      time: "",
      location: "",
      status: "Pending",
      requester: "You",
      with: "",
    },
    proposedTask: {
      ta: "",
      course: "",
      task: "",
      date: "",
      time: "",
    },
    timeline: {
      sent: "",
      taResponse: "",
      instructorApproval: "",
    },
    reason: "",
  };

  //const handleNavigation = (path: string) => {
  //navigate(path);
  //setActiveMenu(path.replace("/", ""));
  //};

  useEffect(() => {
    document.body.style.paddingTop = "80px";
    document.querySelector(".navbar-collapse")?.classList.remove("show");
    document.body.style.paddingTop = "70px";
    document.body.style.margin = "0";
    document.documentElement.scrollTop = 0;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const sampleData: RequestsState = {
        myRequests: [
          {
            id: 1,
            title: "CS101 Lab Session",
            status: "Pending",
            yourTask: {
              course: "CS101",
              task: "Lab Session",
              date: "March 22, 2025",
              time: "10:00 - 12:00",
              location: "EA-409",
              status: "Pending",
              requester: "You",
              with: "Bugra Malkara",
            },
            proposedTask: {
              ta: "Bugra Malkara",
              course: "CS101",
              task: "Lab Session",
              date: "March 29, 2025",
              time: "10:00 - 12:00",
            },
            timeline: {
              sent: "March 15, 2025",
              taResponse: "March 16, 2025",
              instructorApproval: "March 17, 2025",
            },
          },
          {
            id: 2,
            title: "CS319 Project Grading",
            status: "Pending",
            yourTask: {
              course: "CS319",
              task: "Project Grading",
              date: "February 15, 2025",
              time: "13:00 - 17:00",
              location: "",
              status: "Pending",
              requester: "You",
              with: "Arda Kirci",
            },
            proposedTask: {
              ta: "Arda Kirci",
              course: "CS319",
              task: "Project Grading",
              date: "February 22, 2025",
              time: "13:00 - 17:00",
            },
            timeline: {
              sent: "February 10, 2025",
              taResponse: "February 11, 2025",
              instructorApproval: "February 12, 2025",
            },
          },
          // Diğer talepler...
        ],
        othersRequests: [
          {
            id: 101,
            title: "CS101 Office Hours",
            status: "Pending",
            yourTask: {
              course: "CS101",
              task: "Office Hours",
              date: "March 24, 2025",
              time: "14:00 - 16:00",
              location: "EA-502",
              status: "Pending",
              requester: "Vildan Çetin",
              with: "You",
            },
            proposedTask: {
              ta: "You",
              course: "CS101",
              task: "Office Hours",
              date: "March 31, 2025",
              time: "14:00 - 16:00",
            },
            timeline: {
              sent: "March 18, 2025",
              taResponse: "March 19, 2025",
              instructorApproval: "March 20, 2025",
            },
          },
          // Diğer talepler...
        ],
      };
      setRequests(sampleData);
    };
    fetchData();
  }, []);

  // placeholder: fetch user's assignments for swapping
  const assignments = [
    { id: "a1", label: "CS101 Lab Session - March 22 2025, 10:00-12:00" },
    { id: "a2", label: "CS315 Grading - March 24 2025, 14:00-16:00" },
  ];

  // placeholder: fetch available TAs based on selected assignment
  const availableTas = [
    { id: "t1", name: "Arda Kirci" },
    { id: "t2", name: "Vildan Çetin" },
    { id: "t3", name: "Elif Yılmaz" },
  ];

  const handleAction = (requestId: number, type: "accept" | "decline") => {
    setSelectedRequest(requestId);
    if (type === "accept") {
      setShowAcceptModal(true);
    } else {
      setShowDeclineModal(true);
    }
  };

  const handleViewDetails = (request: SwapRequest) => {
    setDetailedRequest(request);
    setShowDetailModal(true);
  };

  const cancelRequest = (id: number) => {
    setRequests((prev) => ({
      ...prev,
      myRequests: prev.myRequests.map((req) =>
        req.id === id ? { ...req, status: "Declined" } : req
      ),
    }));
    closeDetailModal();
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailedRequest(null);
  };

  const confirmAction = (type: "accept" | "decline") => {
    const updatedRequests = { ...requests };
    const request = updatedRequests.othersRequests.find(
      (r) => r.id === selectedRequest
    );

    if (request) {
      request.status = type === "accept" ? "Accepted" : "Declined";
      setRequests(updatedRequests);
    }

    if (type === "accept") {
      setShowAcceptModal(false);
    } else {
      setShowDeclineModal(false);
    }
  };

  const filteredRequests = (list: SwapRequest[]): SwapRequest[] => {
    return list.filter(
      (request) => activeFilter === "All" || request.status === activeFilter
    );
  };

  const handleSendRequest = () => {
    const selectedAssignment = assignments.find(
      (a: { id: string; label: string }) => a.id === newSwap.assignmentId
    );

    if (!selectedAssignment) {
      alert("Please select your task.");
      return;
    }

    const nextId =
      requests.myRequests.length > 0
        ? Math.max(...requests.myRequests.map((r) => r.id)) + 1
        : 1;

    const newRequestData: SwapRequest = {
      id: nextId,
      title: selectedAssignment.label.split(" - ")[0],
      reason: newSwap.reason, // Assuming reason comes from newSwap state
      status: "Pending",
      yourTask: {
        course: selectedAssignment.label.split(" - ")[0],
        task: "", // Populate as needed
        date: selectedAssignment.label.split(" - ")[1].split(",")[0].trim(),
        time: selectedAssignment.label.split(" - ")[1].split(",")[1].trim(),
        location: "", // Populate as needed
        status: "Pending", // Initial status of the task itself
        requester: "You", // Or get current user ID/name
        with: newSwap.targetTa, // The TA this request is for
      },
      proposedTask: {
        ta: newSwap.targetTa,
        // These details would typically be for the *targetTa's* task they are offering
        // For now, let's assume it mirrors the structure, but might need actual data
        course: "", // Placeholder - needs data for target TA's task
        task: "",   // Placeholder
        date: "",   // Placeholder
        time: "",   // Placeholder
      },
      timeline: {
        sent: new Date().toISOString(),
        taResponse: "",
        instructorApproval: "",
      },
    };

    setRequests((prevRequests) => ({
      ...prevRequests,
      myRequests: [newRequestData, ...prevRequests.myRequests],
    }));

    setShowConfirmModal(false);
    setShowNewSwapModal(false);
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
          {(["All", "Pending", "Accepted", "Declined"] as FilterType[]).map(
            (filter) => (
              <button
                key={filter}
                className={`btn btn-sm ${
                  activeFilter === filter
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
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
          {/* Tarih ve saat bilgilerini buraya taşıyın */}
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
      <div className={`status-badge ${request.yourTask.status.toLowerCase()}`}>
        {request.status}
      </div>
    </div>
    <div className="mt-2">
      <button className="btn btn-link btn-sm text-danger p-0 me-3">
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
                          {request.location && (
                            <span>{request.yourTask.location}</span>
                          )}
                        </div>
                        <p className="small mb-0">
                          Requested by: {request.yourTask.requester}
                        </p>
                      </div>
                      <div
                        className={`status-badge ${request.yourTask.status.toLowerCase()}`}
                      >
                        {request.status}
                      </div>
                    </div>
                    <div className="mt-2">
                      {request.status === "Pending" && (
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
                        {availableTas.map((ta) => (
                          <option key={ta.id} value={ta.name}>
                            {ta.name} <span>(available)</span>
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
                      <td>{detailedRequest.date}</td>
                    </tr>
                    <tr>
                      <th>Time</th>
                      <td>{detailedRequest.time}</td>
                    </tr>
                    <tr>
                      <th>Location</th>
                      <td>{detailedRequest.location || "N/A"}</td>
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
