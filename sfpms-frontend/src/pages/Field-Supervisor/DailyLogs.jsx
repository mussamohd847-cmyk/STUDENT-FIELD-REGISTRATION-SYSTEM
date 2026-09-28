import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./field-supervisor.css";
import api from "../../services/api";

function DailyLogs() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const [bulkReviewing, setBulkReviewing] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("sfpms_user") || "null"
  );

  const loadDailyLogs = async () => {
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

      const studentIds = fieldAssignments
        .map((item) => item?.student?.id)
        .filter(Boolean);

      if (studentIds.length === 0) {
        setLogs([]);
        setSelectedLogs([]);
        return;
      }

      const responses = await Promise.all(
        studentIds.map(async (studentId) => {
          try {
            const response = await api.get(
              `/daily-logs/?student_id=${studentId}`
            );

            return Array.isArray(response)
              ? response
              : response?.logs || [];
          } catch (err) {
            console.error(
              `Failed to load logs for student ${studentId}`,
              err
            );

            return [];
          }
        })
      );

      const allLogs = responses.flat();

      allLogs.sort((a, b) => {
        const dateA = new Date(
          `${a.log_date || "1900-01-01"} ${
            a.sign_in_time || "00:00:00"
          }`
        );

        const dateB = new Date(
          `${b.log_date || "1900-01-01"} ${
            b.sign_in_time || "00:00:00"
          }`
        );

        return dateB - dateA;
      });

      setLogs(allLogs);

      setSelectedLogs((currentSelected) =>
        currentSelected.filter((id) =>
          allLogs.some(
            (log) =>
              log.id === id &&
              String(log.status || "").toUpperCase() ===
                "PENDING"
          )
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to load daily logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyLogs();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("sfpms_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  };

  const pendingLogs = logs.filter(
    (log) =>
      String(log.status || "").toUpperCase() ===
      "PENDING"
  );

  const approvedLogs = logs.filter(
    (log) =>
      String(log.status || "").toUpperCase() ===
      "APPROVED"
  );

  const rejectedLogs = logs.filter(
    (log) =>
      String(log.status || "").toUpperCase() ===
      "REJECTED"
  );

  const allPendingSelected =
    pendingLogs.length > 0 &&
    pendingLogs.every((log) =>
      selectedLogs.includes(log.id)
    );

  const handleSelectLog = (logId) => {
    setSelectedLogs((currentSelected) => {
      if (currentSelected.includes(logId)) {
        return currentSelected.filter(
          (id) => id !== logId
        );
      }

      return [...currentSelected, logId];
    });
  };

  const handleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedLogs([]);
      return;
    }

    setSelectedLogs(
      pendingLogs.map((log) => log.id)
    );
  };

  const handleReview = async (status) => {
    if (!selectedLog) {
      return;
    }

    const action =
      status === "APPROVED"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this daily log?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setReviewing(true);

      const response = await api.put(
        `/daily-logs/${selectedLog.id}/review`,
        {
          status
        }
      );

      const updatedLog = response.log;

      setLogs((currentLogs) =>
        currentLogs.map((log) =>
          log.id === updatedLog.id
            ? updatedLog
            : log
        )
      );

      setSelectedLogs((currentSelected) =>
        currentSelected.filter(
          (id) => id !== updatedLog.id
        )
      );

      setSelectedLog(null);

      alert(
        status === "APPROVED"
          ? "Daily log approved successfully."
          : "Daily log rejected successfully."
      );
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to update daily log status."
      );
    } finally {
      setReviewing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedLogs.length === 0) {
      alert("Please select at least one pending log.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve ${selectedLogs.length} selected daily log(s)?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setBulkReviewing(true);

      const results = await Promise.allSettled(
        selectedLogs.map((logId) =>
          api.put(
            `/daily-logs/${logId}/review`,
            {
              status: "APPROVED"
            }
          )
        )
      );

      const successfulLogs = results
        .filter(
          (result) =>
            result.status === "fulfilled" &&
            result.value?.log
        )
        .map(
          (result) => result.value.log
        );

      const successfulIds = successfulLogs.map(
        (log) => log.id
      );

      setLogs((currentLogs) =>
        currentLogs.map((log) => {
          const updatedLog =
            successfulLogs.find(
              (item) => item.id === log.id
            );

          return updatedLog || log;
        })
      );

      setSelectedLogs([]);

      const failedCount =
        results.length - successfulLogs.length;

      if (failedCount === 0) {
        alert(
          `${successfulLogs.length} daily log(s) approved successfully.`
        );
      } else {
        alert(
          `${successfulLogs.length} log(s) approved successfully. ${failedCount} log(s) failed.`
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to approve selected logs."
      );
    } finally {
      setBulkReviewing(false);
    }
  };

  const getStatusLabel = (status) => {
    const normalized = String(
      status || ""
    ).toUpperCase();

    if (normalized === "APPROVED") {
      return "Approved";
    }

    if (normalized === "REJECTED") {
      return "Rejected";
    }

    return "Pending";
  };

  const getStatusClass = (status) => {
    const normalized = String(
      status || ""
    ).toUpperCase();

    if (normalized === "APPROVED") {
      return "status active";
    }

    if (normalized === "REJECTED") {
      return "status danger";
    }

    return "status warning";
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
            to="/field-supervisor/students"
            className="menu-item"
          >
            <span>Assigned Students</span>
          </Link>

          <Link
            to="/field-supervisor/logs"
            className="menu-item active"
          >
            <span>Daily Logs</span>

            <span className="menu-badge">
              {pendingLogs.length}
            </span>
          </Link>

          <Link
            to="/field-supervisor/evaluation"
            className="menu-item"
          >
            <span>Evaluation</span>
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
              Field Supervisor / Daily Logs
            </div>

            <h1>
              Daily Logs
            </h1>

            <p>
              Review and manage daily field placement logs submitted by students.
            </p>

          </div>

          <div className="header-actions">

            <button
              type="button"
              className="icon-button"
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
              LOGS SUBMITTED
            </span>

            <strong>
              {logs.length} Logs
            </strong>

          </div>

        </section>

        <section className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                Daily Logs
              </h2>

              <p>
                Review daily activities submitted by assigned students
              </p>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center"
              }}
            >

              {selectedLogs.length > 0 && (

                <button
                  type="button"
                  onClick={handleBulkApprove}
                  disabled={bulkReviewing}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#fff",
                    cursor: bulkReviewing
                      ? "not-allowed"
                      : "pointer",
                    opacity: bulkReviewing ? 0.6 : 1,
                    fontWeight: 600
                  }}
                >
                  {bulkReviewing
                    ? "Approving..."
                    : `Approve Selected (${selectedLogs.length})`}
                </button>

              )}

              <span className="view-all-btn">
                Total: {logs.length}
              </span>

            </div>

          </div>

          {!loading && !error && pendingLogs.length > 0 && (

            <div
              style={{
                padding: "14px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >

              <input
                type="checkbox"
                checked={allPendingSelected}
                onChange={handleSelectAll}
                disabled={bulkReviewing}
                style={{
                  width: "17px",
                  height: "17px",
                  cursor: "pointer"
                }}
              />

              <strong>
                Select All Pending Logs
              </strong>

              <span
                style={{
                  color: "#6b7280"
                }}
              >
                {pendingLogs.length} pending
              </span>

            </div>

          )}

          {loading && (

            <div className="table-container">

              <p style={{ padding: "20px" }}>
                Loading daily logs...
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

                    <th>
                      <input
                        type="checkbox"
                        checked={
                          allPendingSelected
                        }
                        onChange={
                          handleSelectAll
                        }
                        disabled={
                          pendingLogs.length === 0 ||
                          bulkReviewing
                        }
                        style={{
                          width: "17px",
                          height: "17px"
                        }}
                      />
                    </th>

                    <th>#</th>

                    <th>
                      Student
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Activity
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {logs.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "30px"
                        }}
                      >
                        No daily logs submitted by assigned students yet.
                      </td>

                    </tr>

                  ) : (

                    logs.map((log, index) => {

                      const isPending =
                        String(
                          log.status || ""
                        ).toUpperCase() ===
                        "PENDING";

                      const isSelected =
                        selectedLogs.includes(
                          log.id
                        );

                      return (

                        <tr key={log.id}>

                          <td>

                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                handleSelectLog(
                                  log.id
                                )
                              }
                              disabled={
                                !isPending ||
                                bulkReviewing
                              }
                              style={{
                                width: "17px",
                                height: "17px",
                                cursor:
                                  isPending
                                    ? "pointer"
                                    : "not-allowed"
                              }}
                            />

                          </td>

                          <td>
                            {index + 1}
                          </td>

                          <td>

                            <div className="student-info">

                              <div className="student-avatar">

                                {(log.student_name ||
                                  "Unknown Student")
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
                                  {log.student_name ||
                                    "Unknown Student"}
                                </strong>

                                <small>
                                  {log.institutional_id ||
                                    "Field Placement Student"}
                                </small>

                              </div>

                            </div>

                          </td>

                          <td>
                            {log.log_date || "N/A"}
                          </td>

                          <td>
                            {log.activity ||
                              "No activity"}
                          </td>

                          <td>

                            <span
                              className={getStatusClass(
                                log.status
                              )}
                            >
                              {getStatusLabel(
                                log.status
                              )}
                            </span>

                          </td>

                          <td>

                            <button
                              type="button"
                              className="fs-btn"
                              onClick={() =>
                                setSelectedLog(
                                  log
                                )
                              }
                            >
                              {isPending
                                ? "Review"
                                : "View"}
                            </button>

                          </td>

                        </tr>

                      );
                    })

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
                  Log Summary
                </h2>

                <p>
                  Current daily log status
                </p>

              </div>

            </div>

            <div className="pending-list">

              <div className="pending-item">

                <div>

                  <strong>
                    Pending Logs
                  </strong>

                  <span>
                    {pendingLogs.length} logs waiting for review
                  </span>

                </div>

              </div>

              <div className="pending-item">

                <div>

                  <strong>
                    Approved Logs
                  </strong>

                  <span>
                    {approvedLogs.length} logs approved
                  </span>

                </div>

              </div>

              <div className="pending-item">

                <div>

                  <strong>
                    Rejected Logs
                  </strong>

                  <span>
                    {rejectedLogs.length} logs rejected
                  </span>

                </div>

              </div>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Bulk Review
                </h2>

                <p>
                  Manage multiple student logs at once
                </p>

              </div>

            </div>

            <div className="pending-list">

              <div className="pending-item">

                <div>

                  <strong>
                    Select Pending Logs
                  </strong>

                  <span>
                    Select individual logs or use Select All.
                  </span>

                </div>

              </div>

              <div className="pending-item">

                <div>

                  <strong>
                    Approve Selected
                  </strong>

                  <span>
                    Approve multiple pending logs with one action.
                  </span>

                </div>

              </div>

              <div className="pending-item">

                <div>

                  <strong>
                    Review Rejected Logs
                  </strong>

                  <span>
                    Rejected logs remain available for viewing.
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

      {selectedLog && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => {
            if (!reviewing) {
              setSelectedLog(null);
            }
          }}
        >

          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "14px",
              padding: "28px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.2)"
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}
            >

              <div>

                <h2 style={{ margin: 0 }}>
                  Daily Log Review
                </h2>

                <p
                  style={{
                    marginTop: "6px",
                    color: "#6b7280"
                  }}
                >
                  Review student's submitted field placement activity.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLog(null)
                }
                disabled={reviewing}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "16px",
                marginBottom: "22px"
              }}
            >

              <div>

                <small
                  style={{
                    color: "#6b7280"
                  }}
                >
                  Student
                </small>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px"
                  }}
                >
                  {selectedLog.student_name ||
                    "Unknown Student"}
                </strong>

              </div>

              <div>

                <small
                  style={{
                    color: "#6b7280"
                  }}
                >
                  Registration No.
                </small>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px"
                  }}
                >
                  {selectedLog.institutional_id ||
                    "N/A"}
                </strong>

              </div>

              <div>

                <small
                  style={{
                    color: "#6b7280"
                  }}
                >
                  Date
                </small>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px"
                  }}
                >
                  {selectedLog.log_date ||
                    "N/A"}
                </strong>

              </div>

              <div>

                <small
                  style={{
                    color: "#6b7280"
                  }}
                >
                  Status
                </small>

                <div
                  style={{
                    marginTop: "5px"
                  }}
                >

                  <span
                    className={getStatusClass(
                      selectedLog.status
                    )}
                  >
                    {getStatusLabel(
                      selectedLog.status
                    )}
                  </span>

                </div>

              </div>

              <div>

                <small
                  style={{
                    color: "#6b7280"
                  }}
                >
                  Sign In
                </small>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px"
                  }}
                >
                  {selectedLog.sign_in_time ||
                    "Not recorded"}
                </strong>

              </div>

              <div>

                <small
                  style={{
                    color: "#6b7280"
                  }}
                >
                  Sign Out
                </small>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px"
                  }}
                >
                  {selectedLog.sign_out_time ||
                    "Not recorded"}
                </strong>

              </div>

            </div>

            <div
              style={{
                marginBottom: "22px"
              }}
            >

              <small
                style={{
                  color: "#6b7280"
                }}
              >
                Activity
              </small>

              <div
                style={{
                  marginTop: "8px",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  lineHeight: "1.6"
                }}
              >
                {selectedLog.activity ||
                  "No activity provided."}
              </div>

            </div>

            {selectedLog.attachment_url && (

              <div
                style={{
                  marginBottom: "22px"
                }}
              >

                <small
                  style={{
                    color: "#6b7280"
                  }}
                >
                  Attachment
                </small>

                <div
                  style={{
                    marginTop: "8px"
                  }}
                >

                  <a
                    href={`http://localhost:5000${selectedLog.attachment_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="fs-btn"
                    style={{
                      display: "inline-block",
                      textDecoration: "none"
                    }}
                  >
                    View Attachment
                  </a>

                </div>

              </div>

            )}

            {String(
              selectedLog.status || ""
            ).toUpperCase() === "PENDING" ? (

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "25px"
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    handleReview("REJECTED")
                  }
                  disabled={reviewing}
                  style={{
                    padding: "11px 22px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#e74c3c",
                    color: "#fff",
                    cursor: reviewing
                      ? "not-allowed"
                      : "pointer",
                    opacity: reviewing ? 0.6 : 1
                  }}
                >
                  {reviewing
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleReview("APPROVED")
                  }
                  disabled={reviewing}
                  style={{
                    padding: "11px 22px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#fff",
                    cursor: reviewing
                      ? "not-allowed"
                      : "pointer",
                    opacity: reviewing ? 0.6 : 1
                  }}
                >
                  {reviewing
                    ? "Processing..."
                    : "Approve"}
                </button>

              </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "25px"
                }}
              >

                <button
                  type="button"
                  className="fs-btn"
                  onClick={() =>
                    setSelectedLog(null)
                  }
                >
                  Close
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default DailyLogs;


