import React, { useEffect, useState } from "react";

import "./HomePageForTA.css";
import { useNavigate } from "react-router-dom";
//import axios from "axios";
// HER KUTUCUK İÇİN SCROLL EKLENECEK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
interface Task {
  name: string;
  time: string;
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
}

const HomePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const routeMap = {
    leave: "/ta-leave-request",
    task: "/ta-my-tasks",
    swap: "/ta-swap-request",
  } as const;

  type ApprovalType = keyof typeof routeMap;

  interface PendingApproval {
    name: string;
    type: ApprovalType; // Now explicitly typed
  }

  // Then in your click handler:

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.get(
        "http://your-backend-url/api/user/info",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you store the token in localStorage
          },
        }
      );
      setUserInfo(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch user information");
      console.error("Error fetching user info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (menu: string) => {
    setActiveMenu(menu);
    console.log(`Redirecting to ${menu} page...`);
  };

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem("token");
    navigate("/back-to-login");
  };

  const upcomingTasks: Task[] = [
    { name: "CS319 Lab Grading", time: "Today, 14:00 - 16:00" },
    { name: "CS315 Midterm Proctoring", time: "Tomorrow, 10:00 - 12:00" },
    { name: "CS202 Office Hours", time: "Wed, 13:00 - 15:00" },
  ];

  const pendingApprovals: PendingApproval[] = [
    {
      name: "Leave Request",
      type: "leave", // Must match routeMap key
    },
    {
      name: "Task Completion",
      type: "task", // Must match routeMap key
    },
    {
      name: "Swap Request",
      type: "swap", // Must match routeMap key
    },
  ];

  const announcements: Announcement[] = [
    { message: "Spring 2025 TA Applications Open" },
    { message: "System maintenance on May 10" },
    { message: "New TA Guidelines Released" },
  ];

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
                  <i className="fas fa-user-circle"></i> Kamil Berkay Çetin
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

      <div className="main-content">
        <div className="left-column">
          <div className="welcome-box">
            <h2 className="section-title">
              Welcome, {userInfo?.name || "User"}!
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
                {announcements.map((a, index) => (
                  <p key={index}>{a.message}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="side-content">
          <div className="tasks-box">
            <h3 className="section-title">Upcoming Tasks</h3>
            <ul>
              {upcomingTasks.map((task, index) => (
                <li key={index}>
                  <span>{task.name}</span>
                  <span>{task.time}</span>
                  <span className="duration">2h</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                //  🔗 View all tasks sayfasına yönlendirme
                navigate("/ta-my-tasks");
                console.log("Redirecting to All Tasks page...");
              }}
              className="view-all-button"
            >
              View All Tasks
            </button>
          </div>

          <div className="pending-box">
            <h3 className="section-title">Pending Approvals</h3>
            <ul>
              {pendingApprovals.map((approval, index) => (
                <li key={index}>
                  <span>{approval.name}</span>
                  <button
                    onClick={() => {
                      // Determine the correct route based on approval type
                      const routeMap = {
                        leave: "/ta-leave-request",
                        task: "/ta-my-tasks", // Create this route if needed
                        swap: "/ta-swap-request",
                      };

                      navigate(`${routeMap[approval.type]}?filter=pending`);
                    }}
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
