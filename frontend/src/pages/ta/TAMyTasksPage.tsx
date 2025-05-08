import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TAMyTasksPage.css";
import { useNavigate } from "react-router-dom"; // En üste ekle

interface Task {
  id: number;
  title: string;
  date: string;
  time?: string;
  room?: string;
  description?: string;
  status: "pending" | "approved" | "completed";
  type?: "lab" | "grading" | "office-hours" | "proctoring";
  submittedDate?: string;
}

interface NewTaskForm {
  course: string;
  taskType: "" | Task["type"]; // boş string ya da union’daki tipler
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  attachments: File[];
}

interface CalendarEvent {
  date: number;
  events: string[];
}

const TAMyTasksPage = () => {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarEvent[][]>([]);
  const [activeMenu, setActiveMenu] = useState("tasks");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // En üstteki useState’ler:
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const generateCalendarData = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    let firstDayIndex = firstDay.getDay() - 1;
    if (firstDayIndex < 0) firstDayIndex = 6; // Pazar için 6 yap

    const weeks: CalendarEvent[][] = [];
    let currentWeek: CalendarEvent[] = [];

    // Önceki ayın son günlerini doldur
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex; i > 0; i--) {
      currentWeek.push({
        date: prevMonthLastDay - i + 1,
        events: [],
        isPrevMonth: true,
      });
    }

    // Mevcut ayın günlerini doldur
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      currentWeek.push({
        date: day,
        events: getEventsForDate(date),
        isCurrentDay: date.toDateString() === today.toDateString(),
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Sonraki ayın ilk günlerini doldur
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: nextMonthDay,
        events: [],
        isNextMonth: true,
      });
      nextMonthDay++;
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return weeks;
  };

  // 3. Etkinlikleri getirme fonksiyonu (mock veri):
  const getEventsForDate = (date: Date) => {
    // Örnek etkinlikler - gerçek uygulamada API'den çekilmeli
    const events: string[] = [];
    if (date.getDate() === 15) {
      events.push("Office Hours (13:00-15:00)");
    }
    if (date.getDate() === 20) {
      events.push("CS101 Lab (10:00-12:00)");
    }
    return events;
  };

  // Form verileri için:
  const [newTask, setNewTask] = useState<NewTaskForm>({
    course: "",
    taskType: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    attachments: [],
  });

  const navigate = useNavigate(); // Fonksiyon içinde tanımla

  // 🧭 YÖNLENDİRME FONKSİYONU
  const handleNavigation = (path: string) => {
    // react-router kullanımı için:
    // const navigate = useNavigate();
    navigate(path);
    setActiveMenu(path.replace("/", ""));
    console.log(`Navigating to: ${path}`);
  };

  useEffect(() => {
    setCalendarData(generateCalendarData(currentMonth, currentYear));
    document.querySelector(".navbar-collapse")?.classList.remove("show");
    document.body.style.paddingTop = "80px";
    document.body.style.marginTop = "0";
    document.body.style.margin = "0";
    document.documentElement.scrollTop = 0;
    const mockCalendarData: CalendarEvent[][] = [
      [
        { date: 1, events: [] },
        { date: 2, events: [] },
        { date: 3, events: [] },
        { date: 4, events: [] },
        { date: 5, events: [] },
        { date: 6, events: [] },
        { date: 7, events: [] },
      ],
      [
        { date: 8, events: [] },
        { date: 9, events: [] },
        { date: 10, events: [] },
        { date: 11, events: ["CS101 Lab (10:00-12:00)"] },
        { date: 12, events: ["CS315 Grading (14:00-16:00)"] },
        { date: 13, events: [] },
        { date: 14, events: [] },
      ],
      [
        { date: 15, events: ["Office Hours (13:00-15:00)"] },
        {
          date: 16,
          events: ["CS319 Lab (14:00-16:00)", "CS101 Grading (16:00-18:00)"],
        },
        { date: 17, events: [] },
        { date: 18, events: ["CS101 Lab (10:00-12:00)"] },
        { date: 19, events: [] },
        { date: 20, events: [] },
        { date: 21, events: [] },
      ],
      [
        { date: 22, events: ["Office Hours (13:00-15:00)"] },
        { date: 23, events: [] },
        { date: 24, events: [] },
        { date: 25, events: ["CS101 Lab (10:00-12:00)"] },
        { date: 26, events: ["CS315 Midterm Proctor (09:00-11:00)"] },
        { date: 27, events: [] },
        { date: 28, events: [] },
      ],
      [
        { date: 29, events: ["Office Hours (13:00-15:00)"] },
        { date: 30, events: [] },
        { date: 31, events: [] },
        { date: 0, events: [] },
        { date: 0, events: [] },
        { date: 0, events: [] },
        { date: 0, events: [] },
      ],
    ];

    const mockTasks = {
      upcoming: [
        {
          id: 1,
          title: "CS101 Lab Session",
          date: "2025-03-10",
          time: "10:00 - 12:00",
          room: "EA-409",
          status: "completed" as const,
        },
        {
          id: 2,
          title: "CS315 Grading",
          date: "2025-03-12",
          time: "14:00 - 16:00",
          description: "Assignment 3 - 25 submissions",
          status: "completed" as const,
        },
      ],
      pending: [
        {
          id: 3,
          title: "CS319 Project Grading",
          date: "2025-03-10",
          submittedDate: "March 10, 2025",
          description: "Milestone 1 - 10 groups",
          status: "pending" as const,
          time: "",
        },
        {
          id: 4,
          title: "CS101 Lab Assistance",
          date: "2025-03-08",
          submittedDate: "March 8, 2025",
          description: "Extra lab session",
          status: "pending" as const,
          time: "",
        },
      ],
      completed: [
        {
          id: 5,
          title: "CS101 Lab Session",
          date: "2025-03-04",
          description: "Introduction to Arrays",
          status: "approved" as const,
          time: "",
        },
        {
          id: 6,
          title: "CS315 Assignment Grading",
          date: "2025-03-01",
          description: "Assignment 2 - 30 submissions",
          status: "approved" as const,
          time: "",
        },
      ],
    };

    //setCalendarData(mockCalendarData);
    setUpcomingTasks(mockTasks.upcoming);
    setPendingTasks(mockTasks.pending);
    setCompletedTasks(mockTasks.completed);
  }, [currentMonth, currentYear]);

  // 5. Ay navigasyon fonksiyonları:
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 6. Takvim başlığını güncelle:
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="container-fluid p-0 role-ta">
      {/* Navigation Bar */}
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

      {/* Main Content */}
      <div className="container-fluid custom-task-header mt-3 pt-3">
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">My Tasks</h5>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    <i className="fas fa-plus me-1"></i> Submit Completed Task
                  </button>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-secondary active">
                      All
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      Upcoming
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      Completed
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      Pending Approval
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Calendar Section */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className="calendar-header">
                  <h5 className="card-title mb-0 month-year-display">
                    {monthNames[currentMonth]} {currentYear}
                  </h5>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handlePrevMonth}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleNextMonth}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setCurrentMonth(new Date().getMonth());
                    setCurrentYear(new Date().getFullYear());
                  }}
                >
                  Today
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <th key={day}>{day}</th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {calendarData.map((week, weekIndex) => (
                        <tr key={weekIndex}>
                          {week.map((day, dayIndex) => (
                            <td
                              key={dayIndex}
                              className={`calendar-day ${
                                day.isCurrentDay ? "current-day" : ""
                              } ${day.events.length > 0 ? "has-event" : ""}`}
                            >
                              {day.date > 0 && (
                                <div className="date">{day.date}</div>
                              )}
                              {day.events.map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className="calendar-event"
                                >
                                  {event}
                                </div>
                              ))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Task Lists */}
          <div className="col-md-4">
            {/* Upcoming Tasks */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Upcoming Tasks</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{task.title}</h6>
                        <small className="text-primary">{task.date}</small>
                      </div>
                      {task.room && <p className="mb-1">Room: {task.room}</p>}
                      <small className="text-muted">{task.time}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Approval */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Pending Approval</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{task.title}</h6>
                        <span className="badge bg-warning">Pending</span>
                      </div>
                      {task.description && (
                        <p className="mb-1">{task.description}</p>
                      )}
                      <small className="text-muted">
                        Submitted: {task.submittedDate}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recently Completed */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Recently Completed</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{task.title}</h6>
                        <span className="badge bg-success">Approved</span>
                      </div>
                      {task.description && (
                        <p className="mb-1">{task.description}</p>
                      )}
                      <small className="text-muted">{task.date}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Task Modal */}
      {showSubmitModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Completed Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSubmitModal(false)}
                />
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Course</label>
                    <select
                      className="form-select"
                      required
                      value={newTask.course}
                      onChange={(e) =>
                        setNewTask({ ...newTask, course: e.target.value })
                      }
                    >
                      <option value="">Select Course</option>
                      <option value="CS101">
                        CS101 - Introduction to Programming
                      </option>
                      <option value="CS315">
                        CS315 - Programming Languages
                      </option>
                      <option value="CS319">
                        CS319 - Object-Oriented Software Engineering
                      </option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Task Type</label>
                    <select
                      className="form-select"
                      required
                      value={newTask.taskType}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          taskType: e.target.value as NewTaskForm["taskType"],
                        })
                      }
                    >
                      <option value="">Select Task Type</option>
                      <option value="lab">Lab Session</option>
                      <option value="grading">Grading</option>
                      <option value="office-hours">Office Hours</option>
                      <option value="proctoring">Proctoring</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={newTask.date}
                      onChange={(e) =>
                        setNewTask({ ...newTask, date: e.target.value })
                      }
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={newTask.startTime}
                        onChange={(e) =>
                          setNewTask({ ...newTask, startTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={newTask.endTime}
                        onChange={(e) =>
                          setNewTask({ ...newTask, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Task details"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Attachments</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          attachments: e.target.files
                            ? Array.from(e.target.files)
                            : [],
                        })
                      }
                    />
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setShowConfirmModal(true);
                  }}
                >
                  Submit Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body">
                <p>This task is going to be submitted. Are you sure?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowSubmitModal(true);
                  }}
                >
                  No
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    const nextId =
                      Math.max(0, ...pendingTasks.map((t) => t.id)) + 1;
                    setPendingTasks([
                      ...pendingTasks,
                      {
                        id: nextId,
                        title: `${newTask.course} - ${newTask.taskType}`,
                        date: newTask.date,
                        time: `${newTask.startTime} - ${newTask.endTime}`,
                        description: newTask.description,
                        status: "pending",
                      },
                    ]);
                    setShowConfirmModal(false);
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TAMyTasksPage;
