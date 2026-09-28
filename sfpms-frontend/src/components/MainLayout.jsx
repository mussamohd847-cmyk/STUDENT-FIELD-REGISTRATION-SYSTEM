import { useLocation } from "react-router-dom";
import { useSidebar } from "./useSidebar";
import egazLogo from "../assets/egaz-logo.jpg";
import EmbeddedSidebarToggle from "./EmbeddedSidebarToggle";

const publicPaths = new Set([
  "/",
  "/login",
  "/student/login",
  "/register",
  "/student/register",
]);

function MainLayout({ children }) {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const isPublicPage = publicPaths.has(location.pathname);
  const isLearnMorePage = location.pathname.startsWith("/learn-more");

  if (isPublicPage) {
    return children;
  }

  return (
    <div className="sfpms-layout">
      {!isLearnMorePage && (
        <>
          <button
            type="button"
            className={`sfpms-sidebar-backdrop${
              isSidebarOpen ? " is-visible" : ""
            }`}
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          />

          <EmbeddedSidebarToggle
            placement="mobile-header"
            targetSelector=".sfpms-layout .dashboard-topbar, .sfpms-layout .dashboard-navbar, .sfpms-layout .daily-topbar, .sfpms-layout .topbar, .sfpms-layout .admin-topbar, .sfpms-layout .dashboard-header, .sfpms-layout .fs-page-header"
          />

          <EmbeddedSidebarToggle
            placement="mobile-close"
            targetSelector=".sfpms-layout .sfpms-sidebar-brand, .sfpms-layout .sidebar-header, .sfpms-layout .admin-sidebar-brand, .sfpms-layout .sidebar-logo"
          />

        </>
      )}

      <div
        className="sfpms-egaz-watermark"
        style={{ backgroundImage: `url(${egazLogo})` }}
      />

      {children}

      <style>{`
        .sfpms-layout {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .sfpms-sidebar-toggle {
          position: fixed;
          top: 20px;
          z-index: 1500;

          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 4px;

          padding: 0;
          margin: 0;

          border: 0;
          border-radius: 7px;

          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);

          cursor: pointer;

          transition: left 0.25s ease, background 0.2s ease;
        }

        .sfpms-sidebar-toggle:hover {
          background: #f8f9fa;
        }

        .sfpms-sidebar-toggle span {
          display: block;
          width: 18px;
          height: 2px;
          background: #1f2937;
          border-radius: 2px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .sfpms-sidebar-toggle.is-open {
          left: 242px;
        }

        .sfpms-sidebar-toggle.is-closed {
          left: 60px;
        }

        .sfpms-egaz-watermark {
          position: fixed;
          top: 50%;
          left: calc(50% + 125px);
          width: 520px;
          height: 520px;
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.055;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }

        .sfpms-layout > *:not(.sfpms-egaz-watermark) {
          position: relative;
        }

        @media (max-width: 1024px) {
          .sfpms-sidebar-toggle {
            top: 14px;
            left: 14px !important;
            width: 40px;
            height: 40px;
          }

          .sfpms-egaz-watermark {
            left: 50%;
            width: 420px;
            height: 420px;
            opacity: 0.045;
          }
        }

        @media (max-width: 576px) {
          .sfpms-sidebar-toggle {
            top: 10px;
            left: 10px !important;
            width: 38px;
            height: 38px;
          }

          .sfpms-egaz-watermark {
            width: 300px;
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
}

export default MainLayout;
