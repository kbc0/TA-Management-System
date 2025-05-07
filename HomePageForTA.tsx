import React, { useEffect, useState } from "react";
import "./HomePageForTA.css";
import { useNavigate } from "react-router-dom"; // En üste ekle
// HER KUTUCUK İÇİN SCROLL EKLENECEK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
interface Task {
  name: string;
  time: string;
}

interface PendingApproval {
  name: string;
}

interface Announcement {
  message: string;
}

const HomePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("Home");
  const [showUserMenu, setShowUserMenu] = useState(false);


  const handleNavigation = (menu: string) => {
    setActiveMenu(menu);
    console.log(`Redirecting to ${menu} page...`);
  };
  useEffect(() => {
    //document.body.style.paddingTop = '80px';
  }, []);

  const upcomingTasks: Task[] = [
    { name: "CS319 Lab Grading", time: "Today, 14:00 - 16:00" },
    { name: "CS315 Midterm Proctoring", time: "Tomorrow, 10:00 - 12:00" },
    { name: "CS202 Office Hours", time: "Wed, 13:00 - 15:00" },
  ];
  const navigate = useNavigate(); // Fonksiyon içinde tanımla
  const pendingApprovals: PendingApproval[] = [
    { name: "Leave Request" },
    { name: "Task Completion" },
    { name: "Swap Request" },
  ];

  const announcements: Announcement[] = [
    { message: "Spring 2025 TA Applications Open" },
    { message: "System maintenance on May 10" },
    { message: "New TA Guidelines Released" },
  ];

  return (
    <div className="homepage-container">
{/* Navigation Bar */}
<div className="navbar">
  {/* Logo & App Name */}
  <div className="brand">
    <img src="/bilkent-logo.jpg" alt="Logo" className="logo" />
    <span className="brand-text">TA Management System</span>
  </div>

  {/* Main Menu */}
  <div className="menu">
    <span
      className={activeMenu === "Home" ? "active" : ""}
      onClick={() => {
        setActiveMenu("Home");
        navigate("/ta-home");
      }}
    >
      Home
    </span>
    <span
      className={activeMenu === "My Profile" ? "active" : ""}
      onClick={() => {
        setActiveMenu("My Profile");
        navigate("/ta-profile");
      }}
    >
      My Profile
    </span>
    <span
      className={activeMenu === "My Tasks" ? "active" : ""}
      onClick={() => {
        setActiveMenu("My Tasks");
        navigate("/ta-my-tasks");
      }}
    >
      My Tasks
    </span>
    <span
      className={activeMenu === "Leave Requests" ? "active" : ""}
      onClick={() => {
        setActiveMenu("Leave Requests");
        navigate("/ta-leave-request");
      }}
    >
      Leave Requests
    </span>
    <span
      className={activeMenu === "Swap Requests" ? "active" : ""}
      onClick={() => {
        setActiveMenu("Swap Requests");
        navigate("/ta-swap-request");
      }}
    >
      Swap Requests
    </span>
  </div>

  {/* User Info & Dropdown */}
  <div className="user-info" style={{ position: "relative" }}>
    <span
      className="username"
      style={{ cursor: "pointer" }}
      onClick={() => setShowUserMenu(prev => !prev)}
    >
      <i className="fas fa-user-circle me-1"></i>Buğra Malkara
    </span>

    {showUserMenu && (
      <div className="user-dropdown">
        <div
          className="dropdown-item"
          onClick={() => {
            setShowUserMenu(false);
            navigate("/back-to-login");
          }}
        >
          Logout
        </div>
      </div>
    )}
  </div>
</div>

      <div className="main-content">
        <div className="left-column">
          <div className="welcome-box">
            <h2 className="section-title">
              Welcome to the Procter and TA Management System
            </h2>
            <p>
              This system helps manage TA assignments, proctoring duties, and
              workload distribution efficiently.
            </p>
            <p>
              Use the navigation menu to access different features based on your
              role.
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
                      // 🔗 Burada ilgili pending approval detay sayfasına yönlendirme olacak
                      console.log(`Reviewing ${approval.name}...`);
                    }}
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
            <button className="view-all-button">View All Pending</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
