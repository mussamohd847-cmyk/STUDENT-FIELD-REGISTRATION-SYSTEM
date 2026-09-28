import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import { useSidebar } from "../../components/useSidebar";

function IconDoc() {
  return <span className="dashboard-icon"></span>;
}

function IconCheck() {
  return <span className="dashboard-icon"></span>;
}

function IconClock() {
  return <span className="dashboard-icon"></span>;
}

function IconReport() {
  return <span className="dashboard-icon"></span>;
}

function NotificationIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function Dashboard() {
  const sidebar = useSidebar();

  const isSidebarOpen =
    sidebar?.isSidebarOpen ?? true;

  const toggleSidebar =
    sidebar?.toggleSidebar ?? (() => {});

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  const [student, setStudent] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    registration_number: "",
    batch_number: "",
    programme: "",
    university: "",
    department: "",
    year: "",
    gender: "",
    address: "",
  });

  const [dashboardData, setDashboardData] = useState({
    total_applications: 0,
    approved_applications: 0,
    pending_applications: 0,
    total_attendance: 0,
    present_days: 0,
    absent_days: 0,
    total_reports: 0,
    submitted_reports: 0,
    pending_reports: 0,
    placement_status: "Not Assigned",
    organization_name: "",
    supervisor_name: "",
    department: "",
    placement_start_date: "",
    placement_end_date: "",
    batch_number: "",
  });

  const [applicationStatus, setApplicationStatus] =
    useState("");

  const [applicationSubmitted, setApplicationSubmitted] =
    useState(false);

  const isApproved =
    String(applicationStatus).toUpperCase() ===
    "APPROVED";

  const batchNumber =
    student.batch_number ||
    dashboardData.batch_number ||
    "";

  const hasBatchNumber =
    String(batchNumber).trim() !== "";

  const placementUnlocked =
    isApproved && hasBatchNumber;

  const totalAttendance = Number(
    dashboardData.total_attendance || 0
  );

  const presentDays = Number(
    dashboardData.present_days || 0
  );

  const absentDays = Number(
    dashboardData.absent_days || 0
  );

  const totalReports = Number(
    dashboardData.total_reports || 0
  );

  const submittedReports = Number(
    dashboardData.submitted_reports || 0
  );

  const pendingReports = Number(
    dashboardData.pending_reports || 0
  );

  const attendanceRate =
    totalAttendance > 0
      ? Math.round(
          (presentDays / totalAttendance) * 100
        )
      : 0;

  const progress = placementUnlocked
    ? 75
    : applicationSubmitted
    ? 50
    : 25;

  const progressText = placementUnlocked
    ? "3 of 4 steps completed • 75% complete"
    : applicationSubmitted
    ? "2 of 4 steps completed • 50% complete"
    : "1 of 4 steps completed • 25% complete";

  const formatDate = (date) => {
    if (!date) {
      return "Not Assigned";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString();
  };

  const loadNotifications = async (userId) => {
    try {
      const response = await api.get(
        `/notifications/?user_id=${userId}`
      );

      setNotifications(
        Array.isArray(response)
          ? response
          : []
      );
    } catch {
      setNotifications([]);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = JSON.parse(
        localStorage.getItem("sfpms_user") || "null"
      );

      if (!storedUser?.id) {
        navigate("/login");
        return;
      }

      const response = await api.get(
        `/dashboard/student/${storedUser.id}`
      );

      if (response) {
        setDashboardData((previous) => ({
          ...previous,
          ...response,
        }));

        if (response.student) {
          setStudent((previous) => ({
            ...previous,
            ...response.student,
          }));
        }

        if (response.batch_number) {
          setStudent((previous) => ({
            ...previous,
            batch_number:
              response.batch_number,
          }));
        }

        if (response.application_status) {
          setApplicationStatus(
            response.application_status
          );
        }

        if (
          response.application_submitted !==
          undefined
        ) {
          setApplicationSubmitted(
            Boolean(
              response.application_submitted
            )
          );
        }
      }

      try {
        const applicationsResponse =
          await api.get(
            `/applications/?student_id=${storedUser.id}`
          );

        const applications =
          Array.isArray(applicationsResponse)
            ? applicationsResponse
            : [];

        if (applications.length > 0) {
          const latestApplication = [
            ...applications,
          ].sort((a, b) => {
            const dateA = new Date(
              a.updated_at ||
                a.created_at ||
                a.submitted_at ||
                0
            );

            const dateB = new Date(
              b.updated_at ||
                b.created_at ||
                b.submitted_at ||
                0
            );

            return dateB - dateA;
          })[0];

          if (latestApplication?.status) {
            setApplicationStatus(
              latestApplication.status
            );
          }

          if (
            latestApplication?.batch_number
          ) {
            setStudent((previous) => ({
              ...previous,
              batch_number:
                latestApplication.batch_number,
            }));

            setDashboardData((previous) => ({
              ...previous,
              batch_number:
                latestApplication.batch_number,
            }));
          }

          setApplicationSubmitted(true);

          setDashboardData((previous) => ({
            ...previous,

            organization_name:
              latestApplication.organization_name ||
              latestApplication.organization ||
              previous.organization_name ||
              "",

            supervisor_name:
              latestApplication.supervisor_name ||
              latestApplication.supervisor ||
              previous.supervisor_name ||
              "",

            department:
              latestApplication.department ||
              previous.department ||
              "",

            placement_start_date:
              latestApplication.placement_start_date ||
              latestApplication.start_date ||
              previous.placement_start_date ||
              "",

            placement_end_date:
              latestApplication.placement_end_date ||
              latestApplication.end_date ||
              previous.placement_end_date ||
              "",

            placement_status:
              latestApplication.status ||
              previous.placement_status ||
              "Not Assigned",
          }));
        }
      } catch (applicationsError) {
        console.error(
          "Applications error:",
          applicationsError
        );
      }

      await loadNotifications(
        storedUser.id
      );
    } catch (dashboardError) {
      console.error(
        "Dashboard error:",
        dashboardError
      );

      setError(
        dashboardError?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .dashboard-layout {
          min-height: 100vh;
          width: 100%;
          background: #f2f4f9;
          color: #1f2937;
          font-family: Arial, sans-serif;
        }

        .dashboard-main {
          min-width: 0;
          width: auto;
          margin-left: ${isSidebarOpen ? "240px" : "78px"};
          padding: 0 30px 40px;
          transition: margin-left 0.3s ease;
        }

        .dashboard-topbar {
          min-height: 82px;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #e1e2ed;
          border-bottom: 1px solid #edf0f5;
          margin: 0 -30px 30px;
          padding: 0 30px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .topbar-left-area {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topbar-left {
          min-width: 0;
        }

        .topbar-left h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar-left p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar-left strong {
          color: #083dae;
        }

        .sidebar-toggle {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          color: #2563eb;
        }

        .topbar-actions {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .top-btn {
          width: 44px;
          height: 44px;
          border: 1px solid #f2f4f8;
          background: #fcfcfe;
          color: #374151;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 999px;
          background: #e74c3c;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }

        .dashboard-welcome {
          position: relative;
          overflow: hidden;
          min-width: 0;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #2563eb 0%,
            #1d4ed8 55%,
            #1e40af 100%
          );
          padding: 35px;
          margin-bottom: 25px;
          color: #ffffff;
        }

        .welcome-content {
          position: relative;
          z-index: 2;
          max-width: 100%;
          min-width: 0;
        }

        .welcome-label {
          display: inline-block;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          opacity: 0.8;
        }

        .dashboard-welcome h2 {
          margin: 0;
          font-size: 28px;
          line-height: 1.25;
          overflow-wrap: break-word;
        }

        .dashboard-welcome p {
          max-width: 700px;
          margin: 12px 0 20px;
          color: rgba(255,255,255,0.86);
          font-size: 14px;
          line-height: 1.7;
          overflow-wrap: break-word;
        }

        .approved-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .status-message {
          display: inline-flex;
          max-width: 100%;
          padding: 10px 14px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          overflow-wrap: break-word;
        }

        .status-message.approved {
          background: rgba(22,163,74,0.2);
        }

        .batch-number-card {
          max-width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(15,23,42,0.12);
        }

        .batch-number-card span {
          color: #6b7280;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .batch-number-card strong {
          color: #2563eb;
          font-size: 18px;
          font-weight: 800;
        }

        .progress-wrap {
          margin-top: 25px;
        }

        .progress-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .progress-top span {
          overflow-wrap: break-word;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #ffffff;
          border-radius: 10px;
          transition: width 0.5s;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(190px, 1fr)
          );
          gap: 18px;
          margin-bottom: 25px;
        }

        .stat-card {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 15px;
          padding: 18px;
          border-left: 4px solid #2563eb;
        }

        .stat-card:nth-child(2) {
          border-left-color: #22c55e;
        }

        .stat-card:nth-child(3) {
          border-left-color: #f59e0b;
        }

        .stat-card:nth-child(4) {
          border-left-color: #8b5cf6;
        }

        .stat-card-icon {
          width: 45px;
          height: 45px;
          min-width: 45px;
          border-radius: 12px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-icon {
          font-size: 22px;
        }

        .stat-card > div:last-child {
          min-width: 0;
        }

        .stat-card span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .stat-card strong {
          display: block;
          color: #111827;
          font-size: 23px;
        }

        .stat-sub {
          font-size: 11px;
          font-weight: 600;
          margin-top: 3px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(280px, 1fr)
          );
          gap: 20px;
          margin-bottom: 30px;
        }

        .dashboard-card {
          min-width: 0;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          overflow: hidden;
        }

        .card-header {
          min-width: 0;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f1f3;
        }

        .card-header h3 {
          margin: 0;
          color: #111827;
          font-size: 15px;
          overflow-wrap: break-word;
        }

        .card-header p {
          margin: 5px 0 0;
          color: #9ca3af;
          font-size: 11px;
          overflow-wrap: break-word;
        }

        .placement-info {
          min-width: 0;
          padding: 5px 0;
        }

        .placement-detail {
          min-width: 0;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .placement-detail span {
          min-width: 70px;
          color: #6b7280;
          font-size: 11px;
          flex-shrink: 0;
        }

        .placement-detail strong {
          min-width: 0;
          max-width: 65%;
          color: #111827;
          font-size: 11px;
          text-align: right;
          overflow-wrap: anywhere;
          white-space: normal;
        }

        .card-link {
          display: block;
          margin-top: 15px;
          text-align: center;
          padding: 10px;
          border: 1px solid #2563eb;
          color: #2563eb;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: normal;
        }

        .card-link:hover {
          background: #2563eb;
          color: #ffffff;
        }

        .badge {
          display: inline-block;
          max-width: 100%;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          background: #dcfce7;
          color: #16a34a;
          margin-bottom: 10px;
        }

        .attendance-center {
          text-align: center;
          padding: 20px 0;
        }

        .circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 5px solid #e5e7eb;
          border-top-color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-weight: 800;
          color: #2563eb;
        }

        .error-box {
          padding: 12px 15px;
          margin-bottom: 20px;
          border-radius: 10px;
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          font-size: 13px;
          overflow-wrap: break-word;
        }

        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f2f4f9;
          color: #374151;
          font-family: Arial, sans-serif;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 768px) {
          .dashboard-main {
            width: 100%;
            margin-left: 0 !important;
            padding: 0 15px 40px;
          }

          .dashboard-topbar {
            margin: 0 -15px 25px;
            padding: 0 15px;
          }

          .topbar-left h1 {
            font-size: 18px;
          }

          .topbar-left p {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-welcome {
            padding: 25px;
          }

          .dashboard-welcome h2 {
            font-size: 23px;
          }

          .progress-top {
            flex-direction: column;
            gap: 5px;
          }

          .placement-detail {
            align-items: flex-start;
          }

          .placement-detail strong {
            max-width: 58%;
          }
        }

        @media (max-width: 480px) {
          .dashboard-topbar {
            gap: 8px;
          }

          .topbar-actions {
            gap: 5px;
          }

          .top-btn {
            width: 38px;
            height: 38px;
          }

          .sidebar-toggle {
            width: 38px;
            height: 38px;
            min-width: 38px;
          }

          .dashboard-welcome {
            padding: 20px;
            border-radius: 15px;
          }

          .dashboard-card {
            padding: 16px;
          }

          .batch-number-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="topbar-left-area">
              <button
                type="button"
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>

              <div className="topbar-left">
                <h1>Student Dashboard</h1>

                <p>
                  Welcome back,{" "}
                  <strong>
                    {student.name || "Student"}
                  </strong>{" "}
                  •{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="topbar-actions">
              <button
                type="button"
                className="top-btn"
                aria-label="Notifications"
              >
                <NotificationIcon />

                {notifications.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length > 99
                      ? "99+"
                      : notifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="top-btn"
                onClick={() =>
                  navigate("/student/profile")
                }
                aria-label="Profile"
              >
                <ProfileIcon />
              </button>
            </div>
          </header>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <section className="dashboard-welcome">
            <div className="welcome-content">
              <span className="welcome-label">
                STUDENT PORTAL
              </span>

              <h2>
                Manage your field placement journey
              </h2>

              <p>
                Track your application, placement,
                attendance, reports and other field
                placement activities from one place.
              </p>

              {placementUnlocked && (
                <div className="approved-info">
                  <div className="status-message approved">
                    ✓ Field placement has been approved
                  </div>

                  <div className="batch-number-card">
                    <span>
                      YOUR BATCH NUMBER
                    </span>

                    <strong>
                      {batchNumber}
                    </strong>
                  </div>
                </div>
              )}

              <div className="progress-wrap">
                <div className="progress-top">
                  <span>
                    Placement Progress
                  </span>

                  <span>
                    {progressText}
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">
                <IconDoc />
              </div>

              <div>
                <span>
                  Total Applications
                </span>

                <strong>
                  {Number(
                    dashboardData.total_applications ||
                      0
                  )}
                </strong>

                <div
                  className="stat-sub"
                  style={{
                    color: applicationSubmitted
                      ? "#16a34a"
                      : "#6b7280",
                  }}
                >
                  {applicationSubmitted
                    ? "Application submitted"
                    : "No application"}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <IconCheck />
              </div>

              <div>
                <span>Approved</span>

                <strong>
                  {Number(
                    dashboardData.approved_applications ||
                      0
                  )}
                </strong>

                <div
                  className="stat-sub"
                  style={{
                    color: isApproved
                      ? "#16a34a"
                      : "#6b7280",
                  }}
                >
                  {isApproved
                    ? "Application approved"
                    : "Not approved"}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <IconClock />
              </div>

              <div>
                <span>Attendance Rate</span>

                <strong>
                  {attendanceRate}%
                </strong>

                <div
                  className="stat-sub"
                  style={{
                    color: "#d97706",
                  }}
                >
                  {presentDays} of{" "}
                  {totalAttendance} days present
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">
                <IconReport />
              </div>

              <div>
                <span>
                  Reports Submitted
                </span>

                <strong>
                  {submittedReports} /{" "}
                  {totalReports}
                </strong>

                <div
                  className="stat-sub"
                  style={{
                    color: "#d97706",
                  }}
                >
                  {pendingReports} pending
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Placement Status</h3>

                <p>
                  Your current field placement
                </p>
              </div>

              <div className="placement-info">
                {placementUnlocked && (
                  <div className="badge">
                    Approved • Active
                  </div>
                )}

                <div className="placement-detail">
                  <span>
                    Organization
                  </span>

                  <strong>
                    {dashboardData.organization_name ||
                      "Not Assigned"}
                  </strong>
                </div>

                <div className="placement-detail">
                  <span>
                    Field Supervisor
                  </span>

                  <strong>
                    {dashboardData.supervisor_name ||
                      "Not Assigned"}
                  </strong>
                </div>

                <div className="placement-detail">
                  <span>
                    Department
                  </span>

                  <strong>
                    {dashboardData.department ||
                      student.department ||
                      "Not Assigned"}
                  </strong>
                </div>

                <div className="placement-detail">
                  <span>
                    Placement Period
                  </span>

                  <strong>
                    {dashboardData.placement_start_date &&
                    dashboardData.placement_end_date
                      ? `${formatDate(
                          dashboardData.placement_start_date
                        )} — ${formatDate(
                          dashboardData.placement_end_date
                        )}`
                      : "Not Assigned"}
                  </strong>
                </div>
              </div>

              {placementUnlocked && (
                <Link
                  to="/student/placement"
                  className="card-link"
                >
                  View Placement Details →
                </Link>
              )}
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>
                  Attendance Overview
                </h3>

                <p>
                  Your field attendance
                </p>
              </div>

              <div className="attendance-center">
                <div className="circle">
                  {attendanceRate}%
                </div>

                <p
                  style={{
                    fontSize: "12px",
                  }}
                >
                  <strong>
                    {presentDays} Present •{" "}
                    {absentDays} Absent
                  </strong>
                </p>

                <p
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    marginTop: "15px",
                  }}
                >
                  Total attendance records:{" "}
                  {totalAttendance}
                </p>
              </div>

              {placementUnlocked && (
                <Link
                  to="/student/daily-logbook"
                  className="card-link"
                >
                  View Daily Logs →
                </Link>
              )}
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Reports</h3>

                <p>
                  Field placement reports
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,minmax(0,1fr))",
                  gap: "8px",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                    }}
                  >
                    Submitted
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "20px",
                      color: "#2563eb",
                    }}
                  >
                    {submittedReports}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                    }}
                  >
                    Pending
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "20px",
                      color: "#d97706",
                    }}
                  >
                    {pendingReports}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                    }}
                  >
                    Required
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "20px",
                    }}
                  >
                    {totalReports}
                  </strong>
                </div>
              </div>

              {placementUnlocked && (
                <Link
                  to="/student/report"
                  className="card-link"
                >
                  View All Reports →
                </Link>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default Dashboard;