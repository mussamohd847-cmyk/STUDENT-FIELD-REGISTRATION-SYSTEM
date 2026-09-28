import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Acc-super.css";

function Logs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const savedUser = localStorage.getItem("sfpms_user");

      if (!savedUser) {
        setError("Academic Supervisor is not logged in.");
        return;
      }

      const user = JSON.parse(savedUser);

      if (!user.id) {
        setError("Supervisor information is missing.");
        return;
      }

      const assignmentResponse = await api.get(
        `/supervisor-assignment/supervisor/${user.id}`
      );

      const assignments = Array.isArray(assignmentResponse)
        ? assignmentResponse
        : assignmentResponse?.data || [];

      const assignedStudents = assignments
        .filter(
          (item) =>
            item?.assignment?.role === "ACADEMIC_SUPERVISOR" ||
            item?.role === "ACADEMIC_SUPERVISOR"
        )
        .map((item) => {
          const student = item.student || {};

          return {
            id: student.id || item.student_id,
            name: student.name || "Unknown Student",
            institutional_id:
              student.institutional_id || "No ID",
            programme: student.programme || "",
            email: student.email || "",
          };
        })
        .filter((student) => student.id);

      if (assignedStudents.length === 0) {
        setLogs([]);
        return;
      }

      const logResponses = await Promise.all(
        assignedStudents.map(async (student) => {
          try {
            const response = await api.get(
              `/daily-logs/?student_id=${student.id}`
            );

            const studentLogs = Array.isArray(response)
              ? response
              : response?.data || [];

            return studentLogs.map((log) => ({
              ...log,
              studentId:
                log.student_institutional_id ||
                student.institutional_id,
              student:
                log.student_name ||
                student.name,
              date:
                log.log_date ||
                "",
              activities:
                log.activity ||
                "",
              skills:
                log.skills ||
                "Not provided",
              challenges:
                log.challenges ||
                "Not provided",
              reflection:
                log.reflection ||
                "Not provided",
              status:
                String(log.status || "PENDING").toUpperCase() ===
                "APPROVED"
                  ? "Approved"
                  : String(log.status || "PENDING").toUpperCase() ===
                    "REJECTED"
                  ? "Correction Required"
                  : "Pending Review",
              rawStatus:
                log.status || "PENDING",
              signInTime:
                log.sign_in_time || null,
              signOutTime:
                log.sign_out_time || null,
              attachment:
                log.attachment_url || null,
              programme:
                student.programme || "",
            }));
          } catch (err) {
            console.error(
              `Failed to load logs for student ${student.id}`,
              err
            );

            return [];
          }
        })
      );

      const allLogs = logResponses.flat();

      allLogs.sort((a, b) => {
        return (
          new Date(b.date || "1900-01-01") -
          new Date(a.date || "1900-01-01")
        );
      });

      setLogs(allLogs);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load student logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return logs.filter((log) => {
      const searchMatch =
        log.student.toLowerCase().includes(searchValue) ||
        log.studentId.toLowerCase().includes(searchValue) ||
        log.activities.toLowerCase().includes(searchValue) ||
        log.skills.toLowerCase().includes(searchValue);

      const statusMatch =
        statusFilter === "All" ||
        log.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [logs, search, statusFilter]);

  const updateLogStatus = async (log, status) => {
    try {
      const backendStatus =
        status === "Approved"
          ? "APPROVED"
          : "REJECTED";

      await api.put(
        `/daily-logs/${log.id}`,
        {
          status: backendStatus,
        }
      );

      setLogs((currentLogs) =>
        currentLogs.map((item) =>
          item.id === log.id
            ? {
                ...item,
                status,
                rawStatus: backendStatus,
              }
            : item
        )
      );

      setSelectedLog(null);
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update log status."
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "badge bg-success";

      case "Correction Required":
        return "badge bg-danger";

      case "Pending Review":
        return "badge bg-warning text-dark";

      default:
        return "badge bg-secondary";
    }
  };

  const totalLogs = logs.length;

  const pendingLogs = logs.filter(
    (log) => log.status === "Pending Review"
  ).length;

  const approvedLogs = logs.filter(
    (log) => log.status === "Approved"
  ).length;

  const correctionLogs = logs.filter(
    (log) => log.status === "Correction Required"
  ).length;

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
            className="sidebar-link"
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
            className="sidebar-link active"
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
              Student Field Logs
            </h5>

            <small className="text-muted">
              Review and monitor student daily logs
            </small>

          </div>

          <div className="d-flex align-items-center gap-3">

            <div className="text-end d-none d-md-block">

              <small className="d-block fw-semibold">
                Academic Supervisor
              </small>

              <small className="text-muted">
                Supervisor
              </small>

            </div>

            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: "42px",
                height: "42px",
              }}
            >
              AS
            </div>

          </div>

        </div>

        <div className="container-fluid p-4">

          <div className="mb-4">

            <h2 className="fw-bold mb-1">
              Student Logs
            </h2>

            <p className="text-muted mb-0">
              Review submitted daily field activities and provide
              feedback.
            </p>

          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="row g-4">

            <div className="col-md-6 col-xl-3">

              <div className="stat-card h-100">

                <small className="text-muted">
                  Total Logs
                </small>

                <h3 className="fw-bold mt-2 mb-0">
                  {totalLogs}
                </h3>

              </div>

            </div>

            <div className="col-md-6 col-xl-3">

              <div className="stat-card h-100">

                <small className="text-muted">
                  Pending Review
                </small>

                <h3 className="fw-bold mt-2 mb-0">
                  {pendingLogs}
                </h3>

              </div>

            </div>

            <div className="col-md-6 col-xl-3">

              <div className="stat-card h-100">

                <small className="text-muted">
                  Approved
                </small>

                <h3 className="fw-bold mt-2 mb-0">
                  {approvedLogs}
                </h3>

              </div>

            </div>

            <div className="col-md-6 col-xl-3">

              <div className="stat-card h-100">

                <small className="text-muted">
                  Correction Required
                </small>

                <h3 className="fw-bold mt-2 mb-0">
                  {correctionLogs}
                </h3>

              </div>

            </div>

          </div>

          <div className="dashboard-card mt-4">

            <div className="row g-3 align-items-end">

              <div className="col-md-8">

                <label className="form-label fw-semibold">
                  Search Logs
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student, ID, activity or skill..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Filter by Status
                </label>

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >

                  <option value="All">
                    All Logs
                  </option>

                  <option value="Pending Review">
                    Pending Review
                  </option>

                  <option value="Approved">
                    Approved
                  </option>

                  <option value="Correction Required">
                    Correction Required
                  </option>

                </select>

              </div>

            </div>

          </div>

          <div className="dashboard-card mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>

                <h5 className="fw-bold mb-1">
                  Student Logs
                </h5>

                <small className="text-muted">
                  Review submitted daily field activities.
                </small>

              </div>

              <div className="d-flex gap-2">

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={loadLogs}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>

                <span className="badge bg-primary">
                  {filteredLogs.length} Logs
                </span>

              </div>

            </div>

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Activities
                    </th>

                    <th>
                      Skills
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="text-center py-5"
                      >
                        Loading student logs...
                      </td>

                    </tr>

                  ) : filteredLogs.length > 0 ? (

                    filteredLogs.map((log) => (

                      <tr key={log.id}>

                        <td>

                          <div className="fw-semibold">
                            {log.student}
                          </div>

                          <small className="text-muted">
                            {log.studentId}
                          </small>

                        </td>

                        <td>

                          <span className="text-muted">
                            {log.date}
                          </span>

                        </td>

                        <td>

                          <div
                            style={{
                              maxWidth: "280px",
                              whiteSpace: "normal",
                            }}
                          >
                            {log.activities}
                          </div>

                        </td>

                        <td>

                          <div
                            style={{
                              maxWidth: "230px",
                              whiteSpace: "normal",
                            }}
                          >
                            {log.skills}
                          </div>

                        </td>

                        <td>

                          <span
                            className={getStatusBadge(
                              log.status
                            )}
                          >
                            {log.status}
                          </span>

                        </td>

                        <td className="text-center">

                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              setSelectedLog(log)
                            }
                          >
                            Review
                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="6"
                        className="text-center py-5"
                      >

                        <h6 className="fw-bold">
                          No Logs Found
                        </h6>

                        <p className="text-muted mb-0">
                          No student logs match your search
                          or filter.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

      {selectedLog && (

        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            zIndex: 1055,
          }}
          onClick={() => setSelectedLog(null)}
        >

          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-content">

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">
                    Review Student Log
                  </h5>

                  <small className="text-muted">
                    {selectedLog.student} —{" "}
                    {selectedLog.studentId}
                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedLog(null)
                  }
                  aria-label="Close"
                />

              </div>

              <div className="modal-body">

                <div className="row g-3 mb-4">

                  <div className="col-md-6">

                    <div className="border rounded p-3 h-100">

                      <small className="text-muted d-block mb-1">
                        Student
                      </small>

                      <strong>
                        {selectedLog.student}
                      </strong>

                      <div className="small text-muted mt-1">
                        {selectedLog.studentId}
                      </div>

                    </div>

                  </div>

                  <div className="col-md-6">

                    <div className="border rounded p-3 h-100">

                      <small className="text-muted d-block mb-1">
                        Date
                      </small>

                      <strong>
                        {selectedLog.date}
                      </strong>

                    </div>

                  </div>

                </div>

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Current Status
                  </label>

                  <div>

                    <span
                      className={getStatusBadge(
                        selectedLog.status
                      )}
                    >
                      {selectedLog.status}
                    </span>

                  </div>

                </div>

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Activities
                  </label>

                  <div className="bg-light border rounded p-3">
                    {selectedLog.activities}
                  </div>

                </div>

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Skills Learned
                  </label>

                  <div className="bg-light border rounded p-3">
                    {selectedLog.skills}
                  </div>

                </div>

                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Challenges
                  </label>

                  <div className="bg-light border rounded p-3">
                    {selectedLog.challenges}
                  </div>

                </div>

                <div className="mb-2">

                  <label className="form-label fw-bold">
                    Student Reflection
                  </label>

                  <div className="bg-light border rounded p-3">
                    {selectedLog.reflection}
                  </div>

                </div>

                {selectedLog.attachment && (
                  <div className="mt-4">

                    <label className="form-label fw-bold">
                      Attachment
                    </label>

                    <div>

                      <a
                        href={selectedLog.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        View Attachment
                      </a>

                    </div>

                  </div>
                )}

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    updateLogStatus(
                      selectedLog,
                      "Approved"
                    )
                  }
                >
                  Approve Log
                </button>

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() =>
                    updateLogStatus(
                      selectedLog,
                      "Correction Required"
                    )
                  }
                >
                  ↻ Request Correction
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setSelectedLog(null)
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Logs;


