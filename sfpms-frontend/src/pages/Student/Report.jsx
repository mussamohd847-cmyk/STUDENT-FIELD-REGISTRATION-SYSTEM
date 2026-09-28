import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

const API_URL = "http://localhost:5000/api";

function Reports() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [reports, setReports] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [reportType, setReportType] = useState("DAILY");
  const [reportDate, setReportDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportMonth, setReportMonth] = useState("");

  const [reportLogs, setReportLogs] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("sfpms_user");

    if (!storedUser) {
      setError("Student information not found.");
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      setReportDate(`${year}-${month}-${day}`);
      setFromDate(`${year}-${month}-${day}`);
      setToDate(`${year}-${month}-${day}`);
      setReportMonth(`${year}-${month}`);

      loadReportsData(parsedUser.id);
    } catch {
      setError("Unable to load student information.");
      setLoading(false);
    }
  }, []);

  const loadReportsData = async (studentId) => {
    try {
      setLoading(true);
      setError("");

      const [logsResponse, placementResponse, reportsResponse] =
        await Promise.all([
          fetch(`${API_URL}/daily-logs/?student_id=${studentId}`),
          fetch(`${API_URL}/placements/?student_id=${studentId}`),
          fetch(`${API_URL}/reports/?student_id=${studentId}`)
        ]);

      if (!logsResponse.ok) {
        throw new Error("Failed to load daily logs.");
      }

      if (!placementResponse.ok) {
        throw new Error("Failed to load placement.");
      }

      if (!reportsResponse.ok) {
        throw new Error("Failed to load reports.");
      }

      const logsData = await logsResponse.json();
      const placementData = await placementResponse.json();
      const reportsData = await reportsResponse.json();

      const realLogs = Array.isArray(logsData) ? logsData : [];

      realLogs.sort((a, b) => {
        return String(a.log_date || "").localeCompare(
          String(b.log_date || "")
        );
      });

      setLogs(realLogs);

      const activePlacement = Array.isArray(placementData)
        ? placementData.find(
            (item) =>
              String(item.status || "").toUpperCase() === "ACTIVE"
          ) || placementData[0]
        : null;

      setPlacement(activePlacement || null);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (err) {
      setError(err.message || "Failed to load reports data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "--";

    const value = String(date).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) {
      return date;
    }

    const [year, month, day] = parts;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    const monthIndex = Number(month) - 1;

    if (
      Number.isNaN(monthIndex) ||
      monthIndex < 0 ||
      monthIndex > 11
    ) {
      return date;
    }

    return `${day} ${monthNames[monthIndex]} ${year}`;
  };

  const formatTime = (time) => {
    if (!time) return "--";

    const value = String(time);

    if (value.includes("AM") || value.includes("PM")) {
      return value;
    }

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return value;
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${String(displayHour).padStart(2, "0")}:${minutes} ${suffix}`;
  };

  const calculateProgress = () => {
    if (!placement?.start_date || !placement?.end_date) {
      return 0;
    }

    const start = new Date(placement.start_date);
    const end = new Date(placement.end_date);
    const today = new Date();

    const total = end - start;
    const elapsed = today - start;

    if (total <= 0) {
      return 0;
    }

    const progress = Math.round((elapsed / total) * 100);

    return Math.min(100, Math.max(0, progress));
  };

  const getCompletedLogs = () => {
    return logs.filter(
      (log) =>
        log.sign_in_time &&
        log.sign_out_time
    ).length;
  };

  const getApprovedLogs = () => {
    return logs.filter(
      (log) =>
        String(log.status || "").toUpperCase() === "APPROVED"
    ).length;
  };

  const getPendingLogs = () => {
    return logs.filter((log) => {
      const status = String(
        log.status || "PENDING"
      ).toUpperCase();

      return (
        status === "PENDING" ||
        status === "UNDER_REVIEW"
      );
    }).length;
  };

  const getRejectedLogs = () => {
    return logs.filter(
      (log) =>
        String(log.status || "").toUpperCase() === "REJECTED"
    ).length;
  };

  const getReportRange = () => {
    if (reportType === "DAILY") {
      if (!reportDate) {
        return null;
      }

      return {
        start: reportDate,
        end: reportDate
      };
    }

    if (reportType === "WEEKLY") {
      if (!fromDate || !toDate) {
        return null;
      }

      return {
        start: fromDate,
        end: toDate
      };
    }

    if (reportType === "MONTHLY") {
      if (!reportMonth) {
        return null;
      }

      const parts = reportMonth.split("-");

      if (parts.length !== 2) {
        return null;
      }

      const year = Number(parts[0]);
      const month = Number(parts[1]);

      const lastDay = new Date(
        year,
        month,
        0
      ).getDate();

      return {
        start: `${year}-${String(month).padStart(2, "0")}-01`,
        end: `${year}-${String(month).padStart(2, "0")}-${String(
          lastDay
        ).padStart(2, "0")}`
      };
    }

    return null;
  };

  const generateReport = () => {
    setError("");
    setMessage("");

    const range = getReportRange();

    if (!range) {
      setError("Please select the required date.");
      return;
    }

    if (range.end < range.start) {
      setError("To Date cannot be before From Date.");
      return;
    }

    const selectedLogs = logs
      .filter((log) => {
        const logDate = String(
          log.log_date || ""
        ).slice(0, 10);

        return (
          logDate >= range.start &&
          logDate <= range.end
        );
      })
      .sort((a, b) => {
        return String(a.log_date || "").localeCompare(
          String(b.log_date || "")
        );
      });

    setReportLogs(selectedLogs);
    setReportGenerated(true);

    setMessage(
      `${selectedLogs.length} activity record${
        selectedLogs.length === 1 ? "" : "s"
      } found for the selected period.`
    );
  };

  const getReportTitle = () => {
    if (reportType === "DAILY") {
      return "DAILY ACTIVITY REPORT";
    }

    if (reportType === "WEEKLY") {
      return "WEEKLY ACTIVITY REPORT";
    }

    return "MONTHLY ACTIVITY REPORT";
  };

  const getReportPeriodText = () => {
    const range = getReportRange();

    if (!range) {
      return "--";
    }

    if (reportType === "DAILY") {
      return formatDate(range.start);
    }

    if (reportType === "WEEKLY") {
      return `${formatDate(range.start)} - ${formatDate(
        range.end
      )}`;
    }

    return `${formatDate(range.start)} - ${formatDate(
      range.end
    )}`;
  };

  const getFilteredCompletedLogs = () => {
    return reportLogs.filter(
      (log) =>
        log.sign_in_time &&
        log.sign_out_time
    ).length;
  };

  const getFilteredApprovedLogs = () => {
    return reportLogs.filter(
      (log) =>
        String(log.status || "").toUpperCase() === "APPROVED"
    ).length;
  };

  const getFilteredPendingLogs = () => {
    return reportLogs.filter((log) => {
      const status = String(
        log.status || "PENDING"
      ).toUpperCase();

      return (
        status === "PENDING" ||
        status === "UNDER_REVIEW"
      );
    }).length;
  };

  const getFilteredRejectedLogs = () => {
    return reportLogs.filter(
      (log) =>
        String(log.status || "").toUpperCase() === "REJECTED"
    ).length;
  };

  const downloadDailyActivityPDF = () => {
    if (!reportGenerated) {
      alert("Please generate the report first.");
      return;
    }

    window.print();
  };

  const submitReport = async () => {
    if (!user?.id) {
      alert("Student information not found.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter report title.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter report description.");
      return;
    }

    if (!file) {
      alert("Please select a report file.");
      return;
    }

    if (!placement?.id) {
      alert("Active placement not found.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append("student_id", user.id);
      formData.append("placement_id", placement.id);
      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim()
      );
      formData.append("report_type", "FINAL");
      formData.append("file", file);

      const response = await fetch(`${API_URL}/reports/`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit report."
        );
      }

      setMessage("Report submitted successfully.");

      setTitle("");
      setDescription("");
      setFile(null);

      const fileInput =
        document.getElementById("report-file");

      if (fileInput) {
        fileInput.value = "";
      }

      await loadReportsData(user.id);
    } catch (err) {
      setError(
        err.message || "Failed to submit report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReport = (report) => {
    if (
      !report?.file_path &&
      !report?.attachment_url
    ) {
      alert("No report file available.");
      return;
    }

    const fileUrl =
      report.attachment_url ||
      `${API_URL}/reports/uploads/${report.file_path}`;

    window.open(fileUrl, "_blank");
  };

  const progress = calculateProgress();
  const completedLogs = getCompletedLogs();
  const approvedLogs = getApprovedLogs();
  const pendingLogs = getPendingLogs();
  const rejectedLogs = getRejectedLogs();

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />

        <div className="dashboard-content">
          <div className="container-fluid p-4">
            <h4>Loading reports...</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="screen-only">
        <Sidebar />
      </div>

      <div className="dashboard-content">

        <div className="dashboard-navbar screen-only">
          <div>
            <h5 className="mb-0 fw-bold">
              Reports
            </h5>

            <small className="text-muted">
              Field placement reports and progress
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo"
            />

            <span className="fw-semibold">
              Welcome, {user?.name || "Student"}
            </span>
          </div>
        </div>

        <div className="container-fluid p-4 screen-only">

          <div className="mb-4">
            <h2 className="fw-bold">
              My Reports
            </h2>

            <p className="text-muted">
              View your field placement progress and generate
              activity reports using real daily log data.
            </p>
          </div>

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="row g-4 mb-4">

            <div className="col-md-3">
              <div className="card report-stat-card">
                <div className="card-body">
                  <small className="text-muted">
                    Total Logs
                  </small>

                  <h2 className="fw-bold mt-2">
                    {logs.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card report-stat-card">
                <div className="card-body">
                  <small className="text-muted">
                    Approved
                  </small>

                  <h2 className="fw-bold text-success mt-2">
                    {approvedLogs}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card report-stat-card">
                <div className="card-body">
                  <small className="text-muted">
                    Pending
                  </small>

                  <h2 className="fw-bold text-warning mt-2">
                    {pendingLogs}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card report-stat-card">
                <div className="card-body">
                  <small className="text-muted">
                    Placement Progress
                  </small>

                  <h2 className="fw-bold text-primary mt-2">
                    {progress}%
                  </h2>
                </div>
              </div>
            </div>

          </div>

          <div className="card dashboard-card mb-4">

            <div className="card-body">

              <div className="mb-4">
                <h4 className="fw-bold mb-1">
                  Generate Activity Report
                </h4>

                <small className="text-muted">
                  Select the report type and date range.
                  Data will be taken from your actual daily logs.
                </small>
              </div>

              <div className="row g-3">

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Report Type
                  </label>

                  <select
                    className="form-select"
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value);
                      setReportGenerated(false);
                      setMessage("");
                    }}
                  >
                    <option value="DAILY">
                      Daily Report
                    </option>

                    <option value="WEEKLY">
                      Weekly Report
                    </option>

                    <option value="MONTHLY">
                      Monthly Report
                    </option>
                  </select>

                </div>

                {reportType === "DAILY" && (
                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      Select Date
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={reportDate}
                      onChange={(e) => {
                        setReportDate(e.target.value);
                        setReportGenerated(false);
                        setMessage("");
                      }}
                    />

                  </div>
                )}

                {reportType === "WEEKLY" && (
                  <>
                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        From Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          setReportGenerated(false);
                          setMessage("");
                        }}
                      />

                    </div>

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        To Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        min={fromDate}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          setReportGenerated(false);
                          setMessage("");
                        }}
                      />

                    </div>
                  </>
                )}

                {reportType === "MONTHLY" && (
                  <div className="col-md-4">

                    <label className="form-label fw-semibold">
                      Select Month
                    </label>

                    <input
                      type="month"
                      className="form-control"
                      value={reportMonth}
                      onChange={(e) => {
                        setReportMonth(e.target.value);
                        setReportGenerated(false);
                        setMessage("");
                      }}
                    />

                  </div>
                )}

              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={generateReport}
                >
                  Generate Report
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={downloadDailyActivityPDF}
                  disabled={!reportGenerated}
                >
                  Download PDF
                </button>

              </div>

              {reportGenerated && (
                <div className="report-selection-summary mt-4">

                  <div>
                    <strong>
                      Report:
                    </strong>{" "}
                    {getReportTitle()}
                  </div>

                  <div>
                    <strong>
                      Period:
                    </strong>{" "}
                    {getReportPeriodText()}
                  </div>

                  <div>
                    <strong>
                      Activities:
                    </strong>{" "}
                    {reportLogs.length}
                  </div>

                </div>
              )}

            </div>

          </div>

          <div className="card dashboard-card mb-4">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                  <h4 className="fw-bold mb-1">
                    {reportGenerated
                      ? getReportTitle()
                      : "Daily Activity Report"}
                  </h4>

                  <small className="text-muted">
                    {reportGenerated
                      ? `Period: ${getReportPeriodText()}`
                      : "Generate a report using the selected date."}
                  </small>
                </div>

                {reportGenerated && (
                  <button
                    className="btn btn-primary"
                    onClick={downloadDailyActivityPDF}
                  >
                    Download PDF
                  </button>
                )}

              </div>

              {!reportGenerated ? (

                <div className="text-center text-muted py-5">
                  <h5>
                    Select your report period
                  </h5>

                  <p className="mb-0">
                    Choose Daily, Weekly or Monthly,
                    then click Generate Report.
                  </p>
                </div>

              ) : reportLogs.length === 0 ? (

                <div className="text-center py-5">

                  <h5 className="fw-bold">
                    No activities found
                  </h5>

                  <p className="text-muted mb-0">
                    There are no daily activities recorded
                    between the selected dates.
                  </p>

                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-light">

                      <tr>
                        <th>Date</th>
                        <th>Sign In</th>
                        <th>Sign Out</th>
                        <th>Activity</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {reportLogs.map((log) => {

                        const status =
                          String(
                            log.status || "PENDING"
                          ).toUpperCase();

                        return (
                          <tr key={log.id}>

                            <td>
                              {formatDate(log.log_date)}
                            </td>

                            <td>
                              {formatTime(
                                log.sign_in_time
                              )}
                            </td>

                            <td>
                              {formatTime(
                                log.sign_out_time
                              )}
                            </td>

                            <td>
                              <div>
                                {log.activity || "--"}
                              </div>

                              {log.attachment && (
                                <small className="text-muted">
                                  Attachment:{" "}
                                  {log.attachment}
                                </small>
                              )}
                            </td>

                            <td>

                              {status === "APPROVED" ? (

                                <span className="badge bg-success">
                                  Approved
                                </span>

                              ) : status === "REJECTED" ? (

                                <span className="badge bg-danger">
                                  Rejected
                                </span>

                              ) : (

                                <span className="badge bg-warning text-dark">
                                  Pending
                                </span>

                              )}

                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </div>

          <div className="card dashboard-card mb-4">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>
                  <h4 className="fw-bold mb-1">
                    Placement Progress
                  </h4>

                  <small className="text-muted">
                    Overall field placement completion
                  </small>
                </div>

                <h4 className="fw-bold">
                  {progress}%
                </h4>

              </div>

              <div
                className="progress"
                style={{ height: "18px" }}
              >

                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progress}%`
                  }}
                />

              </div>

              <div className="row mt-4">

                <div className="col-md-4">
                  <small className="text-muted">
                    Start Date
                  </small>

                  <p className="fw-semibold">
                    {formatDate(
                      placement?.start_date
                    )}
                  </p>
                </div>

                <div className="col-md-4">
                  <small className="text-muted">
                    End Date
                  </small>

                  <p className="fw-semibold">
                    {formatDate(
                      placement?.end_date
                    )}
                  </p>
                </div>

                <div className="col-md-4">
                  <small className="text-muted">
                    Completed Logs
                  </small>

                  <p className="fw-semibold">
                    {completedLogs}
                  </p>
                </div>

              </div>

            </div>

          </div>

          <div className="card dashboard-card mb-4">

            <div className="card-body">

              <h4 className="fw-bold mb-2">
                Submitted Reports
              </h4>

              <p className="text-muted">
                Reports submitted for your field placement.
              </p>

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-light">

                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {reports.length === 0 ? (

                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-muted py-4"
                        >
                          No submitted reports yet.
                        </td>
                      </tr>

                    ) : (

                      reports.map((report) => (

                        <tr key={report.id}>

                          <td>
                            {report.title}
                          </td>

                          <td>
                            {report.report_type || "FINAL"}
                          </td>

                          <td>
                            {formatDate(
                              report.submitted_at ||
                              report.created_at
                            )}
                          </td>

                          <td>

                            {String(
                              report.status || "PENDING"
                            ).toUpperCase() === "APPROVED" ? (

                              <span className="badge bg-success">
                                Approved
                              </span>

                            ) : String(
                                report.status || "PENDING"
                              ).toUpperCase() === "REJECTED" ? (

                              <span className="badge bg-danger">
                                Rejected
                              </span>

                            ) : (

                              <span className="badge bg-warning text-dark">
                                Pending
                              </span>

                            )}

                          </td>

                          <td>

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                downloadReport(report)
                              }
                            >
                              View
                            </button>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

          <div className="card dashboard-card">

            <div className="card-body">

              <h4 className="fw-bold mb-2">
                Field Placement Report
              </h4>

              <p className="text-muted">
                Submit your final field placement report.
              </p>

              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Report Title
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter report title"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />

              </div>

              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Report Description
                </label>

                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Enter a short description of your report..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />

              </div>

              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Upload Report
                </label>

                <input
                  id="report-file"
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setFile(
                      e.target.files[0] || null
                    )
                  }
                />

              </div>

              <button
                className="btn btn-primary"
                onClick={submitReport}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Report"}
              </button>

            </div>

          </div>

        </div>

        <div className="daily-report-print">

          <div className="print-header">

            <img
              src="/image/egaz-logo.jpg"
              alt="eGAZ"
              className="print-logo"
            />

            <div className="print-header-text">

              <h1>
                e-Government Agency Zanzibar
              </h1>

              <h2>
                STUDENT FIELD PLACEMENT MANAGEMENT SYSTEM
              </h2>

              <h3>
                {getReportTitle()}
              </h3>

              <p>
                P.O. Box 800 Zanzibar, Tanzania
              </p>

              <p>
                Tel: +255 (0) 24 22 35688 / +255 (0) 24 22 35689
              </p>

              <p>
                Email: info@egaz.go.tz
              </p>

            </div>

          </div>

          <div className="report-line" />

          <div className="report-period">
            <strong>Report Period:</strong>{" "}
            {getReportPeriodText()}
          </div>

          <div className="student-details">

            <div>
              <strong>Student Name</strong>
              <span>
                {user?.name || "--"}
              </span>
            </div>

            <div>
              <strong>Institutional ID</strong>
              <span>
                {user?.institutional_id ||
                  user?.registration_number ||
                  "--"}
              </span>
            </div>

            <div>
              <strong>Programme</strong>
              <span>
                {user?.programme || "--"}
              </span>
            </div>

            <div>
              <strong>Batch Number</strong>
              <span>
                {user?.batch_number || "--"}
              </span>
            </div>

            <div>
              <strong>Organization</strong>
              <span>
                {placement?.organization_name ||
                  "e-Government Agency Zanzibar (eGAZ)"}
              </span>
            </div>

            <div>
              <strong>Placement Start</strong>
              <span>
                {formatDate(
                  placement?.start_date
                )}
              </span>
            </div>

            <div>
              <strong>Placement End</strong>
              <span>
                {formatDate(
                  placement?.end_date
                )}
              </span>
            </div>

            <div>
              <strong>Selected Activities</strong>
              <span>
                {reportLogs.length}
              </span>
            </div>

          </div>

          <div className="report-title">
            FIELD ACTIVITY RECORD
          </div>

          {reportLogs.length === 0 ? (

            <div className="no-print-data">
              No activities were recorded for the selected period.
            </div>

          ) : (

            <table className="print-table">

              <thead>

                <tr>
                  <th>No.</th>
                  <th>Date</th>
                  <th>Sign In</th>
                  <th>Sign Out</th>
                  <th>Daily Activity / Work Done</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {reportLogs.map((log, index) => {

                  const status =
                    String(
                      log.status || "PENDING"
                    ).toUpperCase();

                  return (
                    <tr key={log.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {formatDate(
                          log.log_date
                        )}
                      </td>

                      <td>
                        {formatTime(
                          log.sign_in_time
                        )}
                      </td>

                      <td>
                        {formatTime(
                          log.sign_out_time
                        )}
                      </td>

                      <td className="activity-cell">

                        <div>
                          {log.activity || "--"}
                        </div>

                        {log.attachment && (
                          <div className="attachment-info">
                            Attachment:{" "}
                            {log.attachment}
                          </div>
                        )}

                        {(log.sign_in_latitude ||
                          log.sign_in_longitude ||
                          log.sign_out_latitude ||
                          log.sign_out_longitude) && (

                          <div className="location-info">

                            {log.sign_in_latitude &&
                              log.sign_in_longitude && (
                                <div>
                                  Sign In Location:{" "}
                                  {log.sign_in_latitude},{" "}
                                  {log.sign_in_longitude}
                                </div>
                              )}

                            {log.sign_out_latitude &&
                              log.sign_out_longitude && (
                                <div>
                                  Sign Out Location:{" "}
                                  {log.sign_out_latitude},{" "}
                                  {log.sign_out_longitude}
                                </div>
                              )}

                          </div>

                        )}

                      </td>

                      <td>
                        {status}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          )}

          <div className="report-summary">

            <div>
              <strong>Total Activities:</strong>{" "}
              {reportLogs.length}
            </div>

            <div>
              <strong>Completed:</strong>{" "}
              {getFilteredCompletedLogs()}
            </div>

            <div>
              <strong>Approved:</strong>{" "}
              {getFilteredApprovedLogs()}
            </div>

            <div>
              <strong>Pending:</strong>{" "}
              {getFilteredPendingLogs()}
            </div>

            <div>
              <strong>Rejected:</strong>{" "}
              {getFilteredRejectedLogs()}
            </div>

          </div>

          <div className="signature-section">

            <div className="signature-box">
              <div className="signature-line" />

              <strong>
                Student Signature
              </strong>

              <span>
                Name: {user?.name || "--"}
              </span>

              <span>
                Date: __________________
              </span>
            </div>

            <div className="signature-box">
              <div className="signature-line" />

              <strong>
                Field Supervisor
              </strong>

              <span>
                Name: __________________
              </span>

              <span>
                Date: __________________
              </span>
            </div>

            <div className="signature-box">
              <div className="signature-line" />

              <strong>
                Academic Supervisor
              </strong>

              <span>
                Name: __________________
              </span>

              <span>
                Date: __________________
              </span>
            </div>

          </div>

          <div className="print-footer">
            Generated from Student Field Placement Management System
          </div>

        </div>

      </div>

      <style>{`

        .daily-report-print {
          display: none;
        }

        .report-selection-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 25px;
          padding: 14px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: #f8f9fa;
        }

        @media print {

          @page {
            size: A4 landscape;
            margin: 10mm 12mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .screen-only {
            display: none !important;
          }

          .dashboard {
            display: block !important;
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .dashboard-content {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .daily-report-print {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: white !important;
            color: #111 !important;
            font-family: Arial, Helvetica, sans-serif;
          }

          .print-header {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            gap: 18px;
            text-align: center;
            margin-bottom: 8px;
          }

          .print-logo {
            width: 78px;
            height: 78px;
            object-fit: contain;
          }

          .print-header-text {
            text-align: center;
          }

          .print-header-text h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
          }

          .print-header-text h2 {
            margin: 4px 0;
            font-size: 13px;
            font-weight: 700;
          }

          .print-header-text h3 {
            margin: 5px 0;
            font-size: 16px;
            font-weight: 700;
          }

          .print-header-text p {
            margin: 1px 0;
            font-size: 9px;
          }

          .report-line {
            border-top: 2px solid #111;
            margin: 8px 0 10px;
          }

          .report-period {
            text-align: center;
            font-size: 10px;
            margin-bottom: 10px;
          }

          .student-details {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            width: 100%;
            border: 1px solid #333;
            margin: 0 auto 12px;
          }

          .student-details div {
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding: 7px;
            border-right: 1px solid #aaa;
            border-bottom: 1px solid #aaa;
          }

          .student-details div:nth-child(4n) {
            border-right: none;
          }

          .student-details strong {
            font-size: 8px;
            text-transform: uppercase;
          }

          .student-details span {
            font-size: 10px;
            word-break: break-word;
          }

          .report-title {
            text-align: center;
            font-size: 13px;
            font-weight: 700;
            margin: 10px 0;
          }

          .print-table {
            width: 100%;
            margin: 0 auto;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #333;
            padding: 6px;
            font-size: 9px;
            vertical-align: top;
            overflow-wrap: anywhere;
          }

          .print-table th {
            text-align: center;
            font-weight: 700;
          }

          .print-table th:nth-child(1) {
            width: 4%;
          }

          .print-table th:nth-child(2) {
            width: 10%;
          }

          .print-table th:nth-child(3) {
            width: 9%;
          }

          .print-table th:nth-child(4) {
            width: 9%;
          }

          .print-table th:nth-child(5) {
            width: 53%;
          }

          .print-table th:nth-child(6) {
            width: 15%;
          }

          .activity-cell {
            white-space: normal;
            word-break: break-word;
            overflow-wrap: anywhere;
            line-height: 1.4;
          }

          .attachment-info {
            margin-top: 5px;
            padding-top: 4px;
            border-top: 1px dotted #999;
            font-size: 7px;
            word-break: break-word;
          }

          .location-info {
            margin-top: 5px;
            padding-top: 4px;
            border-top: 1px dotted #999;
            font-size: 7px;
            line-height: 1.4;
            word-break: break-word;
          }

          .no-print-data {
            width: 100%;
            border: 1px solid #333;
            padding: 25px;
            text-align: center;
            font-size: 11px;
          }

          .report-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            width: 100%;
            margin: 12px auto 0;
            padding: 8px;
            border: 1px solid #333;
            font-size: 9px;
          }

          .signature-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 35px;
            width: 100%;
            margin: 38px auto 0;
          }

          .signature-box {
            display: flex;
            flex-direction: column;
            gap: 5px;
            text-align: center;
            font-size: 9px;
          }

          .signature-line {
            border-top: 1px solid #111;
            margin-bottom: 3px;
            width: 80%;
            align-self: center;
          }

          .print-footer {
            margin-top: 25px;
            padding-top: 6px;
            border-top: 1px solid #aaa;
            text-align: center;
            font-size: 8px;
          }

          .print-table tr {
            page-break-inside: avoid;
          }

          .print-table thead {
            display: table-header-group;
          }

          .print-table tbody {
            display: table-row-group;
          }

        }

      `}</style>

    </div>
  );
}

export default Reports;