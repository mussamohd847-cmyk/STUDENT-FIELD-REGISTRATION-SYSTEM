import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const defaultDashboard = {
  total_users: 0,
  total_students: 0,
  total_applications: 0,
  pending_applications: 0,
  approved_applications: 0,
  rejected_applications: 0,
  active_placements: 0,
  completed_placements: 0,
  total_organizations: 0,
  active_organizations: 0,
  total_supervisors: 0,
  active_supervisors: 0,
  applications_by_status: {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  },
  placements_by_status: {
    ACTIVE: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    PENDING: 0,
  },
};

function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState(defaultDashboard);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/dashboard/admin`
      );

      if (!response.ok) {
        throw new Error(
          `Dashboard request failed: ${response.status}`
        );
      }

      const data = await response.json();

      setDashboard({
        ...defaultDashboard,
        ...data,
        applications_by_status: {
          ...defaultDashboard.applications_by_status,
          ...(data.applications_by_status || {}),
        },
        placements_by_status: {
          ...defaultDashboard.placements_by_status,
          ...(data.placements_by_status || {}),
        },
      });
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const applicationTotal = useMemo(() => {
    return Object.values(
      dashboard.applications_by_status
    ).reduce(
      (total, value) =>
        total + Number(value || 0),
      0
    );
  }, [dashboard.applications_by_status]);

  const placementTotal = useMemo(() => {
    return Object.values(
      dashboard.placements_by_status
    ).reduce(
      (total, value) =>
        total + Number(value || 0),
      0
    );
  }, [dashboard.placements_by_status]);

  const getPercentage = (value, total) => {
    if (!total) {
      return 0;
    }

    return Math.round(
      (Number(value || 0) / total) * 100
    );
  };

  const pendingPercentage = getPercentage(
    dashboard.applications_by_status.PENDING,
    applicationTotal
  );

  const approvedPercentage = getPercentage(
    dashboard.applications_by_status.APPROVED,
    applicationTotal
  );

  const rejectedPercentage = getPercentage(
    dashboard.applications_by_status.REJECTED,
    applicationTotal
  );

  const pendingDegrees =
    pendingPercentage * 3.6;

  const approvedDegrees =
    approvedPercentage * 3.6;

  const approvedEnd =
    pendingDegrees + approvedDegrees;

  const donutStyle = {
    background:
      applicationTotal === 0
        ? "#e2e8f0"
        : `conic-gradient(
            #f59e0b 0deg ${pendingDegrees}deg,
            #16a34a ${pendingDegrees}deg ${approvedEnd}deg,
            #ef4444 ${approvedEnd}deg 360deg
          )`,
  };

  return (
    <>
      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f5f7fb;
          color: #f1f3f7;
        }

        .admin-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: 250px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(
            180deg,
            #2563eb 0%,
            #1d4ed8 100%
          );
          z-index: 1000;
          box-shadow: 8px 0 30px rgba(15, 23, 42, 0.08);
        }

        .admin-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        }

        .admin-sidebar-brand img {
          width: 46px;
          height: 46px;
          padding: 0;
          object-fit: contain;
          border-radius: 8px;
          background: transparent;
        }

        .admin-sidebar-brand h4 {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 800;
        }

        .admin-sidebar-brand span {
          display: block;
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 10px;
        }

        .admin-sidebar-nav {
          flex: 1;
          padding: 18px 12px;
          overflow-y: auto;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          width: 100%;
          min-height: 44px;
          margin-bottom: 6px;
          padding: 0 14px;
          border-radius: 11px;
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .admin-nav-link:hover {
          background: rgba(255, 255, 255, 0.13);
          color: #ffffff;
          transform: translateX(2px);
        }

        .admin-nav-link.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
        }

        .admin-sidebar-footer {
          padding: 14px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
        }

        .admin-logout {
          display: flex;
          align-items: center;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 11px;
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .admin-logout:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .admin-dashboard-main {
          min-height: 100vh;
          margin-left: 250px;
          padding: 20px;
        }

        .admin-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px 24px;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            #2563eb 0%,
            #1d4ed8 100%
          );
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.18);
        }

        .admin-topbar p {
          margin: 0 0 4px;
          color: rgba(255, 255, 255, 0.76);
          font-size: 11px;
        }

        .admin-topbar h1 {
          margin: 0;
          color: #ffffff;
          font-size: 21px;
          font-weight: 800;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-profile img {
          width: 44px;
          height: 44px;
          padding: 3px;
          object-fit: contain;
          border-radius: 12px;
          background: #ffffff;
        }

        .admin-profile strong {
          display: block;
          color: #ffffff;
          font-size: 13px;
        }

        .admin-profile span {
          display: block;
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 10px;
        }

        .admin-content {
          padding-top: 24px;
        }

        .admin-page-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .admin-eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .admin-page-heading h2 {
          margin: 0;
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
        }

        .admin-page-heading p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .admin-refresh-button {
          min-height: 40px;
          padding: 0 16px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 5px 16px rgba(15, 23, 42, 0.05);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .admin-refresh-button:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: #bfdbfe;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
        }

        .admin-refresh-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .admin-error {
          margin-bottom: 20px;
          padding: 13px 16px;
          border: 1px solid #fecaca;
          border-radius: 11px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
        }

        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 20px;
        }

        .admin-stat-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: #ffffff;
          box-shadow: 0 7px 22px rgba(15, 23, 42, 0.04);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .admin-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
        }

        .admin-stat-icon {
          width: 46px;
          height: 46px;
          min-width: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          font-size: 11px;
          font-weight: 900;
        }

        .admin-stat-icon.blue {
          background: #dbeafe;
          color: #2563eb;
        }

        .admin-stat-icon.purple {
          background: #ede9fe;
          color: #7c3aed;
        }

        .admin-stat-icon.orange {
          background: #ffedd5;
          color: #ea580c;
        }

        .admin-stat-icon.green {
          background: #dcfce7;
          color: #16a34a;
        }

        .admin-stat-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
        }

        .admin-stat-card strong {
          display: block;
          margin: 4px 0;
          color: #0f172a;
          font-size: 29px;
          font-weight: 800;
          line-height: 1.1;
        }

        .admin-stat-card small {
          color: #94a3b8;
          font-size: 10px;
        }

        .admin-chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .admin-lower-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .admin-panel {
          min-width: 0;
          padding: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
        }

        .admin-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .admin-panel-header h3 {
          margin: 0;
          color: #0f172a;
          font-size: 16px;
          font-weight: 800;
        }

        .admin-panel-header p {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .admin-panel-total {
          min-width: 42px;
          padding: 7px 10px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          text-align: center;
          font-size: 12px;
          font-weight: 800;
        }

        .application-chart {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .application-donut {
          width: 178px;
          height: 178px;
          min-width: 178px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.5s ease;
        }

        .application-donut-inner {
          width: 112px;
          height: 112px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border-radius: 50%;
          background: #ffffff;
        }

        .application-donut-inner strong {
          color: #0f172a;
          font-size: 27px;
          font-weight: 800;
          line-height: 1;
        }

        .application-donut-inner span {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 10px;
        }

        .application-legend {
          flex: 1;
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .legend-row:last-child {
          border-bottom: none;
        }

        .legend-row > span {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-size: 11px;
          font-weight: 600;
        }

        .legend-row strong {
          color: #0f172a;
          font-size: 12px;
          font-weight: 800;
        }

        .legend-row strong small {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          display: inline-block;
          border-radius: 50%;
        }

        .legend-dot.pending {
          background: #f59e0b;
        }

        .legend-dot.approved {
          background: #16a34a;
        }

        .legend-dot.rejected {
          background: #ef4444;
        }

        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .bar-chart-row {
          display: grid;
          grid-template-columns: 100px 1fr 42px;
          align-items: center;
          gap: 10px;
        }

        .bar-chart-label {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .bar-chart-label span {
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
        }

        .bar-chart-label strong {
          color: #0f172a;
          font-size: 12px;
          font-weight: 800;
        }

        .bar-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #eef2f7;
        }

        .bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s ease;
        }

        .pending-fill {
          background: #f59e0b;
        }

        .approved-fill {
          background: #16a34a;
        }

        .rejected-fill {
          background: #ef4444;
        }

        .bar-chart-row > small {
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          text-align: right;
        }

        .placement-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .placement-box {
          padding: 15px;
          border-radius: 13px;
        }

        .placement-box span {
          display: block;
          margin-bottom: 6px;
          font-size: 10px;
          font-weight: 700;
        }

        .placement-box strong {
          display: block;
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
        }

        .placement-box.active {
          background: #ecfdf5;
          color: #047857;
        }

        .placement-box.completed {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .placement-box.pending {
          background: #fffbeb;
          color: #b45309;
        }

        .placement-box.cancelled {
          background: #fef2f2;
          color: #b91c1c;
        }

        .placement-progress {
          margin-top: 24px;
        }

        .placement-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
        }

        .placement-progress-header span {
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
        }

        .placement-progress-header strong {
          color: #0f172a;
          font-size: 13px;
        }

        .placement-progress-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .placement-progress-active {
          height: 100%;
          border-radius: 999px;
          background: #2563eb;
          transition: width 0.6s ease;
        }

        .placement-progress > small {
          display: block;
          margin-top: 7px;
          color: #94a3b8;
          font-size: 10px;
        }

        .resource-list {
          display: flex;
          flex-direction: column;
        }

        .resource-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 14px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .resource-row:last-child {
          border-bottom: none;
        }

        .resource-row > span {
          color: #475569;
          font-size: 11px;
          font-weight: 600;
        }

        .resource-row > div {
          text-align: right;
        }

        .resource-row strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
          font-weight: 800;
        }

        .resource-row small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        .quick-actions-panel {
          margin-bottom: 0;
        }

        .admin-quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .admin-quick-actions a {
          padding: 11px 15px;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .admin-quick-actions a:hover {
          transform: translateY(-2px);
          background: #dbeafe;
          border-color: #bfdbfe;
        }

        @media (max-width: 1200px) {
          .admin-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-chart-grid,
          .admin-lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .admin-sidebar {
            position: static;
            width: 100%;
            min-height: auto;
          }

          .admin-sidebar-nav {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .admin-nav-link {
            width: auto;
            margin: 0;
          }

          .admin-dashboard-main {
            margin-left: 0;
            padding: 14px;
          }

          .admin-topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-page-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .application-chart {
            flex-direction: column;
            align-items: flex-start;
          }

          .application-legend {
            width: 100%;
          }

          .placement-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 560px) {
          .admin-stat-grid {
            grid-template-columns: 1fr;
          }

          .placement-grid {
            grid-template-columns: 1fr 1fr;
          }

          .bar-chart-row {
            grid-template-columns: 75px 1fr 35px;
          }

          .admin-panel {
            padding: 17px;
          }

          .application-donut {
            width: 155px;
            height: 155px;
            min-width: 155px;
          }

          .application-donut-inner {
            width: 98px;
            height: 98px;
          }
        }
      `}</style>

      <div className="admin-dashboard">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
            />

            <div>
              <h4>SFPMS</h4>
              <span>Admin / Coordinator</span>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            <Link
              to="/admin/dashboard"
              className="admin-nav-link active"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              className="admin-nav-link"
            >
              Users
            </Link>

            <Link
              to="/admin/applications"
              className="admin-nav-link"
            >
              Applications
            </Link>

            <Link
              to="/admin/organizations"
              className="admin-nav-link"
            >
              Organizations
            </Link>

            <Link
              to="/admin/supervisors"
              className="admin-nav-link"
            >
              Supervisors
            </Link>

            <Link
              to="/admin/reports"
              className="admin-nav-link"
            >
              Reports
            </Link>
            
            <Link
              to="/admin/settings"
              className="admin-nav-link"
            >
              System Settings
            </Link>
          </nav>

          <div className="admin-sidebar-footer">
            <Link
              to="/login"
              className="admin-logout"
            >
              Logout
            </Link>
          </div>
        </aside>

        <main className="admin-dashboard-main">
          <header className="admin-topbar">
            <div>
              <p>
                Student Field Placement Management System
              </p>

              <h1>Admin Dashboard</h1>
            </div>

            <div className="admin-profile">
              <img
                src="/image/egaz-logo.jpg"
                alt="E-GAZ"
              />

              <div>
                <strong>Administrator</strong>
                <span>System Coordinator</span>
              </div>
            </div>
          </header>

          <div className="admin-content">
            <div className="admin-page-heading">
              <div>
                <span className="admin-eyebrow">
                  SYSTEM OVERVIEW
                </span>

                <h2>Dashboard Overview</h2>

                <p>
                  Monitor students, applications,
                  placements and supervisors.
                </p>
              </div>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={loadDashboard}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            <section className="admin-stat-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon blue">
                  ST
                </div>

                <div>
                  <span>Total Students</span>

                  <strong>
                    {loading
                      ? "..."
                      : dashboard.total_students}
                  </strong>

                  <small>
                    Registered students
                  </small>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon purple">
                  AP
                </div>

                <div>
                  <span>Total Applications</span>

                  <strong>
                    {loading
                      ? "..."
                      : dashboard.total_applications}
                  </strong>

                  <small>
                    All submitted applications
                  </small>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon orange">
                  PN
                </div>

                <div>
                  <span>Pending Applications</span>

                  <strong>
                    {loading
                      ? "..."
                      : dashboard.pending_applications}
                  </strong>

                  <small>
                    Waiting for review
                  </small>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon green">
                  PL
                </div>

                <div>
                  <span>Active Placements</span>

                  <strong>
                    {loading
                      ? "..."
                      : dashboard.active_placements}
                  </strong>

                  <small>
                    Current placements
                  </small>
                </div>
              </div>
            </section>

            <section className="admin-chart-grid">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <h3>
                      Application Status
                    </h3>

                    <p>
                      Current application distribution
                    </p>
                  </div>

                  <div className="admin-panel-total">
                    {applicationTotal}
                  </div>
                </div>

                <div className="application-chart">
                  <div
                    className="application-donut"
                    style={donutStyle}
                  >
                    <div className="application-donut-inner">
                      <strong>
                        {applicationTotal}
                      </strong>

                      <span>
                        Applications
                      </span>
                    </div>
                  </div>

                  <div className="application-legend">
                    <div className="legend-row">
                      <span>
                        <i className="legend-dot pending" />
                        Pending
                      </span>

                      <strong>
                        {
                          dashboard
                            .applications_by_status
                            .PENDING
                        }
                        {" "}
                        <small>
                          ({pendingPercentage}%)
                        </small>
                      </strong>
                    </div>

                    <div className="legend-row">
                      <span>
                        <i className="legend-dot approved" />
                        Approved
                      </span>

                      <strong>
                        {
                          dashboard
                            .applications_by_status
                            .APPROVED
                        }
                        {" "}
                        <small>
                          ({approvedPercentage}%)
                        </small>
                      </strong>
                    </div>

                    <div className="legend-row">
                      <span>
                        <i className="legend-dot rejected" />
                        Rejected
                      </span>

                      <strong>
                        {
                          dashboard
                            .applications_by_status
                            .REJECTED
                        }
                        {" "}
                        <small>
                          ({rejectedPercentage}%)
                        </small>
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <h3>
                      Application Performance
                    </h3>

                    <p>
                      Progress by application status
                    </p>
                  </div>
                </div>

                <div className="bar-chart">
                  <div className="bar-chart-row">
                    <div className="bar-chart-label">
                      <span>Pending</span>

                      <strong>
                        {
                          dashboard
                            .applications_by_status
                            .PENDING
                        }
                      </strong>
                    </div>

                    <div className="bar-track">
                      <div
                        className="bar-fill pending-fill"
                        style={{
                          width: `${pendingPercentage}%`,
                        }}
                      />
                    </div>

                    <small>
                      {pendingPercentage}%
                    </small>
                  </div>

                  <div className="bar-chart-row">
                    <div className="bar-chart-label">
                      <span>Approved</span>

                      <strong>
                        {
                          dashboard
                            .applications_by_status
                            .APPROVED
                        }
                      </strong>
                    </div>

                    <div className="bar-track">
                      <div
                        className="bar-fill approved-fill"
                        style={{
                          width: `${approvedPercentage}%`,
                        }}
                      />
                    </div>

                    <small>
                      {approvedPercentage}%
                    </small>
                  </div>

                  <div className="bar-chart-row">
                    <div className="bar-chart-label">
                      <span>Rejected</span>

                      <strong>
                        {
                          dashboard
                            .applications_by_status
                            .REJECTED
                        }
                      </strong>
                    </div>

                    <div className="bar-track">
                      <div
                        className="bar-fill rejected-fill"
                        style={{
                          width: `${rejectedPercentage}%`,
                        }}
                      />
                    </div>

                    <small>
                      {rejectedPercentage}%
                    </small>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-lower-grid">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <h3>
                      Placement Overview
                    </h3>

                    <p>
                      Placement status across the system
                    </p>
                  </div>
                </div>

                <div className="placement-grid">
                  <div className="placement-box active">
                    <span>Active</span>

                    <strong>
                      {dashboard
                        .placements_by_status
                        .ACTIVE}
                    </strong>
                  </div>

                  <div className="placement-box completed">
                    <span>Completed</span>

                    <strong>
                      {dashboard
                        .placements_by_status
                        .COMPLETED}
                    </strong>
                  </div>

                  <div className="placement-box pending">
                    <span>Pending</span>

                    <strong>
                      {dashboard
                        .placements_by_status
                        .PENDING}
                    </strong>
                  </div>

                  <div className="placement-box cancelled">
                    <span>Cancelled</span>

                    <strong>
                      {dashboard
                        .placements_by_status
                        .CANCELLED}
                    </strong>
                  </div>
                </div>

                <div className="placement-progress">
                  <div className="placement-progress-header">
                    <span>
                      Total Placements
                    </span>

                    <strong>
                      {placementTotal}
                    </strong>
                  </div>

                  <div className="placement-progress-track">
                    <div
                      className="placement-progress-active"
                      style={{
                        width: `${getPercentage(
                          dashboard
                            .placements_by_status
                            .ACTIVE,
                          placementTotal
                        )}%`,
                      }}
                    />
                  </div>

                  <small>
                    {
                      getPercentage(
                        dashboard
                          .placements_by_status
                          .ACTIVE,
                        placementTotal
                      )
                    }
                    % currently active
                  </small>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <h3>
                      System Resources
                    </h3>

                    <p>
                      Current system resources
                    </p>
                  </div>
                </div>

                <div className="resource-list">
                  <div className="resource-row">
                    <span>
                      Organizations
                    </span>

                    <div>
                      <strong>
                        {
                          dashboard.total_organizations
                        }
                      </strong>

                      <small>
                        {
                          dashboard
                            .active_organizations
                        }{" "}
                        active
                      </small>
                    </div>
                  </div>

                  <div className="resource-row">
                    <span>
                      Supervisors
                    </span>

                    <div>
                      <strong>
                        {
                          dashboard.total_supervisors
                        }
                      </strong>

                      <small>
                        {
                          dashboard
                            .active_supervisors
                        }{" "}
                        active
                      </small>
                    </div>
                  </div>

                  <div className="resource-row">
                    <span>
                      Users
                    </span>

                    <div>
                      <strong>
                        {dashboard.total_users}
                      </strong>

                      <small>
                        System accounts
                      </small>
                    </div>
                  </div>

                  <div className="resource-row">
                    <span>
                      Completed Placements
                    </span>

                    <div>
                      <strong>
                        {
                          dashboard
                            .completed_placements
                        }
                      </strong>

                      <small>
                        Finished placements
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-panel quick-actions-panel">
              <div className="admin-panel-header">
                <div>
                  <h3>Quick Actions</h3>

                  <p>
                    Access frequently used
                    administration modules.
                  </p>
                </div>
              </div>

              <div className="admin-quick-actions">
                <Link to="/admin/users">
                  Manage Users
                </Link>

                <Link to="/admin/applications">
                  Review Applications
                </Link>

                <Link to="/admin/organizations">
                  Manage Organizations
                </Link>

                <Link to="/admin/supervisors">
                  Manage Supervisors
                </Link>

                <Link to="/admin/reports">
                  View Reports
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;


