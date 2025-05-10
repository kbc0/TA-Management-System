import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomePageForTA.css";
import { useNavigate } from "react-router-dom";
//import axios from "axios";
// HER KUTUCUK İÇİN SCROLL EKLENECEK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
/*interface Task {
  name: string;
  time: string;
}

interface PendingApproval {
  name: string;
}

interface Announcement {
  message: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  profileImage?: string;
}*/

interface User {
  id: number;
  bilkent_id: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  profile_image?: string;
  total_hours: number;
  max_hours: number;
}

interface Task {
  id: number;
  course_code: string;
  course_name: string;
  task_type: string;
  start_time: string;
  end_time: string;
  status: "upcoming" | "completed" | "cancelled";
}

interface PendingApproval {
  id: number;
  type: "leave" | "swap";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  details: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_urgent: boolean;
}

// 2. Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api", //process statement can be deleted 
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,// baseURL'de || varsa bu satır silinebilir
  },
});

// baseURL'de or olmazsa , authorization satırı yerine bu method kullanılabilir. Bu methodun gelişmişi claud'da
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const HomePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("home");
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  //const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const [
          userResponse,
          tasksResponse,
          approvalsResponse,
          announcementsResponse,
        ] = await Promise.all([
          apiClient.get<User>("/users/me"),
          apiClient.get<Task[]>("/tasks/upcoming"),
          apiClient.get<PendingApproval[]>("/approvals/pending"),
          apiClient.get<Announcement[]>("/announcements"),
        ]);

        setUserInfo(userResponse.data);
        setUpcomingTasks(tasksResponse.data);
        setPendingApprovals(approvalsResponse.data);
        setAnnouncements(announcementsResponse.data);
        // setError(null);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Failed to load data");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprovalReview = (approval: PendingApproval) => {
    if (approval.type === "leave") {
      navigate(`/ta-leave-request/${approval.id}`);
    } else {
      navigate(`/ta-swap-request/${approval.id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/back-to-login");
  };

  const handleNavigation = (menu: string) => {
    setActiveMenu(menu);
    console.log(`Redirecting to ${menu} page...`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5 mx-3" role="alert">
        {error} - Please try refreshing the page
      </div>
    );
  }

  return (
    <div className="homepage-container">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#" style={{ gap: "20px" }}>
            <img
              src="bilkent-logo.jpg"
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
                  <i className="fas fa-user-circle"></i>
                  {userInfo?.full_name || "User"}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {/* <li>
                    <hr className="dropdown-divider" />
                  </li>*/}
                  <li>
                    <span
                      className="dropdown-item"
                      style={{ cursor: "pointer" }}
                      onClick={handleLogout}
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

      {/**Main Content */}
      <div className="main-content">
        <div className="left-column">
          {/**WELCOME BOX */}
          <div className="welcome-box">
            <h2 className="section-title">
              Welcome, {userInfo?.full_name || "User"}!
            </h2>
            <p>
              This system helps manage TA assignments, proctoring duties, and
              workload distribution efficiently.
            </p>
            <p>
              Use the navigation menu to access different features based on your
              role: {userInfo?.role || "TA"}
            </p>
          </div>

          <div className="left-side">
            <div className="quick-actions">
              <h3 className="section-title">Quick Actions</h3>
              <div className="action-buttons">
                <button
                  onClick={() => {
                    navigate("/ta-profile");
                  }}
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/ta-my-tasks");
                  }}
                >
                  My Tasks
                </button>
                <button
                  onClick={() => {
                    navigate("/ta-leave-request");
                  }}
                >
                  Request Leave
                </button>
                <button
                  onClick={() => {
                    navigate("/ta-swap-request");
                  }}
                >
                  Swap Tasks
                </button>
              </div>
            </div>

            <div className="announcements-box">
              <h3 className="section-title">Announcements</h3>
              <div className="announcements-scroll">
                {/*  📌 Bu kısım Announcement class'ından gelen veri ile doldurulacak*/}
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="announcement-item">
                    <h5>
                      {announcement.title}
                      {announcement.is_urgent && " ⚠️"}
                    </h5>
                    <p>{announcement.content}</p>
                    <small>
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/**Right Column */}
        <div className="side-content">
          {/* Upcoming Tasks with real data */}
          <div className="tasks-box">
            <h3 className="section-title">Upcoming Tasks</h3>
            <ul>
              {upcomingTasks.map((task) => (
                <li key={task.id}>
                  <div className="task-header">
                    <span className="course-code">{task.course_code}</span>
                    <span className="task-type">{task.task_type}</span>
                  </div>
                  <div className="task-time">
                    {new Date(task.start_time).toLocaleDateString()}
                    <br />
                    {formatTime(task.start_time)} - {formatTime(task.end_time)}
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                //  🔗 View all tasks sayfasına yönlendirme
                navigate("/ta-my-tasks")
              }
              className="view-all-button"
            >
              View All Tasks
            </button>
          </div>

          {/* Pending Approvals with real data */}
          <div className="pending-box">
            <h3 className="section-title">Pending Approvals</h3>
            <ul>
              {pendingApprovals.map((approval) => (
                <li key={approval.id}>
                  <div className="approval-header">
                    <span className="approval-type">{approval.type}</span>
                    <span
                      className="approval-status"
                      data-status={approval.status.toLowerCase()}
                    >
                      {approval.status}
                    </span>
                  </div>
                  <p className="approval-details">{approval.details}</p>
                  <button
                    onClick={() => handleApprovalReview(approval)}
                    className="review-button"
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
            {/*<button className="view-all-button">View All Pending</button>*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
//Add Pagination (for announcements/tasks if backend supports it):
//// Add pagination state
//const [currentPage, setCurrentPage] = useState(1);
// Update API call
//apiClient.get<Announcement[]>(`/announcements?page=${currentPage}`);
