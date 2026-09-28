import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [user, setUser] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const currentUser = JSON.parse(
        localStorage.getItem("sfpms_user")
      );

      if (!currentUser?.id) {
        throw new Error(
          "Academic Supervisor account not found."
        );
      }

      setUser(currentUser);

      const assignments = await api.get(
        `/supervisor-assignment/supervisor/${currentUser.id}`
      );

      const academicAssignments =
        Array.isArray(assignments)
          ? assignments.filter(
              (item) =>
                item?.assignment?.role ===
                "ACADEMIC_SUPERVISOR"
            )
          : [];

      const studentList =
        academicAssignments.map(
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

              organization:
                "Not assigned",

              status:
                student.status ===
                "INACTIVE"
                  ? "Completed"
                  : "Active",
            };
          }
        );

      const logRequests =
        studentList.map(
          async (student) => {
            try {
              const response =
                await api.get(
                  `/daily-logs/?student_id=${student.userId}`
                );

              return Array.isArray(
                response
              )
                ? response
                : response?.logs || [];
            } catch {
              return [];
            }
          }
        );

      const logResults =
        await Promise.all(
          logRequests
        );

      const allLogs =
        logResults.flat();

      let remarkList = [];

      try {
        const response =
          await api.get(
            `/academic-remarks/?supervisor_id=${currentUser.id}`
          );

        remarkList =
          Array.isArray(response)
            ? response
            : response?.remarks || [];
      } catch {
        remarkList = [];
      }

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

            const studentRemark =
              remarkList.find(
                (remark) =>
                  Number(
                    remark.student_id
                  ) ===
                  Number(
                    student.userId
                  )
              );

            const submittedLogs =
              studentLogs.filter(
                (log) =>
                  String(
                    log.status
                  ).toUpperCase() !==
                  "PENDING"
              ).length;

            const pendingLogs =
              studentLogs.filter(
                (log) =>
                  String(
                    log.status
                  ).toUpperCase() ===
                  "PENDING"
              ).length;

            let status =
              student.status;

            if (
              pendingLogs >= 3 ||
              String(
                studentRemark?.rating ||
                ""
              ).toLowerCase() ===
                "needs improvement"
            ) {
              status =
                "Needs Attention";
            }

            const progress =
              studentLogs.length > 0
                ? Math.min(
                    100,
                    Math.round(
                      (submittedLogs /
                        studentLogs.length) *
                        100
                    )
                  )
                : 0;

            return {
              ...student,
              progress,
              status,
              totalLogs:
                studentLogs.length,
              pendingLogs,
              submittedLogs,
              remarkSubmitted:
                Boolean(
                  studentRemark?.submitted
                ),
            };
          }
        );

      setStudents(
        studentData
      );

      setLogs(
        allLogs
      );

      setRemarks(
        remarkList
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalStudents =
    students.length;

  const activeStudents =
    students.filter(
      (student) =>
        student.status ===
        "Active"
    ).length;

  const completedStudents =
    students.filter(
      (student) =>
        student.status ===
        "Completed"
    ).length;

  const pendingLogs =
    logs.filter(
      (log) =>
        String(
          log.status
        ).toUpperCase() ===
        "PENDING"
    ).length;

  const submittedLogs =
    logs.filter(
      (log) =>
        String(
          log.status
        ).toUpperCase() !==
        "PENDING"
    ).length;

  const needsAttention =
    students.filter(
      (student) =>
        student.status ===
        "Needs Attention"
    ).length;

  const getStatusBadge =
    (status) => {
      switch (status) {
        case "Active":
          return "badge bg-success";

        case "Completed":
          return "badge bg-primary";

        case "Needs Attention":
          return "badge bg-warning text-dark";

        default:
          return "badge bg-secondary";
      }
    };

  const supervisorName =
    user?.name ||
    "Academic Supervisor";

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
    <div className="dashboard">

      <aside className="sidebar">

        <div className="sidebar-header text-center">

          <img
            src="/image/egaz-logo.jpg"
            alt="E-GAZ"
            className="dashboard-logo"
          />

          <h5 className="fw-bold mt-2 mb-1">
            SFPM System
          </h5>

          <small className="text-muted">
            Academic Supervisor
          </small>

        </div>

        <nav className="sidebar-menu">

          <Link
            to="/academic-supervisor/dashboard"
            className="sidebar-link active"
          >
            Dashboard
          </Link>

          <Link
            to="/academic-supervisor/students"
            className="sidebar-link"
          >
            Assigned Students
          </Link>

          <Link
            to="/academic-supervisor/logs"
            className="sidebar-link"
          >
            Logs
          </Link>

          <Link
            to="/academic-supervisor/remarks"
            className="sidebar-link"
          >
            Academic Remarks
          </Link>

        </nav>

        <div className="sidebar-footer">

          <Link
            to="/login"
            className="sidebar-link text-danger"
          >
            Logout
          </Link>

        </div>

      </aside>

      <div className="dashboard-content">

        <div className="dashboard-navbar">

          <div>

            <h5 className="mb-0 fw-bold">
              Academic Supervisor Dashboard
            </h5>

            <small className="text-muted">
              Student Field Placement Management System
            </small>

          </div>

          <div className="d-flex align-items-center gap-3">

            <div className="text-end d-none d-md-block">

              <small className="d-block fw-semibold">
                {supervisorName}
              </small>

              <small className="text-muted">
                Academic Department
              </small>

            </div>

            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: "42px",
                height: "42px",
              }}
            >
              {initials}
            </div>

          </div>

        </div>

        <div className="container-fluid p-4">

          <div className="dashboard-card mb-4">

            <div className="row align-items-center">

              <div className="col-md-9">

                <h2 className="fw-bold mb-2">
                  Welcome, {supervisorName}
                </h2>

                <p className="text-muted mb-0">
                  Monitor assigned students,
                  review field logs and provide
                  academic remarks.
                </p>

              </div>

              <div className="col-md-3 text-md-end text-center mt-3 mt-md-0">

                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                ></span>

              </div>

            </div>

          </div>

          <div className="row g-4">

            <div className="col-md-6 col-xl-4">

              <div className="stat-card h-100">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <small className="text-muted">
                      Assigned Students
                    </small>

                    <h3 className="fw-bold mt-2 mb-0">
                      {loading
                        ? "..."
                        : totalStudents}
                    </h3>

                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  ></div>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-xl-4">

              <div className="stat-card h-100">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <small className="text-muted">
                      Active Students
                    </small>

                    <h3 className="fw-bold mt-2 mb-0">
                      {loading
                        ? "..."
                        : activeStudents}
                    </h3>

                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#16a34a",
                    }}
                  ></div>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-xl-4">

              <div className="stat-card h-100">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <small className="text-muted">
                      Completed Students
                    </small>

                    <h3 className="fw-bold mt-2 mb-0">
                      {loading
                        ? "..."
                        : completedStudents}
                    </h3>

                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#15803d",
                    }}
                  ></div>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-xl-4">

              <div className="stat-card h-100">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <small className="text-muted">
                      Pending Logs
                    </small>

                    <h3 className="fw-bold mt-2 mb-0">
                      {loading
                        ? "..."
                        : pendingLogs}
                    </h3>

                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#d97706",
                    }}
                  ></div>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-xl-4">

              <div className="stat-card h-100">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <small className="text-muted">
                      Submitted Logs
                    </small>

                    <h3 className="fw-bold mt-2 mb-0">
                      {loading
                        ? "..."
                        : submittedLogs}
                    </h3>

                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  ></div>

                </div>

              </div>

            </div>

            <div className="col-md-6 col-xl-4">

              <div className="stat-card h-100">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <small className="text-muted">
                      Needs Attention
                    </small>

                    <h3 className="fw-bold mt-2 mb-0">
                      {loading
                        ? "..."
                        : needsAttention}
                    </h3>

                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#dc2626",
                    }}
                  ></div>

                </div>

              </div>

            </div>

          </div>

          <div className="dashboard-card mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>

                <h5 className="fw-bold mb-1">
                  Student Progress
                </h5>

                <small className="text-muted">
                  Recently monitored students
                </small>

              </div>

              <Link
                to="/academic-supervisor/students"
                className="btn btn-outline-primary btn-sm"
              >
                View All
              </Link>

            </div>

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      Student ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Programme
                    </th>

                    <th>
                      Organization
                    </th>

                    <th>
                      Progress
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
                        colSpan="6"
                        className="text-center py-4"
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

                              <strong>
                                {student.id}
                              </strong>

                            </td>

                            <td>

                              <div className="fw-semibold">
                                {student.name}
                              </div>

                            </td>

                            <td>
                              {student.programme}
                            </td>

                            <td>
                              {student.organization}
                            </td>

                            <td>

                              <div
                                className="d-flex align-items-center gap-2"
                                style={{
                                  minWidth:
                                    "130px",
                                }}
                              >

                                <div
                                  className="progress flex-grow-1"
                                  style={{
                                    height:
                                      "7px",
                                  }}
                                >

                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                      width: `${student.progress}%`,
                                    }}
                                    aria-valuenow={
                                      student.progress
                                    }
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>

                                </div>

                                <small className="fw-semibold">
                                  {
                                    student.progress
                                  }
                                  %
                                </small>

                              </div>

                            </td>

                            <td>

                              <span
                                className={getStatusBadge(
                                  student.status
                                )}
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
                        colSpan="6"
                        className="text-center py-4"
                      >
                        No students assigned to you.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          <div className="dashboard-card mt-4">

            <div className="mb-4">

              <h5 className="fw-bold mb-1">
                Quick Actions
              </h5>

              <small className="text-muted">
                Quickly access your main supervisor activities.
              </small>

            </div>

            <div className="row g-3">

              <div className="col-md-4">

                <Link
                  to="/academic-supervisor/students"
                  className="text-decoration-none"
                >

                  <div className="border rounded p-4 h-100">

                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#1d4ed8",
                      }}
                      className="mb-3"
                    ></div>

                    <h6 className="fw-bold">
                      View Students
                    </h6>

                    <small className="text-muted">
                      Manage assigned students
                    </small>

                  </div>

                </Link>

              </div>

              <div className="col-md-4">

                <Link
                  to="/academic-supervisor/logs"
                  className="text-decoration-none"
                >

                  <div className="border rounded p-4 h-100">

                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#1d4ed8",
                      }}
                      className="mb-3"
                    ></div>

                    <h6 className="fw-bold">
                      Review Logs
                    </h6>

                    <small className="text-muted">
                      Review student field logs
                    </small>

                  </div>

                </Link>

              </div>

              <div className="col-md-4">

                <Link
                  to="/academic-supervisor/remarks"
                  className="text-decoration-none"
                >

                  <div className="border rounded p-4 h-100">

                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#1d4ed8",
                      }}
                      className="mb-3"
                    ></div>

                    <h6 className="fw-bold">
                      Academic Remarks
                    </h6>

                    <small className="text-muted">
                      Evaluate student progress
                    </small>

                  </div>

                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;


