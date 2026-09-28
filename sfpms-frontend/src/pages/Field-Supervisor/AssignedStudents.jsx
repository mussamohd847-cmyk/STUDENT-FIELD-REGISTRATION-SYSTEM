import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./field-supervisor.css";
import api from "../../services/api";

function AssignedStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("sfpms_user") || "null"
  );

  useEffect(() => {
    const loadAssignedStudents = async () => {
      try {
        setLoading(true);
        setError("");

        if (!currentUser?.id) {
          navigate("/login");
          return;
        }

        const response = await api.get(
          `/supervisor-assignment/supervisor/${currentUser.id}`
        );

        const assignedStudents = Array.isArray(response)
          ? response
              .filter(
                (item) =>
                  item?.assignment?.role === "FIELD_SUPERVISOR"
              )
              .map((item) => ({
                id: item.student?.id,
                name: item.student?.name || "Unknown Student",
                registration:
                  item.student?.institutional_id || "N/A",
                organization:
                  "e-Government Authority of Zanzibar",
                programme:
                  item.student?.programme || "N/A",
                status:
                  item.student?.status === "ACTIVE"
                    ? "Active"
                    : "Inactive",
              }))
          : [];

        setStudents(assignedStudents);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Failed to load assigned students."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssignedStudents();
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
            to="/field-supervisor/assignment"
            className="menu-item active"
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
            className="menu-item"
          >
            <span>Evaluation</span>
            <span className="menu-badge">8</span>
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
              Field Supervisor / Assigned Students
            </div>

            <h1>
              Assigned Students
            </h1>

            <p>
              View students currently assigned to eGAZ.
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
              ASSIGNED STUDENTS
            </span>

            <strong>
              {students.length} Students
            </strong>

          </div>

        </section>

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

            <span className="view-all-btn">
              Total: {students.length}
            </span>

          </div>

          {loading && (
            <div className="table-container">
              <p style={{ padding: "20px" }}>
                Loading assigned students...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="table-container">
              <p style={{ padding: "20px", color: "red" }}>
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
                    <th>Organization</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {students.length === 0 ? (

                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "30px"
                        }}
                      >
                        No students assigned yet.
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
                                {student.programme}
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
                          {student.organization}
                        </td>

                        <td>

                          <span
                            className={
                              student.status === "Active"
                                ? "status active"
                                : "status warning"
                            }
                          >
                            {student.status}
                          </span>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>
          )}

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

export default AssignedStudents;


