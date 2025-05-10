/** 
 * Chatgpt'den bu kısma bak
 * ✅ TAProfilePage.tsx – Yorumlarla geliştirilmiş tam dosya
tsx


 */
import axios from "axios";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Add this line
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Bootstrap JS eklendi
import "./TAProfilePage.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom"; // En üste ekle

const TAProfilePage: React.FC = () => {
  interface User {
    id: number;
    full_name: string;
    email: string;
    student_id: string;
    phone: string;
    department: string;
    profile_image: string;
    skills: string[];
    courses: string[];
    qualifications: string[];
    total_hours: number;
    max_hours: number;
    tasks_completed: number;
    total_tasks: number;
    course_hours: CourseHours[]; // Match backend snake_case
    /////// BU DATABASE'e Eklenmeli mi
  }

  interface LeaveRequest {
    id: number;
    start_date: string;
    end_date: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
  }

  interface Duty {
    //Duty yerine Task olacak büyük ihtimal
    id: number;
    date: string;
    course_code: string;
    type: string;
    duration: string;
    status?: string;
  }

  interface CourseHours {
    course_code: string;
    course_name: string;
    hours: number;
  }

  const apiClient = axios.create({
    baseURL: "http://localhost:5001/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const [userData, setUserData] = useState<User | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [duties, setDuties] = useState<{
    upcoming: Duty[];
    completed: Duty[];
  }>({ upcoming: [], completed: [] });
  const [courseHours, setCourseHours] = useState<CourseHours[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, leaveRes, dutiesRes, hoursRes] = await Promise.all([
          apiClient.get<User>("/users/me"),
          apiClient.get<LeaveRequest[]>("/leave-requests"),
          apiClient.get<{ upcoming: Duty[]; completed: Duty[] }>(
            `/duties?semester=${activeSemester}`
          ),
          apiClient.get<CourseHours[]>("/course-hours"),
        ]);

        setUserData(userRes.data);
        setLeaveRequests(leaveRes.data);
        setDuties(dutiesRes.data);
        setCourseHours(hoursRes.data);
        setError(null);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Failed to load data"
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();

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

    const handleSemesterChange = (
      semesterType: "this-semester" | "previous"
    ) => {
      setActiveSemester(semesterType);
      // The useEffect will automatically refetch data

      const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
      };
    };
  }, [activeSemester]);

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
                  <i className="fas fa-user-circle"></i>{" "}
                  {userData?.full_name || "User"}
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
                  src={
                    userData?.profile_image || "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="profile-avatar mb-3"
                />
                <h4>{userData?.full_name}</h4>
                <p className="text-muted">{userData?.department}</p>
                <p>
                  <i className="fas fa-id-card me-2"></i>
                  {userData?.student_id}
                </p>
                <p>
                  <i className="fas fa-envelope me-2"></i>
                  {userData?.email}
                </p>
                <p>
                  <i className="fas fa-phone me-2"></i>
                  {userData?.phone}
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
            {/* Buraya user'a eklenecek skills variable'ından çekebiliriz}*/}
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">Skills & Expertise</h5>
              </div>
              <div className="card-body">
                <h6>Programming Languages</h6>
                {userData?.skills.map((skill) => (
                  <span className="badge bg-primary me-1" key={skill}>
                    {skill}
                  </span>
                ))}
                <h6 className="mt-3">Courses Qualified For</h6>
                {userData?.courses.map((course) => (
                  <span className="badge bg-success me-1" key={course}>
                    {course}
                  </span>
                ))}
                <h6 className="mt-3">Special Qualifications</h6>
                {userData?.qualifications.map((q) => (
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
                      {userData?.total_hours} / {userData?.max_hours}
                    </h2>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: `${
                            ((userData?.total_hours || 0) /
                              (userData?.max_hours || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="col-md-6 text-center">
                    <h6>Tasks Completed</h6>
                    <h2>
                      {userData?.tasks_completed} / {userData?.total_tasks}
                    </h2>
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${
                            ((userData?.tasks_completed || 0) /
                              (userData?.total_tasks || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                {userData?.course_hours?.map((c, idx) => (
                  <div key={idx}>
                    <h6>
                      {c.course_code} - {c.course_name}
                    </h6>
                    <div className="progress mb-3">
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: `${(c.hours / userData.max_hours) * 100}%`,
                        }}
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
                    {leaveRequests.map((req) => (
                      <tr key={req.id}>
                        <td>{new Date(req.start_date).toLocaleDateString()}</td>
                        <td>{new Date(req.end_date).toLocaleDateString()}</td>
                        <td>{req.reason}</td>
                        <td>
                          <span
                            className={`badge ${
                              req.status === "approved"
                                ? "bg-success"
                                : req.status === "rejected"
                                ? "bg-danger"
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
                      ? duties.upcoming /////////// user'ın task classları olmalı
                      : duties.completed
                    ) //////////////
                      .map((duty) => (
                        <tr key={duty.id}>
                          <td>{new Date(duty.date).toLocaleDateString()}</td>
                          <td>{duty.course_code}</td>
                          <td>{duty.type}</td>
                          <td>{duty.duration}</td>
                          {activeTab === "completed" && (
                            <td>
                              <span className="badge bg-success">
                                Completed
                              </span>
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
