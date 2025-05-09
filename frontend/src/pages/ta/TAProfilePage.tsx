/** 
 * Chatgpt'den bu kısma bak
 * ✅ TAProfilePage.tsx – Yorumlarla geliştirilmiş tam dosya
tsx


 */

import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Add this line
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Bootstrap JS eklendi
import "./TAProfilePage.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom"; // En üste ekle

//////////////////////////////////
interface User {
  fullName: string;
  email: string;
  studentId: string;
  phone: string;
  department: string;
  profileImage: string;
  skills: string[];
  courses: string[];
  qualifications: string[];
  totalHours: number;
  maxHours: number;
  tasksCompleted: number;
  totalTasks: number;
  courseHours: { course: string; hours: number }[];
}

interface LeaveRequest {
  id: string;
  start: string;
  end: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface Duty {
  id: string;
  date: string;
  course: string;
  type: string;
  duration: string;
  status?: string;
}
//////////////////////////////////////////////

const TAProfilePage: React.FC = () => {
  const user = {
    ////////////////
    fullName: "Kamil Berkay Çetin",
    email: "kberkay@bilkent.edu.tr",
    studentId: "22203156",
    phone: "+90 555 123 4567",
    department: "PhD Student - Computer Science",
    profileImage: "https://via.placeholder.com/150",
    skills: ["Java", "Python", "C++", "JavaScript"],
    courses: ["CS101", "CS102", "CS201", "CS319", "CS315"],
    qualifications: ["Lab Instructor", "Grading", "Project Mentor"],
    totalHours: 48,
    maxHours: 80,
    tasksCompleted: 18,
    totalTasks: 25,
    courseHours: [{ course: "CS101 - Introduction to Programming", hours: 20 }],
    leaveRequests: [
      {
        start: "2025-04-01",
        end: "2025-04-05",
        reason: "Conference Attendance",
        status: "Approved",
      },
      {
        start: "2025-05-15",
        end: "2025-05-16",
        reason: "Medical Appointment",
        status: "Pending",
      },
    ],
    duties: {
      upcoming: [
        {
          date: "2025-03-18",
          course: "CS101",
          type: "Lab Session",
          duration: "2 hours",
          status: "Upcoming",
        },
        {
          date: "2025-03-20",
          course: "CS319",
          type: "Exam Proctoring",
          duration: "3 hours",
          status: "Pending Swap",
        },
      ],
      completed: [
        {
          date: "2025-03-15",
          course: "CS102",
          type: "Grading",
          duration: "4 hours",
        },
        {
          date: "2025-03-14",
          course: "CS315",
          type: "Office Hours",
          duration: "2 hours",
        },
      ],
    },
  }; //////////////////Silinecek

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );
  const navigate = useNavigate(); // Fonksiyon içinde tanımla
  const [activeMenu, setActiveMenu] = useState<string>("profile"); // 3. Aktif menü state'i
  const getDatasOfSemester = (semesterType: string) => {
    console.log(`Fetching data for: ${semesterType}`);
    // API call buraya gelecek
    // await axios.get(`/api/data?semester=${semesterType}`);
  };
  const [activeSemester, setActiveSemester] = useState<
    "this-semester" | "previous"
  >("this-semester");

  useEffect(() => {
    //document.body.style.paddingTop = "80px";
    // Reset body styles and scroll on mount
    document.body.style.paddingTop = "80px";
    document.querySelector(".navbar-collapse")?.classList.remove("show");
    document.body.style.paddingTop = "0";
    document.body.style.margin = "0";

    // Clean up any lingering Bootstrap collapse classes
    const navCollapse = document.querySelector(".navbar-collapse");
    if (navCollapse && navCollapse.classList.contains("show")) {
      navCollapse.classList.remove("show");
    }
  }, []);

  return (
    <>
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

      <div className="container-fluid my-profile-wrapper">
        <div className="row">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="profile-avatar mb-3"
                />
                <h4>{user.fullName}</h4>
                <p className="text-muted">{user.department}</p>
                <p>
                  <i className="fas fa-id-card me-2"></i>
                  {user.studentId}
                </p>
                <p>
                  <i className="fas fa-envelope me-2"></i>
                  {user.email}
                </p>
                <p>
                  <i className="fas fa-phone me-2"></i>
                  {user.phone}
                </p>
                <hr />
                <div className="d-grid gap-2">
                  {/*<button className="btn btn-outline-primary">
                    <i className="fas fa-edit me-2"></i> Edit Profile
                  </button>*/}
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/forgot-password")}
                  >
                    <i className="fas fa-key me-2"></i> Change Password
                  </button>
                </div>
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">Skills & Expertise</h5>
              </div>
              <div className="card-body">
                <h6>Programming Languages</h6>
                {user.skills.map((skill) => (
                  <span className="badge bg-primary me-1" key={skill}>
                    {skill}
                  </span>
                ))}
                <h6 className="mt-3">Courses Qualified For</h6>
                {user.courses.map((course) => (
                  <span className="badge bg-success me-1" key={course}>
                    {course}
                  </span>
                ))}
                <h6 className="mt-3">Special Qualifications</h6>
                {user.qualifications.map((q) => (
                  <span className="badge bg-info me-1" key={q}>
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between">
                <h5 className="mb-0">Workload Summary</h5>
                <div>
                  <button
                    className={`btn btn-sm btn-outline-secondary ${
                      activeSemester === "this-semester" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveSemester("this-semester");
                      // getDatasOfSemester("current");
                    }}
                  >
                    This Semester
                  </button>

                  <button
                    className={`btn btn-sm btn-outline-secondary ${
                      activeSemester === "previous" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveSemester("previous");
                      // getDatasOfSemester("previous");
                    }}
                  >
                    Previous
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-6 text-center">
                    <h6>Total Hours This Semester</h6>
                    <h2>
                      {user.totalHours} / {user.maxHours}
                    </h2>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: `${(user.totalHours / user.maxHours) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="col-md-6 text-center">
                    <h6>Tasks Completed</h6>
                    <h2>
                      {user.tasksCompleted} / {user.totalTasks}
                    </h2>
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${
                            (user.tasksCompleted / user.totalTasks) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                {user.courseHours.map((c, idx) => (
                  <div key={idx}>
                    <h6>{c.course}</h6>
                    <div className="progress mb-3">
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${(c.hours / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Leave of Absence Requests</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    navigate("/ta-leave-request");
                  }}
                >
                  + New Request
                </button>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.leaveRequests.map((req, idx) => (
                      <tr key={idx}>
                        <td>{req.start}</td>
                        <td>{req.end}</td>
                        <td>{req.reason}</td>
                        <td>
                          <span
                            className={`badge ${
                              req.status === "Approved"
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Assigned Duties</h5>
              </div>
              <div className="card-body">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "upcoming" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("upcoming")}
                    >
                      Upcoming
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "completed" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("completed")}
                    >
                      Completed
                    </button>
                  </li>
                </ul>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Type</th>
                      <th>Duration</th>
                      {activeTab === "completed" && <th>Status</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === "upcoming"
                      ? user.duties.upcoming
                      : user.duties.completed
                    ).map((duty, idx) => (
                      <tr key={idx}>
                        <td>{duty.date}</td>
                        <td>{duty.course}</td>
                        <td>{duty.type}</td>
                        <td>{duty.duration}</td>
                        {activeTab === "completed" && (
                          <td>
                            <span className="badge bg-success">Completed</span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TAProfilePage;
