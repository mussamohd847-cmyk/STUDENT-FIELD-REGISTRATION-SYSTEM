import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./field-supervisor.css";
import api from "../../services/api";

function Evaluation() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("sfpms_user") || "null"
  );

  useEffect(() => {
    const loadEvaluationData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!currentUser?.id) {
          navigate("/login");
          return;
        }

        const assignments = await api.get(
          `/supervisor-assignment/supervisor/${currentUser.id}`
        );

        const fieldAssignments = Array.isArray(assignments)
          ? assignments.filter(
              (item) =>
                item?.assignment?.role === "FIELD_SUPERVISOR"
            )
          : [];

        if (fieldAssignments.length === 0) {
          setStudents([]);
          return;
        }

        const evaluationResponse = await api.get(
          `/evaluations/?supervisor_id=${currentUser.id}`
        );

        const evaluations = Array.isArray(evaluationResponse)
          ? evaluationResponse
          : evaluationResponse?.evaluations || [];

        const studentData = await Promise.all(
          fieldAssignments.map(async (item) => {
            const student = item?.student;

            if (!student?.id) {
              return null;
            }

            let logs = [];

            try {
              const logResponse = await api.get(
                `/daily-logs/?student_id=${student.id}`
              );

              logs = Array.isArray(logResponse)
                ? logResponse
                : logResponse?.logs || [];
            } catch (err) {
              console.error(
                `Failed to load logs for student ${student.id}`,
                err
              );
            }

            const studentEvaluation = evaluations.find(
              (evaluation) =>
                Number(evaluation.student_id) ===
                Number(student.id)
            );

            const totalLogs = logs.length;

            const completedLogs = logs.filter(
              (log) =>
                log.sign_in_time &&
                log.sign_out_time
            ).length;

            const attendance =
              totalLogs > 0
                ? Math.round(
                    (completedLogs / totalLogs) * 100
                  )
                : 0;

            const evaluationSubmitted =
              studentEvaluation?.submitted === true ||
              String(studentEvaluation?.status || "").toUpperCase() ===
                "SUBMITTED" ||
              String(studentEvaluation?.status || "").toUpperCase() ===
                "COMPLETED";

            return {
              id: student.id,
              name: student.name || "Unknown Student",
              registration:
                student.institutional_id || "N/A",
              programme:
                student.programme || "N/A",
              organization:
                "e-Government Authority of Zanzibar",
              attendance: `${attendance}%`,
              status: evaluationSubmitted
                ? "Completed"
                : "Pending",
            };
          })
        );

        setStudents(
          studentData.filter(Boolean)
        );
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Failed to load evaluation data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvaluationData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("sfpms_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  };

  const supervisorName =
    currentUser?.name || "Field Supervisor";

  const supervisorInitials = supervisorName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pendingEvaluations = students.filter(
    (student) => student.status === "Pending"
  ).length;

  const completedEvaluations = students.filter(
    (student) => student.status === "Completed"
  ).length;

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
            <h2>eGAZ</h2>
            <span>SFPMS</span>
          </div>
        </div>

        <nav className="sidebar-menu">

          <Link
            to="/field-supervisor/dashboard"
            className="menu-item"
          >
            <span>Dashboard</span>
          </Link>

          <Link
            to="/field-supervisor/students"
            className="menu-item"
          >
            <span>Assigned Students</span>
          </Link>

          <Link
            to="/field-supervisor/logs"
            className="menu-item"
          >
            <span>Daily Logs</span>
            <span className="menu-badge">5</span>
          </Link>

          <Link
            to="/field-supervisor/evaluation"
            className="menu-item active"
          >
            <span>Evaluation</span>

            <span className="menu-badge">
              {pendingEvaluations}
            </span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            <span>Logout</span>
          </button>

        </div>

      </aside>

      <main className="supervisor-main">

        <header className="dashboard-header">

          <div className="header-title">

            <div className="breadcrumb">
              Field Supervisor / Evaluation
            </div>

            <h1>
              Student Evaluation
            </h1>

            <p>
              Evaluate students currently undertaking field placement at eGAZ.
            </p>

          </div>

          <div className="header-actions">

            <button
              type="button"
              className="icon-button"
              onClick={() => {
                alert("You have new notifications.");
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
                {supervisorInitials}
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

        <section className="organization-banner">

          <div className="organization-icon">
            <img
              src="/image/egaz-logo.jpg"
              alt="eGAZ logo"
            />
          </div>

          <div className="organization-info">

            <span>
              YOUR ORGANIZATION
            </span>

            <h2>
              e-Government Authority of Zanzibar
            </h2>

            <p>
              Field Placement Supervision • Zanzibar
            </p>

          </div>

          <div className="placement-info">

            <span>
              PENDING EVALUATIONS
            </span>

            <strong>
              {pendingEvaluations} Students
            </strong>

          </div>

        </section>

        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>
                Student Evaluation
              </h2>

              <p>
                Review and evaluate assigned field placement students
              </p>
            </div>

            <span className="view-all-btn">
              Total: {students.length}
            </span>

          </div>

          {loading && (
            <div className="table-container">
              <p style={{ padding: "20px" }}>
                Loading evaluation data...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="table-container">
              <p
                style={{
                  padding: "20px",
                  color: "red"
                }}
              >
                {error}
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Registration No.</th>
                    <th>Programme</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {students.length === 0 ? (

                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "30px"
                        }}
                      >
                        No students assigned for evaluation.
                      </td>
                    </tr>

                  ) : (

                    students.map((student, index) => (

                      <tr key={student.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="student-info">

                            <div className="student-avatar">

                              {student.name
                                .split(" ")
                                .map((word) =>
                                  word.charAt(0)
                                )
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {student.name}
                              </strong>

                              <small>
                                Field Placement Student
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>
                          {student.registration}
                        </td>

                        <td>
                          {student.programme}
                        </td>

                        <td>

                          <div className="attendance-cell">

                            <span>
                              {student.attendance}
                            </span>

                            <div className="progress-bar">

                              <div
                                className="progress-fill"
                                style={{
                                  width:
                                    student.attendance
                                }}
                              ></div>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span
                            className={
                              student.status === "Completed"
                                ? "status active"
                                : "status warning"
                            }
                          >
                            {student.status}
                          </span>

                        </td>

                        <td>

                          {student.status === "Pending" ? (

                            <button
                              type="button"
                              className="fs-btn"
                              onClick={() => {
                                alert(
                                  `Evaluation form for ${student.name} will open here.`
                                );
                              }}
                            >
                              Evaluate
                            </button>

                          ) : (

                            <button
                              type="button"
                              className="fs-btn"
                              onClick={() => {
                                alert(
                                  `Viewing evaluation for ${student.name}.`
                                );
                              }}
                            >
                              View Evaluation
                            </button>

                          )}

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <section className="bottom-grid">

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h2>
                  Evaluation Summary
                </h2>

                <p>
                  Current evaluation progress
                </p>
              </div>

            </div>

            <div className="pending-list">

              <div className="pending-item">

                <div>
                  <strong>
                    Pending Evaluations
                  </strong>

                  <span>
                    {pendingEvaluations} students need evaluation
                  </span>
                </div>

              </div>

              <div className="pending-item">

                <div>
                  <strong>
                    Completed Evaluations
                  </strong>

                  <span>
                    {completedEvaluations} evaluation completed
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h2>
                  Evaluation Criteria
                </h2>

                <p>
                  Areas to consider during evaluation
                </p>
              </div>

            </div>

            <div className="pending-list">

              <div className="pending-item">

                <div>
                  <strong>
                    Technical Skills
                  </strong>

                  <span>
                    Student's technical knowledge and practical skills
                  </span>
                </div>

              </div>

              <div className="pending-item">

                <div>
                  <strong>
                    Professionalism
                  </strong>

                  <span>
                    Communication, teamwork and workplace behavior
                  </span>
                </div>

              </div>

              <div className="pending-item">

                <div>
                  <strong>
                    Time Management
                  </strong>

                  <span>
                    Attendance, punctuality and commitment
                  </span>
                </div>

              </div>

            </div>

          </div>

        </section>

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

export default Evaluation;