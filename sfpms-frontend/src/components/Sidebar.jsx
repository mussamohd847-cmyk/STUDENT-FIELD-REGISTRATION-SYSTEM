import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "./useSidebar";
import api from "../services/api";
import fieldLogo from "../assets/field-logo-transparent.png";

const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),

  Application: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),

  Placement: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),

  Logs: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),

  Report: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),

  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

function Sidebar() {
  const { isSidebarOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const storedUser = JSON.parse(
    localStorage.getItem("sfpms_user") || "null"
  );

  useEffect(() => {
    const loadApplicationStatus = async () => {
      if (!storedUser?.id) {
        setLoadingStatus(false);
        return;
      }

      try {
        const applications = await api.get(
          `/applications/?student_id=${storedUser.id}`
        );

        if (Array.isArray(applications) && applications.length > 0) {
          const latest = [...applications].sort(
            (a, b) =>
              new Date(b.created_at || 0) -
              new Date(a.created_at || 0)
          )[0];

          setApplicationStatus(latest.status);
        } else {
          setApplicationStatus(null);
        }
      } catch {
        setApplicationStatus(null);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadApplicationStatus();
  }, [storedUser?.id]);

  const isApproved =
    applicationStatus &&
    applicationStatus.toString().toUpperCase() === "APPROVED";

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  return (
    <>
      <style>{`
        .sfpms-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 260px;
          height: 100vh;
          background: #245bb5;
          border-right: 1px solid #1e4a91;
          display: flex;
          flex-direction: column;
          z-index: 1200;
          overflow: hidden;
          transition: transform 0.3s ease, width 0.3s ease;
        }

        .sfpms-sidebar.open {
          width: 260px;
          transform: translateX(0);
        }

        .sfpms-sidebar.collapsed {
          width: 78px;
          transform: translateX(0);
        }

        .sfpms-sidebar-brand {
          width: 100%;
          height: 78px;
          min-height: 78px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #245bb5;
          border-bottom: 1px solid rgba(255,255,255,0.18);
          overflow: hidden;
          flex-shrink: 0;
        }

        .sfpms-sidebar-logo {
          width: 46px;
          height: 46px;
          min-width: 46px;
          object-fit: contain;
        }

        .sfpms-sidebar-brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
          white-space: nowrap;
        }

        .sfpms-sidebar-brand-text strong {
          color: #fff;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.2;
        }

        .sfpms-sidebar-brand-text small {
          color: rgba(255,255,255,0.75);
          font-size: 11px;
          margin-top: 3px;
        }

        .sfpms-sidebar.collapsed .sfpms-sidebar-brand {
          justify-content: center;
          padding: 12px 8px;
        }

        .sfpms-sidebar.collapsed .sfpms-sidebar-brand-text {
          width: 0;
          opacity: 0;
          visibility: hidden;
          overflow: hidden;
        }

        .sfpms-sidebar-menu {
          width: 100%;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding: 16px 10px 0;
          overflow: hidden;
          background: #245bb5;
        }

        .sfpms-sidebar-navigation {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
        }

        .sfpms-sidebar-navigation a {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 14px;
          margin-bottom: 6px;
          border-radius: 10px;
          color: rgba(255,255,255,0.88);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          transition: all 0.2s;
        }

        .sfpms-sidebar-navigation a:hover {
          background: rgba(255,255,255,0.14);
          color: #fff;
        }

        .sfpms-sidebar-navigation a.active {
          background: #fff;
          color: #245bb5;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        }

        .sfpms-sidebar-menu-icon {
          width: 22px;
          min-width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: inherit;
        }

        .sfpms-sidebar.collapsed .sfpms-sidebar-navigation a {
          justify-content: center;
          padding-left: 0;
          padding-right: 0;
        }

        .sfpms-sidebar.collapsed .sfpms-sidebar-menu-text {
          width: 0;
          opacity: 0;
          visibility: hidden;
          overflow: hidden;
        }

        .sfpms-sidebar-logout-container {
          width: 100%;
          margin-top: auto;
          padding: 16px 10px;
          background: #245bb5;
          flex-shrink: 0;
          border-top: 1px solid rgba(255,255,255,0.18);
        }

        .sfpms-sidebar-logout {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 14px;
          border: none;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sfpms-sidebar-logout:hover {
          background: #fff;
          color: #245bb5;
        }

        .sfpms-sidebar.collapsed .sfpms-sidebar-logout {
          justify-content: center;
          padding-left: 0;
          padding-right: 0;
          background: transparent;
        }

        .sfpms-sidebar.collapsed .sfpms-sidebar-logout .sfpms-sidebar-menu-text {
          width: 0;
          opacity: 0;
          visibility: hidden;
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .sfpms-sidebar {
            width: 280px;
            max-width: 85vw;
            transform: translateX(-105%);
            box-shadow: 8px 0 30px rgba(0,0,0,0.18);
          }

          .sfpms-sidebar.open {
            width: 280px;
            max-width: 85vw;
            transform: translateX(0);
          }

          .sfpms-sidebar.collapsed {
            width: 280px;
            max-width: 85vw;
            transform: translateX(-105%);
          }
        }

        @media (max-width: 576px) {
          .sfpms-sidebar,
          .sfpms-sidebar.open,
          .sfpms-sidebar.collapsed {
            width: min(280px, 85vw);
          }
        }
      `}</style>

      <aside
        className={`sfpms-sidebar ${
          isSidebarOpen ? "open" : "collapsed"
        }`}
      >
        <div className="sfpms-sidebar-brand">
          <img
            src={fieldLogo}
            alt="SFPMS"
            className="sfpms-sidebar-logo"
          />

          <div className="sfpms-sidebar-brand-text">
            <strong>SFPMS</strong>
            <small>Student Portal</small>
          </div>
        </div>

        <div className="sfpms-sidebar-menu">
          <div className="sfpms-sidebar-navigation">
            <Link
              to="/student/dashboard"
              className={isActive("/student/dashboard")}
            >
              <span className="sfpms-sidebar-menu-icon">
                <Icons.Dashboard />
              </span>
              <span className="sfpms-sidebar-menu-text">
                Dashboard
              </span>
            </Link>

            {!loadingStatus && !isApproved && (
              <Link
                to="/student/application"
                className={isActive("/student/application")}
              >
                <span className="sfpms-sidebar-menu-icon">
                  <Icons.Application />
                </span>
                <span className="sfpms-sidebar-menu-text">
                  Application
                </span>
              </Link>
            )}

            {!loadingStatus && isApproved && (
              <>
                <Link
                  to="/student/placement"
                  className={isActive("/student/placement")}
                >
                  <span className="sfpms-sidebar-menu-icon">
                    <Icons.Placement />
                  </span>
                  <span className="sfpms-sidebar-menu-text">
                    Placement
                  </span>
                </Link>

                <Link
                  to="/student/daily-logbook"
                  className={isActive("/student/daily-logbook")}
                >
                  <span className="sfpms-sidebar-menu-icon">
                    <Icons.Logs />
                  </span>
                  <span className="sfpms-sidebar-menu-text">
                    Daily Logs
                  </span>
                </Link>

                <Link
                  to="/student/report"
                  className={isActive("/student/report")}
                >
                  <span className="sfpms-sidebar-menu-icon">
                    <Icons.Report />
                  </span>
                  <span className="sfpms-sidebar-menu-text">
                    Report
                  </span>
                </Link>
              </>
            )}
          </div>

          <div className="sfpms-sidebar-logout-container">
            <button
              type="button"
              className="sfpms-sidebar-logout"
              onClick={handleLogout}
            >
              <span className="sfpms-sidebar-menu-icon">
                <Icons.Logout />
              </span>

              <span className="sfpms-sidebar-menu-text">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;