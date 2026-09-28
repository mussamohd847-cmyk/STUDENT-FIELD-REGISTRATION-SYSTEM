import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/applications`;

const getDocumentUrl = (filePath) => {
  if (!filePath) return "";

  const path = String(filePath).trim();

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}/uploads/${path.replace(/^\/+/, "")}`;
};

const DocumentLink = ({ label, filePath }) => {
  if (!filePath) {
    return (
      <span className="document-missing">
        Not uploaded
      </span>
    );
  }

  const url = getDocumentUrl(filePath);

  const handleView = () => {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handlePrint = () => {
    const printWindow = window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print this document."
      );
      return;
    }

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="document-actions">
      <button
        type="button"
        className="document-btn view"
        onClick={handleView}
        title={`View ${label}`}
      >
        View
      </button>

      <button
        type="button"
        className="document-btn print"
        onClick={handlePrint}
        title={`Print ${label}`}
      >
        Print
      </button>
    </div>
  );
};

function Applications() {
  const [applications, setApplications] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rejectingApplication, setRejectingApplication] =
    useState(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  useEffect(() => {
    loadApplications();
    loadStats();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to load applications"
        );
      }

      const data = await response.json();

      setApplications(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/stats`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load statistics"
        );
      }

      const data = await response.json();

      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      loadApplications(),
      loadStats(),
    ]);
  };

  const updateStatus = async (
    application,
    status,
    rejectionReasonValue = ""
  ) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/${application.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            rejection_reason:
              rejectionReasonValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update application"
        );
      }

      setRejectingApplication(null);
      setRejectionReason("");

      await refreshData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update application"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const approveApplication = async (
    application
  ) => {
    await updateStatus(
      application,
      "APPROVED"
    );
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      alert(
        "Please enter a reason for rejection."
      );
      return;
    }

    await updateStatus(
      rejectingApplication,
      "REJECTED",
      rejectionReason
    );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return status
      .toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusBadge = (status) => {
    switch (
      (status || "").toUpperCase()
    ) {
      case "APPROVED":
        return "status-badge success";

      case "REJECTED":
        return "status-badge danger";

      case "UNDER_REVIEW":
        return "status-badge info";

      default:
        return "status-badge warning";
    }
  };

  const getStudentName = (application) => {
    if (application.student_name) {
      return application.student_name;
    }

    return [
      application.first_name,
      application.middle_name,
      application.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return date;
  };

  const escapeHtml = (value) => {
    return String(value ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const printApplication = (
    application
  ) => {
    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print."
      );
      return;
    }

    const studentName =
      getStudentName(application);

    const applicationCode =
      application.application_code ||
      `APP-${String(
        application.id
      ).padStart(4, "0")}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>
          ${escapeHtml(applicationCode)} -
          ${escapeHtml(studentName)}
        </title>

        <style>
          @page {
            size: A4;
            margin: 15mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #1e293b;
            font-size: 13px;
            background: #ffffff;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .header img {
            width: 65px;
            height: 65px;
            object-fit: contain;
            margin-bottom: 8px;
          }

          .header h1 {
            margin: 0;
            font-size: 22px;
          }

          .header h2 {
            margin: 5px 0;
            font-size: 16px;
            color: #2563eb;
          }

          .header p {
            margin: 4px 0;
            color: #64748b;
          }

          .section {
            margin-bottom: 18px;
            page-break-inside: avoid;
          }

          .section-title {
            background: #2563eb;
            color: #ffffff;
            padding: 8px 10px;
            font-weight: bold;
            font-size: 13px;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            border: 1px solid #cbd5e1;
            padding: 7px 9px;
            vertical-align: top;
          }

          td:first-child {
            width: 32%;
            font-weight: bold;
            background: #f8fafc;
          }

          .text-box {
            border: 1px solid #cbd5e1;
            padding: 10px;
            line-height: 1.5;
            white-space: pre-wrap;
            min-height: 40px;
          }

          .signature {
            margin-top: 45px;
            display: flex;
            justify-content: space-between;
          }

          .signature div {
            width: 40%;
            text-align: center;
            border-top: 1px solid #1e293b;
            padding-top: 6px;
          }

          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>

        <div class="header">
          <img
            src="/image/egaz-logo.jpg"
            alt="E-GAZ"
          />

          <h1>eGAZ</h1>

          <h2>
            STUDENT FIELD PLACEMENT APPLICATION
          </h2>

          <p>
            Student Field Placement Management System
          </p>

          <p>
            Application Code:
            <strong>
              ${escapeHtml(applicationCode)}
            </strong>
          </p>
        </div>

        <div class="section">
          <div class="section-title">
            Personal Information
          </div>

          <table>
            <tr>
              <td>Full Name</td>
              <td>
                ${escapeHtml(studentName)}
              </td>
            </tr>

            <tr>
              <td>First Name</td>
              <td>
                ${escapeHtml(
                  application.first_name
                )}
              </td>
            </tr>

            <tr>
              <td>Middle Name</td>
              <td>
                ${escapeHtml(
                  application.middle_name
                )}
              </td>
            </tr>

            <tr>
              <td>Last Name</td>
              <td>
                ${escapeHtml(
                  application.last_name
                )}
              </td>
            </tr>

            <tr>
              <td>Gender</td>
              <td>
                ${escapeHtml(
                  application.gender
                )}
              </td>
            </tr>

            <tr>
              <td>Date of Birth</td>
              <td>
                ${escapeHtml(
                  application.date_of_birth
                )}
              </td>
            </tr>

            <tr>
              <td>Nationality</td>
              <td>
                ${escapeHtml(
                  application.nationality
                )}
              </td>
            </tr>

            <tr>
              <td>National ID</td>
              <td>
                ${escapeHtml(
                  application.national_id
                )}
              </td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            Contact Information
          </div>

          <table>
            <tr>
              <td>Phone</td>
              <td>
                ${escapeHtml(
                  application.phone
                )}
              </td>
            </tr>

            <tr>
              <td>Email</td>
              <td>
                ${escapeHtml(
                  application.email
                )}
              </td>
            </tr>

            <tr>
              <td>Alternative Phone</td>
              <td>
                ${escapeHtml(
                  application.alternative_phone
                )}
              </td>
            </tr>

            <tr>
              <td>Address</td>
              <td>
                ${escapeHtml(
                  application.address
                )}
              </td>
            </tr>

            <tr>
              <td>Region</td>
              <td>
                ${escapeHtml(
                  application.region
                )}
              </td>
            </tr>

            <tr>
              <td>District</td>
              <td>
                ${escapeHtml(
                  application.district
                )}
              </td>
            </tr>

            <tr>
              <td>Ward</td>
              <td>
                ${escapeHtml(
                  application.ward
                )}
              </td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            Academic Information
          </div>

          <table>
            <tr>
              <td>Student Number</td>
              <td>
                ${escapeHtml(
                  application.student_number
                )}
              </td>
            </tr>

            <tr>
              <td>Institution</td>
              <td>
                ${escapeHtml(
                  application.institution
                )}
              </td>
            </tr>

            <tr>
              <td>Programme</td>
              <td>
                ${escapeHtml(
                  application.programme
                )}
              </td>
            </tr>

            <tr>
              <td>Department</td>
              <td>
                ${escapeHtml(
                  application.department
                )}
              </td>
            </tr>

            <tr>
              <td>Year of Study</td>
              <td>
                ${escapeHtml(
                  application.year_of_study
                )}
              </td>
            </tr>

            <tr>
              <td>Academic Year</td>
              <td>
                ${escapeHtml(
                  application.academic_year
                )}
              </td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            Field Placement Information
          </div>

          <table>
            <tr>
              <td>Organization</td>
              <td>
                ${escapeHtml(
                  application.preferred_organization
                )}
              </td>
            </tr>

            <tr>
              <td>Organization Type</td>
              <td>
                ${escapeHtml(
                  application.organization_type
                )}
              </td>
            </tr>

            <tr>
              <td>Preferred Location</td>
              <td>
                ${escapeHtml(
                  application.preferred_location
                )}
              </td>
            </tr>

            <tr>
              <td>Preferred Department</td>
              <td>
                ${escapeHtml(
                  application.preferred_department
                )}
              </td>
            </tr>

            <tr>
              <td>Placement Start Date</td>
              <td>
                ${escapeHtml(
                  application.placement_start_date
                )}
              </td>
            </tr>

            <tr>
              <td>Placement End Date</td>
              <td>
                ${escapeHtml(
                  application.placement_end_date
                )}
              </td>
            </tr>

            <tr>
              <td>Placement Duration</td>
              <td>
                ${escapeHtml(
                  application.placement_duration
                )}
              </td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            Skills
          </div>

          <div class="text-box">
            ${escapeHtml(application.skills)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            Reason for Placement
          </div>

          <div class="text-box">
            ${escapeHtml(
              application.placement_reason
            )}
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            Submitted Documents
          </div>

          <table>
            <tr>
              <td>Application Letter</td>
              <td>
                ${
                  application.application_letter_path
                    ? "Submitted"
                    : "Not Submitted"
                }
              </td>
            </tr>

            <tr>
              <td>CV</td>
              <td>
                ${
                  application.cv_path
                    ? "Submitted"
                    : "Not Submitted"
                }
              </td>
            </tr>

            <tr>
              <td>Student ID Copy</td>
              <td>
                ${
                  application.student_id_copy_path
                    ? "Submitted"
                    : "Not Submitted"
                }
              </td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">
            Application Status
          </div>

          <table>
            <tr>
              <td>Status</td>
              <td>
                ${escapeHtml(
                  formatStatus(
                    application.status
                  )
                )}
              </td>
            </tr>

            <tr>
              <td>Submitted At</td>
              <td>
                ${escapeHtml(
                  application.submitted_at
                )}
              </td>
            </tr>

            <tr>
              <td>Reviewed At</td>
              <td>
                ${escapeHtml(
                  application.reviewed_at
                )}
              </td>
            </tr>

            <tr>
              <td>Rejection Reason</td>
              <td>
                ${escapeHtml(
                  application.rejection_reason
                )}
              </td>
            </tr>
          </table>
        </div>

        <div class="signature">
          <div>
            Student Signature
          </div>

          <div>
            Authorized Officer
          </div>
        </div>

        <div class="footer">
          <span>
            SFPMS - Student Field Placement Management System
          </span>

          <span>
            Printed:
            ${new Date().toLocaleString()}
          </span>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>

      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const filteredApplications =
    applications.filter(
      (application) => {
        const searchText =
          search.toLowerCase();

        const studentName = (
          application.student_name ||
          `${application.first_name || ""} ${
            application.middle_name || ""
          } ${
            application.last_name || ""
          }`
        ).toLowerCase();

        const studentId = (
          application.student_number || ""
        ).toLowerCase();

        const organization = (
          application.preferred_organization ||
          ""
        ).toLowerCase();

        const programme = (
          application.programme || ""
        ).toLowerCase();

        const matchesSearch =
          studentName.includes(searchText) ||
          studentId.includes(searchText) ||
          organization.includes(searchText) ||
          programme.includes(searchText);

        const applicationStatus = (
          application.status || ""
        ).toUpperCase();

        const matchesStatus =
          statusFilter === "All" ||
          applicationStatus ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <div className="sidebar-header">

          <img
            src="/image/egaz-logo.jpg"
            alt="E-GAZ"
            className="dashboard-logo"
          />

          <h5 className="fw-bold mt-2">
            SFPM System
          </h5>

          <small className="text-muted">
            Admin / Coordinator
          </small>

        </div>

        <nav className="sidebar-menu">

          <Link
            to="/admin/dashboard"
            className="sidebar-link"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="sidebar-link"
          >
            Users
          </Link>

          <Link
            to="/admin/applications"
            className="sidebar-link active"
          >
            Applications
          </Link>

          <Link
            to="/admin/organizations"
            className="sidebar-link"
          >
            Organizations
          </Link>

          <Link
            to="/admin/supervisors"
            className="sidebar-link"
          >
            Supervisors
          </Link>

          <Link
            to="/admin/reports"
            className="sidebar-link"
          >
            Reports
          </Link>

          <Link
            to="/admin/settings"
            className="sidebar-link"
          >
            System Settings
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

      <main className="dashboard-main">

        <div className="topbar">

          <div>

            <h5 className="mb-1 fw-bold">
              Applications
            </h5>

            <small>
              Manage Student Field Placement Applications
            </small>

          </div>

          <div className="topbar-right">

            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo"
            />

            <span className="fw-semibold">
              Administrator
            </span>

          </div>

        </div>

        <div className="dashboard-page">

          <div className="page-heading">

            <div>

              <h2 className="fw-bold mb-1">
                Applications Overview
              </h2>

              <p className="text-muted mb-0">
                Review and manage student field placement
                applications.
              </p>

            </div>

          </div>

          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          <div className="stats-grid">

            <div className="stat-card">
              <div>
                <small className="text-muted">
                  Total Applications
                </small>

                <div className="stat-number">
                  {stats.total}
                </div>

                <p className="mb-0">
                  All submitted applications
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <small className="text-muted">
                  Pending
                </small>

                <div className="stat-number text-warning">
                  {stats.pending}
                </div>

                <p className="mb-0">
                  Waiting for review
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <small className="text-muted">
                  Under Review
                </small>

                <div className="stat-number">
                  {stats.under_review}
                </div>

                <p className="mb-0">
                  Currently being reviewed
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <small className="text-muted">
                  Approved
                </small>

                <div className="stat-number text-success">
                  {stats.approved}
                </div>

                <p className="mb-0">
                  Approved applications
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div>
                <small className="text-muted">
                  Rejected
                </small>

                <div className="stat-number text-danger">
                  {stats.rejected}
                </div>

                <p className="mb-0">
                  Rejected applications
                </p>
              </div>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="section-title">

              <div>

                <h5 className="fw-bold mb-1">
                  Search & Filter
                </h5>

                <small className="text-muted">
                  Find applications quickly.
                </small>

              </div>

            </div>

            <div className="search-filter-grid">

              <div>

                <label className="form-label fw-semibold">
                  Search Applications
                </label>

                <input
                  type="text"
                  className="form-control custom-input"
                  placeholder="Search student, student ID, programme or organization..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <div>

                <label className="form-label fw-semibold">
                  Filter by Status
                </label>

                <select
                  className="form-select custom-input"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    All Applications
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="UNDER_REVIEW">
                    Under Review
                  </option>

                  <option value="APPROVED">
                    Approved
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                </select>

              </div>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-header-flex">

              <div>

                <h5 className="fw-bold mb-1">
                  Student Applications
                </h5>

                <small className="text-muted">
                  Applications loaded from database.
                </small>

              </div>

              <button
                className="refresh-btn"
                onClick={refreshData}
                disabled={loading}
              >
                Refresh
              </button>

            </div>

            <div className="table-wrapper">

              <div className="table-responsive">

                <table className="applications-table">

                  <thead>

                    <tr>

                      <th>
                        Application ID
                      </th>

                      <th>
                        Student
                      </th>

                      <th>
                        Programme
                      </th>

                      <th>
                        Organization
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Documents
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {loading ? (

                      <tr>

                        <td
                          colSpan="8"
                          className="empty-state"
                        >
                          <div>
                            Loading...
                          </div>
                        </td>

                      </tr>

                    ) : filteredApplications.length > 0 ? (

                      filteredApplications.map(
                        (application) => (

                          <tr
                            key={
                              application.id
                            }
                          >

                            <td>

                              <strong className="application-id">

                                {
                                  application.application_code ||
                                  `APP-${String(
                                    application.id
                                  ).padStart(
                                    4,
                                    "0"
                                  )}`
                                }

                              </strong>

                            </td>

                            <td>

                              <div className="student-cell">

                                <strong>
                                  {getStudentName(
                                    application
                                  )}
                                </strong>

                                <small>
                                  {
                                    application.student_number ||
                                    `Student ID: ${application.student_id}`
                                  }
                                </small>

                              </div>

                            </td>

                            <td>
                              {
                                application.programme ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                application.preferred_organization ||
                                "-"
                              }
                            </td>

                            <td>
                              {formatDate(
                                application.submitted_at
                              )}
                            </td>

                            <td>

                              <span
                                className={getStatusBadge(
                                  application.status
                                )}
                              >
                                {formatStatus(
                                  application.status
                                )}
                              </span>

                            </td>

                            <td>

                              <div className="documents-cell">

                                <div>
                                  <strong>
                                    Letter:
                                  </strong>{" "}

                                  <DocumentLink
                                    label="Application Letter"
                                    filePath={
                                      application.application_letter_path
                                    }
                                  />
                                </div>

                                <div>
                                  <strong>
                                    CV:
                                  </strong>{" "}

                                  <DocumentLink
                                    label="CV"
                                    filePath={
                                      application.cv_path
                                    }
                                  />
                                </div>

                                <div>
                                  <strong>
                                    Student ID:
                                  </strong>{" "}

                                  <DocumentLink
                                    label="Student ID Copy"
                                    filePath={
                                      application.student_id_copy_path
                                    }
                                  />
                                </div>

                              </div>

                            </td>

                            <td>

                              <div className="action-buttons">

                                <button
                                  className="table-btn print"
                                  onClick={() =>
                                    printApplication(
                                      application
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                >
                                  Print
                                </button>

                                {application.status !==
                                  "APPROVED" && (

                                  <button
                                    className="table-btn approve"
                                    onClick={() =>
                                      approveApplication(
                                        application
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    Approve
                                  </button>

                                )}

                                {application.status !==
                                  "REJECTED" && (

                                  <button
                                    className="table-btn reject"
                                    onClick={() => {
                                      setRejectingApplication(
                                        application
                                      );

                                      setRejectionReason(
                                        ""
                                      );
                                    }}
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    Reject
                                  </button>

                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="8"
                          className="empty-state"
                        >

                          <div></div>

                          <strong>
                            No applications found
                          </strong>

                          <small>
                            No applications are currently
                            available.
                          </small>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

      </main>

      {rejectingApplication && (

        <div
          className="custom-modal-overlay"
          onClick={() =>
            setRejectingApplication(null)
          }
        >

          <div
            className="custom-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="custom-modal-header">

              <div>

                <h5 className="fw-bold mb-1">
                  Reject Application
                </h5>

                <small>
                  Provide a reason for rejection.
                </small>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setRejectingApplication(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="custom-modal-body">

              <div className="warning-message">

                <p>

                  You are rejecting the application
                  of{" "}

                  <strong>
                    {getStudentName(
                      rejectingApplication
                    )}
                  </strong>
                  .

                </p>

              </div>

              <label className="form-label fw-semibold">
                Reason for Rejection
              </label>

              <textarea
                className="form-control custom-input"
                rows="5"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="custom-modal-footer">

              <button
                className="action-btn secondary"
                onClick={() =>
                  setRejectingApplication(
                    null
                  )
                }
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                className="action-btn danger-btn"
                onClick={confirmRejection}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "Confirm Rejection"}
              </button>

            </div>

          </div>

        </div>

      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Poppins, Arial, sans-serif;
          background: #f4f7fb;
          color: #1e293b;
        }

        .dashboard {
          min-height: 100vh;
          background: #f4f7fb;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 250px;
          height: 100vh;
          background: #2563eb;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 25px 20px 20px;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .dashboard-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 10px;
        }

        .sidebar-header h5 {
          color: #1e293b;
          margin-bottom: 3px;
        }

        .sidebar-header small {
          color: #ffffff !important;
        }

        .sidebar-menu {
          padding: 18px 12px;
          flex: 1;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 12px 15px;
          margin-bottom: 6px;
          color: #475569;
          text-decoration: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: #eff6ff;
          color: #2563eb;
          transform: translateX(2px);
        }

        .sidebar-link.active {
          background: #636fce;
          color: #ffffff;
          box-shadow: 0 5px 14px rgba(37, 99, 235, 0.22);
        }

        .sidebar-footer {
          padding: 15px 12px;
          border-top: 1px solid #f1f5f9;
        }

        .sidebar-footer .sidebar-link:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .dashboard-main {
          width: calc(100% - 250px);
          min-height: 100vh;
          margin-left: 250px;
          padding: 22px;
        }

        .topbar {
          min-height: 72px;
          padding: 15px 22px;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.16);
        }

        .topbar h5 {
          color: #ffffff;
        }

        .topbar small {
          color: rgba(255, 255, 255, 0.82);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
        }

        .topbar-right .dashboard-logo {
          width: 42px;
          height: 42px;
          background: #ffffff;
          padding: 3px;
        }

        .dashboard-page {
          padding-top: 24px;
        }

        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .page-heading h2 {
          color: #0f172a;
        }

        .error-alert {
          padding: 14px 16px;
          margin-bottom: 20px;
          border-radius: 10px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          min-height: 145px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 9px 22px rgba(15, 23, 42, 0.08);
        }

        .stat-number {
          font-size: 28px;
          font-weight: 800;
          color: #1d4ed8;
          line-height: 1.2;
          margin: 5px 0;
        }

        .stat-card p {
          color: #64748b;
          font-size: 12px;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }

        .card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .search-filter-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 18px;
        }

        .form-label {
          color: #334155;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .custom-input {
          min-height: 44px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 13px;
          color: #1e293b;
          box-shadow: none !important;
        }

        .custom-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10) !important;
          outline: none;
        }

        .table-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          background: #ffffff;
          font-size: 13px;
        }

        .applications-table thead {
          background: #f8fafc;
        }

        .applications-table th {
          padding: 14px 13px;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          white-space: nowrap;
          border-bottom: 1px solid #e2e8f0;
        }

        .applications-table td {
          padding: 15px 13px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          vertical-align: middle;
        }

        .applications-table tbody tr:hover {
          background: #f8fbff;
        }

        .applications-table tbody tr:last-child td {
          border-bottom: none;
        }

        .application-id {
          color: #2563eb;
        }

        .student-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .student-cell strong {
          color: #1e293b;
        }

        .student-cell small {
          color: #64748b;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-badge.success {
          background: #dcfce7;
          color: #15803d;
        }

        .status-badge.danger {
          background: #fee2e2;
          color: #b91c1c;
        }

        .status-badge.info {
          background: #e0f2fe;
          color: #0369a1;
        }

        .status-badge.warning {
          background: #fef3c7;
          color: #a16207;
        }

        .documents-cell {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 220px;
          font-size: 12px;
        }

        .documents-cell strong {
          color: #334155;
        }

        .document-actions {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 5px;
        }

        .document-btn {
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .document-btn.view {
          background: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .document-btn.view:hover {
          background: #dbeafe;
        }

        .document-btn.print {
          background: #f0fdf4;
          color: #16a34a;
          border-color: #bbf7d0;
        }

        .document-btn.print:hover {
          background: #dcfce7;
        }

        .document-missing {
          color: #94a3b8;
          font-size: 11px;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .table-btn {
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .table-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .table-btn.print {
          background: #ffffff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .table-btn.print:hover {
          background: #eff6ff;
        }

        .table-btn.approve {
          background: #16a34a;
          color: #ffffff;
          border: 1px solid #16a34a;
        }

        .table-btn.approve:hover {
          background: #15803d;
        }

        .table-btn.reject {
          background: #dc2626;
          color: #ffffff;
          border: 1px solid #dc2626;
        }

        .table-btn.reject:hover {
          background: #b91c1c;
        }

        .refresh-btn {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 9px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 45px 20px !important;
          color: #64748b;
        }

        .empty-state div {
          font-size: 35px;
          margin-bottom: 10px;
        }

        .empty-state strong,
        .empty-state small {
          display: block;
        }

        .empty-state strong {
          color: #334155;
          margin-bottom: 4px;
        }

        .custom-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
          overflow-y: auto;
        }

        .custom-modal {
          width: 100%;
          max-width: 600px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.20);
          overflow: hidden;
          animation: modalIn 0.2s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-modal-header {
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
        }

        .custom-modal-header h5 {
          color: #ffffff;
        }

        .custom-modal-header small {
          color: rgba(255, 255, 255, 0.80);
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
        }

        .custom-modal-body {
          padding: 22px;
        }

        .custom-modal-footer {
          padding: 16px 22px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          background: #f8fafc;
        }

        .warning-message {
          padding: 13px;
          margin-bottom: 18px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          color: #92400e;
        }

        .warning-message p {
          margin: 0;
          font-size: 14px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-btn.secondary {
          background: #f8fafc;
          color: #475569;
          border-color: #cbd5e1;
        }

        .danger-btn {
          background: #dc2626;
          color: #ffffff;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1000px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .search-filter-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 220px;
          }

          .dashboard-main {
            width: calc(100% - 220px);
            margin-left: 220px;
            padding: 15px;
          }
        }

        @media (max-width: 700px) {
          .sidebar {
            position: relative;
            width: 100%;
            height: auto;
          }

          .dashboard-main {
            width: 100%;
            margin-left: 0;
            padding: 15px;
          }

          .topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .topbar-right {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .custom-modal {
            max-height: 92vh;
            overflow-y: auto;
          }
        }

        @media (max-width: 480px) {
          .dashboard-main {
            padding: 12px;
          }

          .dashboard-page {
            padding-top: 18px;
          }

          .dashboard-card,
          .stat-card {
            padding: 17px;
            border-radius: 14px;
          }

          .page-heading h2 {
            font-size: 22px;
          }

          .stat-number {
            font-size: 27px;
          }

          .custom-modal-overlay {
            padding: 10px;
          }

          .custom-modal-header,
          .custom-modal-body,
          .custom-modal-footer {
            padding: 16px;
          }

          .custom-modal-footer {
            flex-direction: column;
          }

          .custom-modal-footer .action-btn {
            width: 100%;
          }

          .document-actions {
            margin-left: 0;
            margin-top: 4px;
          }
        }
      `}</style>

    </div>
  );
}

export default Applications;