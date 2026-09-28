import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/organizations/";

const EGAZ_ORGANIZATION = {
  organization_code: "EGAZ",
  name: "e-Government Authority (eGAZ)",
  type: "Government Agency",
  address: "Zanzibar, Tanzania",
  region: "Urban West",
  district: "Zanzibar Urban/West",
  po_box: "P.O. Box 800 Zanzibar, Tanzania",
  email: "info@egaz.go.tz",
  phone: "+255 (0) 24 22 35688 / +255 (0) 24 22 35689",
  website: "www.egaz.go.tz",
  contact_person: "eGAZ",
  status: "ACTIVE",
};

function Organizations() {
  const [organization, setOrganization] = useState(
    EGAZ_ORGANIZATION
  );

  const [loading, setLoading] = useState(true);
  const [activeStudents, setActiveStudents] = useState(0);
  const [error, setError] = useState("");

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load organization");
      }

      const data = await response.json();

      let egaz = null;

      if (Array.isArray(data)) {
        egaz =
          data.find(
            (item) =>
              String(item.organization_code || "").toUpperCase() ===
                "EGAZ" ||
              String(item.name || "")
                .toLowerCase()
                .includes("egaz")
          ) || data[0];
      } else if (data && typeof data === "object") {
        egaz = data;
      }

      if (egaz) {
        setOrganization({
          ...EGAZ_ORGANIZATION,
          ...egaz,
          organization_code:
            egaz.organization_code ||
            egaz.code ||
            EGAZ_ORGANIZATION.organization_code,
          name:
            egaz.name ||
            EGAZ_ORGANIZATION.name,
          type:
            egaz.type ||
            EGAZ_ORGANIZATION.type,
          address:
            egaz.address ||
            EGAZ_ORGANIZATION.address,
          region:
            egaz.region ||
            EGAZ_ORGANIZATION.region,
          district:
            egaz.district ||
            EGAZ_ORGANIZATION.district,
          po_box:
            egaz.po_box ||
            egaz.poBox ||
            EGAZ_ORGANIZATION.po_box,
          email:
            egaz.email ||
            EGAZ_ORGANIZATION.email,
          phone:
            egaz.phone ||
            egaz.telephone ||
            EGAZ_ORGANIZATION.phone,
          website:
            egaz.website ||
            EGAZ_ORGANIZATION.website,
          contact_person:
            egaz.contact_person ||
            EGAZ_ORGANIZATION.contact_person,
          status:
            egaz.status ||
            EGAZ_ORGANIZATION.status,
        });

        setActiveStudents(
          Number(
            egaz.active_students ??
              egaz.assigned_students ??
              egaz.student_count ??
              egaz.total_students ??
              0
          )
        );
      } else {
        setOrganization(EGAZ_ORGANIZATION);
      }
    } catch (err) {
      console.error(err);

      setOrganization(EGAZ_ORGANIZATION);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  return (
    <div className="dashboard">

      <aside className="sidebar">
        <div className="sidebar-header">
          <img
            src="/image/egaz-logo.jpg"
            alt="E-GAZ"
            className="dashboard-logo"
          />

          <h5 className="fw-bold mt-2 mb-1">
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
            className="sidebar-link"
          >
            Applications
          </Link>

          <Link
            to="/admin/organizations"
            className="sidebar-link active"
          >
            Organization
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
            className="sidebar-link logout-link"
          >
            Logout
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">

        <div className="topbar">

          <div>
            <h4>
              Organization Management
            </h4>

            <small>
              Field placement organization
            </small>
          </div>

          <div className="admin-profile">

            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
            />

            <div>
              <strong>
                Welcome, Administrator
              </strong>

              <small>
                Admin / Coordinator
              </small>
            </div>

          </div>

        </div>

        <div className="organization-page">

          <div className="page-header">

            <div>
              <h1>
                Organization
              </h1>

              <p>
                All students are assigned to one official
                field placement organization.
              </p>
            </div>

            <div className="official-badge">
              OFFICIAL ORGANIZATION
            </div>

          </div>

          <div className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon blue">
                
              </div>

              <div>
                <small>
                  Total Organizations
                </small>

                <h2>
                  1
                </h2>

                <p>
                  Official organization
                </p>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <small>
                  Organization Status
                </small>

                <h2 className="success-text">
                  ACTIVE
                </h2>

                <p>
                  Available for placement
                </p>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon purple">
                
              </div>

              <div>
                <small>
                  Assigned Students
                </small>

                <h2 className="primary-text">
                  {activeStudents}
                </h2>

                <p>
                  Students using eGAZ
                </p>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">
                ∞
              </div>

              <div>
                <small>
                  Available Positions
                </small>

                <h2 className="warning-text">
                  100
                </h2>

                <p>
                  No placement limit
                </p>
              </div>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h4>
                  Official Field Placement Organization
                </h4>

                <p>
                  This organization is used by all students
                  in the SFPMS system.
                </p>
              </div>

              <span className="status-badge active">
                ACTIVE
              </span>

            </div>

            {loading ? (

              <div className="loading-state">
                Loading organization information...
              </div>

            ) : (

              <>

                <div className="organization-hero">

                  <div className="organization-logo-box">

                    <img
                      src="/image/egaz-logo.jpg"
                      alt="eGAZ Logo"
                    />

                  </div>

                  <div className="organization-title">

                    <span className="organization-code">
                      EGAZ
                    </span>

                    <h2>
                      {organization.name}
                    </h2>

                    <p>
                      Official Government Agency for
                      student field placement
                    </p>

                  </div>

                </div>

                <h5 className="subsection-title">
                  Organization Information
                </h5>

                <div className="details-grid">

                  <div className="detail-item">
                    <span>
                      Organization ID
                    </span>

                    <strong>
                      EGAZ
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Organization Name
                    </span>

                    <strong>
                      {organization.name}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Organization Type
                    </span>

                    <strong>
                      Government Agency
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Address
                    </span>

                    <strong>
                      Zanzibar, Tanzania
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Region
                    </span>

                    <strong>
                      Urban West
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      District
                    </span>

                    <strong>
                      Zanzibar Urban/West
                    </strong>
                  </div>

                  <div className="detail-item wide">
                    <span>
                      P.O. Box
                    </span>

                    <strong>
                      P.O. Box 800 Zanzibar, Tanzania
                    </strong>
                  </div>

                  <div className="detail-item wide">
                    <span>
                      Telephone
                    </span>

                    <strong>
                      +255 (0) 24 22 35688 / +255 (0) 24 22 35689
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Email
                    </span>

                    <strong>
                      info@egaz.go.tz
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Website
                    </span>

                    <strong>
                      www.egaz.go.tz
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Status
                    </span>

                    <span className="status-badge active">
                      ACTIVE
                    </span>
                  </div>

                  <div className="detail-item">
                    <span>
                      Assigned Students
                    </span>

                    <strong>
                      {activeStudents}
                    </strong>
                  </div>

                </div>

              </>

            )}

          </div>

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h4>
                  Placement Monitoring
                </h4>

                <p>
                  Current placement capacity for eGAZ.
                </p>
              </div>

            </div>

            <div className="monitor-grid">

              <div className="monitor-card blue-monitor">

                <span>
                  Total Positions
                </span>

                <h3>
                  100
                </h3>

                <p>
                  No maximum limit
                </p>

              </div>

              <div className="monitor-card green-monitor">

                <span>
                  Assigned Students
                </span>

                <h3>
                  {activeStudents}
                </h3>

                <p>
                  Students assigned
                </p>

              </div>

              <div className="monitor-card purple-monitor">

                <span>
                  Available Positions
                </span>

                <h3>
                  100
                </h3>

                <p>
                  No placement limit
                </p>

              </div>

            </div>

          </div>

          <div className="notice-card">

            <div className="notice-icon">
              !
            </div>

            <div>

              <h4>
                Single Organization Policy
              </h4>

              <p>
                SFPMS currently uses e-Government Authority
                (eGAZ) as the only field placement
                organization. Students do not select or
                register another organization. The number
                of placement positions is 100.
              </p>

            </div>

          </div>

        </div>

      </main>

      <style>{`

        * {
          box-sizing: border-box;
        }

        .dashboard {
          position: relative;
          min-height: 100vh;
          background: #f4f7fb;
          font-family: Inter, Poppins, Arial, sans-serif;
          color: #1e293b;
          overflow: hidden;
        }

        .dashboard::before {
          content: "";
          position: fixed;
          top: 50%;
          left: calc(50% + 125px);
          width: 500px;
          height: 500px;
          background: url("/image/egaz-logo.jpg") center / contain no-repeat;
          opacity: 0.06;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }

        .sidebar,
        .dashboard-main {
          position: relative;
          z-index: 1;
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
          box-shadow: 2px 0 12px rgba(15, 23, 42, 0.04);
        }

        .sidebar-header {
          padding: 25px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.18);
        }

        .sidebar-header h5 {
          color: #ffffff;
        }

        .sidebar-header small {
          color: rgba(255,255,255,0.75) !important;
        }

        .dashboard-logo {
          width: 52px;
          height: 52px;
          object-fit: contain;
          border-radius: 10px;
          background: #ffffff;
          padding: 3px;
        }

        .sidebar-menu {
          padding: 18px 12px;
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #ffffff;
          padding: 12px 15px;
          margin-bottom: 6px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.16);
          color: #ffffff;
          transform: translateX(2px);
        }

        .sidebar-link.active {
          background: rgba(255,255,255,0.20);
          color: #ffffff;
          box-shadow: 0 5px 14px rgba(0,0,0,0.10);
        }

        .sidebar-footer {
          padding: 15px 12px;
          border-top: 1px solid rgba(255,255,255,0.18);
        }

        .logout-link:hover {
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
          margin: 18px 20px 0;
          padding: 18px 24px;
          min-height: 82px;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: 0 8px 24px rgba(37,99,235,0.18);
        }

        .topbar h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .topbar small {
          display: block;
          margin-top: 4px;
          opacity: 0.82;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-profile img {
          width: 42px;
          height: 42px;
          object-fit: contain;
          border-radius: 10px;
          background: #ffffff;
          padding: 3px;
        }

        .admin-profile strong {
          display: block;
          font-size: 14px;
        }

        .organization-page {
          padding: 26px 20px 40px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 0 0 6px;
          font-size: 29px;
          font-weight: 750;
          color: #0f172a;
        }

        .page-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .official-badge {
          padding: 10px 14px;
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 22px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          min-height: 130px;
          box-shadow: 0 5px 18px rgba(15,23,42,0.045);
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .stat-icon.green {
          background: #f0fdf4;
          color: #16a34a;
        }

        .stat-icon.purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .stat-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .stat-card small {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-card h2 {
          margin: 6px 0 2px;
          font-size: 25px;
          color: #0f172a;
        }

        .stat-card p {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
        }

        .success-text {
          color: #16a34a !important;
        }

        .primary-text {
          color: #2563eb !important;
        }

        .warning-text {
          color: #ea580c !important;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 22px;
          box-shadow: 0 5px 18px rgba(15,23,42,0.045);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .card-header h4 {
          margin: 0 0 5px;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .card-header p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #15803d;
        }

        .loading-state {
          padding: 45px 20px;
          text-align: center;
          color: #64748b;
        }

        .organization-hero {
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 22px;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            #eff6ff,
            #f8fafc
          );
          border: 1px solid #dbeafe;
        }

        .organization-logo-box {
          width: 90px;
          height: 90px;
          background: #ffffff;
          border-radius: 16px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dbeafe;
          flex-shrink: 0;
        }

        .organization-logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
        }

        .organization-code {
          display: inline-block;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .organization-title h2 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 23px;
          font-weight: 750;
        }

        .organization-title p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .subsection-title {
          margin: 26px 0 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 15px;
          font-weight: 750;
          color: #0f172a;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .detail-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          min-height: 72px;
        }

        .detail-item.wide {
          grid-column: span 2;
        }

        .detail-item span:first-child {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 11px;
          font-weight: 650;
        }

        .detail-item strong {
          color: #1e293b;
          font-size: 13px;
          font-weight: 700;
          word-break: break-word;
        }

        .monitor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .monitor-card {
          padding: 22px;
          border-radius: 13px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .monitor-card span {
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
        }

        .monitor-card h3 {
          margin: 7px 0 4px;
          font-size: 30px;
          font-weight: 750;
        }

        .monitor-card p {
          margin: 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .blue-monitor {
          background: #eff6ff;
        }

        .blue-monitor h3 {
          color: #2563eb;
        }

        .green-monitor {
          background: #f0fdf4;
        }

        .green-monitor h3 {
          color: #16a34a;
        }

        .purple-monitor {
          background: #f5f3ff;
        }

        .purple-monitor h3 {
          color: #7c3aed;
        }

        .notice-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 18px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 14px;
        }

        .notice-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #fef3c7;
          color: #d97706;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          flex-shrink: 0;
        }

        .notice-card h4 {
          margin: 2px 0 5px;
          color: #92400e;
          font-size: 15px;
        }

        .notice-card p {
          margin: 0;
          color: #92400e;
          font-size: 13px;
          line-height: 1.6;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .details-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .detail-item.wide {
            grid-column: span 2;
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 210px;
          }

          .dashboard-main {
            margin-left: 210px;
            width: calc(100% - 210px);
          }

          .topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .monitor-grid {
            grid-template-columns: 1fr;
          }

          .organization-hero {
            align-items: flex-start;
          }
        }

        @media (max-width: 700px) {
          .sidebar {
            position: relative;
            width: 100%;
            height: auto;
          }

          .sidebar-menu {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .sidebar-footer {
            display: none;
          }

          .dashboard-main {
            margin-left: 0;
            width: 100%;
          }

          .topbar {
            margin: 10px;
          }

          .organization-page {
            padding: 18px 10px 30px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .detail-item.wide {
            grid-column: span 1;
          }

          .organization-hero {
            flex-direction: column;
          }

          .organization-logo-box {
            width: 75px;
            height: 75px;
          }

          .card-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .sidebar-menu {
            grid-template-columns: 1fr;
          }

          .topbar {
            padding: 16px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .dashboard-card {
            padding: 16px;
          }
        }

      `}</style>

    </div>
  );
}

export default Organizations;