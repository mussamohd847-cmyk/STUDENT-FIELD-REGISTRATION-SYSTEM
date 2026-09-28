import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./field-supervisor.css";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const currentUser = JSON.parse(
        localStorage.getItem("sfpms_user")
      );

      if (!currentUser?.id) {
        throw new Error(
          "Field Supervisor account not found."
        );
      }

      setUser(currentUser);

      const assignments = await api.get(
        `/supervisor-assignment/supervisor/${currentUser.id}`
      );

      const fieldAssignments = Array.isArray(assignments)
        ? assignments.filter(
            (item) =>
              item?.assignment?.role ===
              "FIELD_SUPERVISOR"
          )
        : [];

      const studentList = fieldAssignments.map(
        (item) => {
          const assignment =
            item.assignment || {};

          const student =
            item.student || {};

          return {
            userId:
              student.id ||
              assignment.student_id,

            id:
              student.institutional_id ||
              student.id ||
              assignment.student_id,

            name:
              student.name ||
              "Unknown Student",

            programme:
              student.programme ||
              "Not provided",

            department:
              student.department ||
              "ICT",

            organization:
              student.organization ||
              "eGAZ",

            status:
              student.status === "INACTIVE"
                ? "Warning"
                : "Active",

            attendance: "0%",
          };
        }
      );

      const logRequests = studentList.map(
        async (student) => {
          try {
            const response = await api.get(
              `/daily-logs/?student_id=${student.userId}`
            );

            return Array.isArray(response)
              ? response
              : response?.logs || [];
          } catch {
            return [];
          }
        }
      );

      const logResults =
        await Promise.all(logRequests);

      const allLogs =
        logResults.flat();

      setLogs(allLogs);

      let evaluationList = [];

      try {
        const response = await api.get(
          `/evaluations/?supervisor_id=${currentUser.id}`
        );

        evaluationList = Array.isArray(response)
          ? response
          : response?.evaluations || [];
      } catch {
        evaluationList = [];
      }

      setEvaluations(
        evaluationList
      );

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const studentData =
        studentList.map(
          (student) => {
            const studentLogs =
              allLogs.filter(
                (log) =>
                  Number(
                    log.student_id
                  ) ===
                  Number(
                    student.userId
                  )
              );

            const todayLogs =
              studentLogs.filter(
                (log) =>
                  log.log_date ===
                  today
              );

            const todayPresent =
              todayLogs.some(
                (log) =>
                  Boolean(
                    log.sign_in_time
                  )
              );

            const totalDays =
              studentLogs.filter(
                (log) =>
                  Boolean(
                    log.log_date
                  )
              ).length;

            const presentDays =
              studentLogs.filter(
                (log) =>
                  Boolean(
                    log.sign_in_time
                  )
              ).length;

            const attendance =
              totalDays > 0
                ? Math.min(
                    100,
                    Math.round(
                      (presentDays /
                        totalDays) *
                        100
                    )
                  )
                : todayPresent
                ? 100
                : 0;

            return {
              ...student,
              attendance:
                `${attendance}%`,
            };
          }
        );

      setStudents(
        studentData
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to load Field Supervisor dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const assignedStudents =
    students.length;

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const todayLogs =
    logs.filter(
      (log) =>
        log.log_date === today
    );

  const presentToday =
    students.filter(
      (student) => {
        return todayLogs.some(
          (log) =>
            Number(
              log.student_id
            ) ===
              Number(
                student.userId
              ) &&
            Boolean(
              log.sign_in_time
            )
        );
      }
    ).length;

  const absentToday =
    Math.max(
      0,
      assignedStudents -
        presentToday
    );

  const pendingLogs =
    logs.filter(
      (log) =>
        String(
          log.status
        ).toUpperCase() ===
        "PENDING"
    ).length;

  const pendingEvaluations =
    evaluations.filter(
      (evaluation) => {
        const status =
          String(
            evaluation.status ||
              ""
          ).toUpperCase();

        return (
          !evaluation.submitted &&
          status !== "SUBMITTED" &&
          status !== "COMPLETED"
        );
      }
    ).length;

  const stats = [
    {
      title: "Assigned Students",
      value: loading
        ? "..."
        : assignedStudents,
      color: "blue",
    },
    {
      title: "Present Today",
      value: loading
        ? "..."
        : presentToday,
      color: "green",
    },
    {
      title: "Absent Today",
      value: loading
        ? "..."
        : absentToday,
      color: "red",
    },
    {
      title: "Pending Logs",
      value: loading
        ? "..."
        : pendingLogs,
      color: "orange",
    },
    {
      title: "Pending Evaluations",
      value: loading
        ? "..."
        : pendingEvaluations,
      color: "purple",
    },
  ];

  const activities = [
    ...logs
      .slice()
      .sort(
        (a, b) =>
          Number(b.id || 0) -
          Number(a.id || 0)
      )
      .slice(0, 4)
      .map((log) => {
        const student =
          students.find(
            (item) =>
              Number(
                item.userId
              ) ===
              Number(
                log.student_id
              )
          );

        return {
          text: `${
            student?.name ||
            "Student"
          } submitted a daily log.`,
          time:
            log.log_date ||
            "Recently",
          type: "success",
        };
      }),
  ];

  const handleLogout = () => {
    localStorage.removeItem(
      "sfpms_user"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/login");
  };

  const supervisorName =
    user?.name ||
    "Field Supervisor";

  const initials =
    supervisorName
      .split(" ")
      .map(
        (word) =>
          word.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="supervisor-dashboard">

      <aside className="supervisor-sidebar">

        <div className="sidebar-logo">

          <img
            src="/image/egaz-logo.jpg"
            alt="eGAZ logo"
            className="sidebar-logo-image"
          />

          <div>

            <h2>
              eGAZ
            </h2>

            <span>
              SFPMS
            </span>

          </div>

        </div>

        <nav className="sidebar-menu">

          <Link
            to="/field-supervisor/dashboard"
            className="menu-item active"
          >
            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/field-supervisor/students"
            className="menu-item"
          >
            <span>
              Assigned Students
            </span>
          </Link>

          <Link
            to="/field-supervisor/logs"
            className="menu-item"
          >
            <span>
              Daily Logs
            </span>

            {pendingLogs > 0 && (
              <span className="menu-badge">
                {pendingLogs}
              </span>
            )}

          </Link>

          <Link
            to="/field-supervisor/evaluation"
            className="menu-item"
          >
            <span>
              Evaluation
            </span>

            {pendingEvaluations > 0 && (
              <span className="menu-badge">
                {pendingEvaluations}
              </span>
            )}

          </Link>

        </nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-btn"
            onClick={
              handleLogout
            }
          >
            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      <main className="supervisor-main">

        <header className="dashboard-header">

          <div className="header-left">

            <div className="header-brand">

              <div className="organization-icon">

                <img
                  src="/image/egaz-logo.jpg"
                  alt="eGAZ logo"
                />

              </div>

              <div className="header-brand-text">

                <strong>
                  e-Government Authority of Zanzibar
                </strong>

                <span>
                  Field Placement Supervision
                </span>

              </div>

            </div>

            <div className="header-title">

              <div className="breadcrumb">
                Field Supervisor / Dashboard
              </div>

              <h1>
                {supervisorName}
              </h1>

              <p>
                Welcome to eGAZ Field Placement Management Dashboard.
              </p>

            </div>

          </div>

          <div className="header-actions">

            <button
              type="button"
              className="icon-button"
              onClick={() => {
                alert(
                  `You have ${pendingLogs + pendingEvaluations} pending actions.`
                );
              }}
            >
              <span
                className="notification-bell"
                aria-hidden="true"
              ></span>

              <span className="header-notification"></span>

            </button>

            <div className="header-profile">

              <div className="header-avatar">
                {initials}
              </div>

              <div>

                <strong>
                  {supervisorName}
                </strong>

                <small>
                  eGAZ
                </small>

              </div>

            </div>

          </div>

        </header>

        <section className="stats-grid">

          {stats.map(
            (stat) => (

              <div
                className={`stat-card ${stat.color}`}
                key={stat.title}
              >

                <div className="stat-top">

                  <span className="stat-arrow">
                    →
                  </span>

                </div>

                <div className="stat-value">
                  {stat.value}
                </div>

                <div className="stat-title">
                  {stat.title}
                </div>

              </div>

            )
          )}

        </section>

        <div className="dashboard-grid">

          <section className="dashboard-card students-card">

            <div className="card-header">

              <div>

                <h2>
                  Assigned Students
                </h2>

                <p>
                  Students currently placed at eGAZ
                </p>

              </div>

              <Link
                to="/field-supervisor/students"
                className="view-all-btn"
              >
                View All →
              </Link>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Reg. No
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Attendance
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="5"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "30px",
                        }}
                      >
                        Loading students...
                      </td>

                    </tr>

                  ) : students.length > 0 ? (

                    students
                      .slice(0, 5)
                      .map(
                        (student) => (

                          <tr
                            key={
                              student.userId
                            }
                          >

                            <td>

                              <div className="student-info">

                                <div className="student-avatar">

                                  {student.name
                                    .split(
                                      " "
                                    )
                                    .map(
                                      (
                                        word
                                      ) =>
                                        word[0]
                                    )
                                    .join(
                                      ""
                                    )
                                    .slice(
                                      0,
                                      2
                                    )
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {
                                      student.name
                                    }
                                  </strong>

                                  <small>
                                    {
                                      student.programme
                                    }
                                  </small>

                                </div>

                              </div>

                            </td>

                            <td>
                              {
                                student.id
                              }
                            </td>

                            <td>
                              {
                                student.department
                              }
                            </td>

                            <td>

                              <div className="attendance-cell">

                                <span>
                                  {
                                    student.attendance
                                  }
                                </span>

                                <div className="progress-bar">

                                  <div
                                    className="progress-fill"
                                    style={{
                                      width:
                                        student.attendance,
                                    }}
                                  ></div>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`status ${
                                  student.status ===
                                  "Active"
                                    ? "active"
                                    : "warning"
                                }`}
                              >
                                {
                                  student.status
                                }
                              </span>

                            </td>

                          </tr>

                        )
                      )

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "30px",
                        }}
                      >
                        No students assigned to you.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </section>

          <section className="dashboard-card activities-card">

            <div className="card-header">

              <div>

                <h2>
                  Recent Activities
                </h2>

                <p>
                  Latest student activities
                </p>

              </div>

            </div>

            <div className="activities-list">

              {activities.length > 0 ? (

                activities.map(
                  (
                    activity,
                    index
                  ) => (

                    <div
                      className="activity-item"
                      key={`${activity.text}-${index}`}
                    >

                      <div className="activity-content">

                        <p>
                          {
                            activity.text
                          }
                        </p>

                        <span>
                          {
                            activity.time
                          }
                        </span>

                      </div>

                    </div>

                  )
                )

              ) : (

                <div className="activity-item">

                  <div className="activity-content">

                    <p>
                      No recent activities.
                    </p>

                    <span>
                      Waiting for student activity
                    </span>

                  </div>

                </div>

              )}

            </div>

            <button
              type="button"
              className="activity-btn"
              onClick={() => {
                navigate(
                  "/field-supervisor/logs"
                );
              }}
            >
              View All Activities
            </button>

          </section>

        </div>

        <div className="bottom-grid">

          <section className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Today's Attendance
                </h2>

                <p>
                  Student attendance overview
                </p>

              </div>

              <Link
                to="/field-supervisor/attendance"
                className="view-all-btn"
              >
                Details →
              </Link>

            </div>

            <div className="attendance-overview">

              <div className="attendance-circle">

                <div>

                  <strong>
                    {assignedStudents > 0
                      ? Math.round(
                          (presentToday /
                            assignedStudents) *
                            100
                        )
                      : 0}
                    %
                  </strong>

                  <span>
                    Present
                  </span>

                </div>

              </div>

              <div className="attendance-details">

                <div>

                  <span className="dot present"></span>

                  <label>
                    Present
                  </label>

                  <strong>
                    {presentToday}
                  </strong>

                </div>

                <div>

                  <span className="dot absent"></span>

                  <label>
                    Absent
                  </label>

                  <strong>
                    {absentToday}
                  </strong>

                </div>

                <div>

                  <span className="dot late"></span>

                  <label>
                    Late
                  </label>

                  <strong>
                    0
                  </strong>

                </div>

              </div>

            </div>

          </section>

          <section className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Pending Actions
                </h2>

                <p>
                  Things that require your attention
                </p>

              </div>

            </div>

            <div className="pending-list">

              <div className="pending-item">

                <div>

                  <strong>
                    Daily Logs
                  </strong>

                  <span>
                    {pendingLogs} logs waiting for review
                  </span>

                </div>

                <Link
                  to="/field-supervisor/logs"
                >
                  Review
                </Link>

              </div>

              <div className="pending-item">

                <div>

                  <strong>
                    Evaluations
                  </strong>

                  <span>
                    {pendingEvaluations} students need evaluation
                  </span>

                </div>

                <Link
                  to="/field-supervisor/evaluation"
                >
                  Evaluate
                </Link>

              </div>

            </div>

          </section>

        </div>

        <footer className="dashboard-footer">

          <span>
            © 2026 SFPMS • e-Government Authority of Zanzibar
          </span>

          <span>
            Field Supervisor Portal
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;


