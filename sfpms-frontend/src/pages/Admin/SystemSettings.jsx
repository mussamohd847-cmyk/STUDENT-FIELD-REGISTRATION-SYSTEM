import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/settings/";

const DEFAULT_SETTINGS = {
  systemName: "Student Field Placement Management System",
  institutionName: "Zanzibar Government",
  email: "info@sfpms.com",
  phone: "+255 777 000 000",
  address: "Zanzibar, Tanzania",
  academicYear: "2026/2027",
  placementPeriod: "September - December",

  applicationOpen: true,
  applicationDeadline: "2026-09-30",
  allowApplicationEdit: true,
  requireAdminApproval: true,
  requireSupervisorApproval: true,

  placementStartDate: "2026-09-01",
  placementEndDate: "2026-12-31",
  maxStudentsOrganization: 10,
  placementApproval: true,

  emailNotification: true,
  newApplicationNotification: true,
  approvalNotification: true,
  rejectionNotification: true,
  placementNotification: true,
  logbookNotification: true,

  minimumPasswordLength: 8,
  sessionTimeout: 30,
  allowStudentRegistration: true,
  emailVerification: false,
  accountLockout: true,

  requireDailyEntry: true,
  logbookApproval: true,
  allowEditSubmittedLog: false,
  workingHours: 8,
  minimumRequiredDays: 30,

  reportInstitutionName: "Zanzibar Government",
  reportFooter: "Student Field Placement Management System",
  showLogoOnReport: true,
  showSignature: true,
  dateFormat: "DD/MM/YYYY",
};

function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const data = await response.json();

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to load settings from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data.settings,
      });

      alert("Settings saved successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all settings?"
    );

    if (!confirmReset) return;

    try {
      setSaving(true);

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(DEFAULT_SETTINGS),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset settings");
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data.settings,
      });

      alert("Settings reset successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to reset settings.");
    } finally {
      setSaving(false);
    }
  };

  const tabButton = (id, title) => (
    <button
      type="button"
      className={`settings-tab ${activeTab === id ? "active" : ""}`}
      onClick={() => setActiveTab(id)}
    >
      {title}
    </button>
  );

  if (loading) {
    return (
      <div className="dashboard settings-dashboard">
        <div className="dashboard-content">
          <div className="dashboard-card settings-card">
            <h5>Loading settings...</h5>
          </div>
        </div>

        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Inter, Poppins, Arial, sans-serif;
            background: #f4f7fb;
            color: #0f172a;
          }

          .settings-dashboard {
            min-height: 100vh;
            background: #f4f7fb;
          }

          .settings-dashboard .dashboard-content {
            min-height: 100vh;
            background: #f4f7fb;
            padding: 18px;
          }

          .dashboard-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
            padding: 26px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard settings-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <img
            src="/image/egaz-logo.jpg"
            alt="E-GAZ"
            className="dashboard-logo"
          />
          <h5>SFPM System</h5>
          <small>Admin / Coordinator</small>
        </div>

        <div className="sidebar-menu">
          <Link to="/admin/dashboard" className="sidebar-link">
            Dashboard
          </Link>

          <Link to="/admin/users" className="sidebar-link">
            Users
          </Link>

          <Link to="/admin/applications" className="sidebar-link">
            Applications
          </Link>

          <Link to="/admin/organizations" className="sidebar-link">
            Organizations
          </Link>

          <Link to="/admin/supervisors" className="sidebar-link">
            Supervisors
          </Link>

          <Link to="/admin/reports" className="sidebar-link">
            Reports
          </Link>

          <Link
            to="/admin/settings"
            className="sidebar-link active"
          >
            Settings
          </Link>
        </div>

        <div className="sidebar-footer">
          <Link to="/login" className="sidebar-link logout-link">
            Logout
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-navbar">
          <div>
            <h5 className="mb-0 fw-bold">
              System Settings
            </h5>

            <small>
              Configure and manage system settings
            </small>
          </div>

          <div className="admin-welcome">
            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo"
            />

            <span>
              Welcome, Admin
            </span>
          </div>
        </div>

        <div className="container-fluid p-4 settings-page">
          <div className="settings-header">
            <div>
              <h2>
                System Settings
              </h2>

              <p>
                Manage system configuration and preferences.
              </p>
            </div>

            <div className="settings-header-actions">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetSettings}
                disabled={saving}
              >
                Reset
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          <div className="dashboard-card settings-tabs-card">
            <div className="settings-tabs">
              {tabButton("general", "General")}
              {tabButton("applications", "Applications")}
              {tabButton("placement", "Placement")}
              {tabButton("notifications", "Notifications")}
              {tabButton("security", "Security")}
              {tabButton("logbook", "Logbook")}
              {tabButton("reports", "Reports")}
              {tabButton("system", "System Info")}
            </div>
          </div>

          {activeTab === "general" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon blue"></div>

                <div>
                  <h5>General Settings</h5>
                  <p>
                    Basic information about the system and institution.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    System Name
                  </label>

                  <input
                    type="text"
                    name="systemName"
                    className="form-control"
                    value={settings.systemName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Institution Name
                  </label>

                  <input
                    type="text"
                    name="institutionName"
                    className="form-control"
                    value={settings.institutionName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={settings.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={settings.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={settings.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Academic Year
                  </label>

                  <input
                    type="text"
                    name="academicYear"
                    className="form-control"
                    value={settings.academicYear}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Placement Period
                  </label>

                  <input
                    type="text"
                    name="placementPeriod"
                    className="form-control"
                    value={settings.placementPeriod}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon green"></div>

                <div>
                  <h5>Application Settings</h5>
                  <p>
                    Control how student applications are handled.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    Application Deadline
                  </label>

                  <input
                    type="date"
                    name="applicationDeadline"
                    className="form-control"
                    value={settings.applicationDeadline || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Application Status
                  </label>

                  <div className="setting-option">
                    <div>
                      <strong>
                        Applications
                      </strong>

                      <small>
                        Allow students to submit applications
                      </small>
                    </div>

                    <label className="switch">
                      <input
                        type="checkbox"
                        name="applicationOpen"
                        checked={settings.applicationOpen}
                        onChange={handleChange}
                      />

                      <span className="slider"></span>
                    </label>
                  </div>

                  <span
                    className={`status-label ${
                      settings.applicationOpen
                        ? "status-open"
                        : "status-closed"
                    }`}
                  >
                    {settings.applicationOpen
                      ? "Applications Open"
                      : "Applications Closed"}
                  </span>
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-options">
                <label className="setting-option">
                  <div>
                    <strong>
                      Allow students to edit applications
                    </strong>

                    <small>
                      Students can modify their submitted applications.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="allowApplicationEdit"
                      checked={settings.allowApplicationEdit}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>
                      Require Admin approval
                    </strong>

                    <small>
                      Applications must be approved by an administrator.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="requireAdminApproval"
                      checked={settings.requireAdminApproval}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>
                      Require Supervisor approval
                    </strong>

                    <small>
                      Applications require supervisor approval.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="requireSupervisorApproval"
                      checked={settings.requireSupervisorApproval}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>
              </div>
            </div>
          )}

          {activeTab === "placement" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon purple"></div>

                <div>
                  <h5>Placement Settings</h5>

                  <p>
                    Configure student field placement requirements.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    Placement Start Date
                  </label>

                  <input
                    type="date"
                    name="placementStartDate"
                    className="form-control"
                    value={settings.placementStartDate || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Placement End Date
                  </label>

                  <input
                    type="date"
                    name="placementEndDate"
                    className="form-control"
                    value={settings.placementEndDate || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Maximum Students per Organization
                  </label>

                  <input
                    type="number"
                    name="maxStudentsOrganization"
                    className="form-control"
                    min="1"
                    value={settings.maxStudentsOrganization}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Placement Approval
                  </label>

                  <div className="setting-option single">
                    <div>
                      <strong>
                        Require placement approval
                      </strong>

                      <small>
                        Placements must be approved before activation.
                      </small>
                    </div>

                    <label className="switch">
                      <input
                        type="checkbox"
                        name="placementApproval"
                        checked={settings.placementApproval}
                        onChange={handleChange}
                      />

                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon orange"></div>

                <div>
                  <h5>Notification Settings</h5>

                  <p>
                    Manage system notifications.
                  </p>
                </div>
              </div>

              <div className="notification-main">
                <div>
                  <strong>
                    Enable Email Notifications
                  </strong>

                  <small>
                    Send important system updates through email.
                  </small>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="emailNotification"
                    checked={settings.emailNotification}
                    onChange={handleChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-options">
                <label className="setting-option">
                  <div>
                    <strong>New Application</strong>

                    <small>
                      Notify administrators when a new application is submitted.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="newApplicationNotification"
                      checked={settings.newApplicationNotification}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>Application Approved</strong>

                    <small>
                      Notify students when an application is approved.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="approvalNotification"
                      checked={settings.approvalNotification}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>Application Rejected</strong>

                    <small>
                      Notify students when an application is rejected.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="rejectionNotification"
                      checked={settings.rejectionNotification}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>Placement Assigned</strong>

                    <small>
                      Notify students when they are assigned to an organization.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="placementNotification"
                      checked={settings.placementNotification}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>Logbook Submitted</strong>

                    <small>
                      Notify supervisors when a logbook is submitted.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="logbookNotification"
                      checked={settings.logbookNotification}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon red"></div>

                <div>
                  <h5>Security Settings</h5>

                  <p>
                    Configure account and login security.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    Minimum Password Length
                  </label>

                  <input
                    type="number"
                    name="minimumPasswordLength"
                    className="form-control"
                    min="6"
                    value={settings.minimumPasswordLength}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Session Timeout (Minutes)
                  </label>

                  <input
                    type="number"
                    name="sessionTimeout"
                    className="form-control"
                    min="5"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-options">
                <label className="setting-option">
                  <div>
                    <strong>Allow Student Registration</strong>

                    <small>
                      Allow new students to create accounts.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="allowStudentRegistration"
                      checked={settings.allowStudentRegistration}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>Require Email Verification</strong>

                    <small>
                      Students must verify their email before accessing the system.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="emailVerification"
                      checked={settings.emailVerification}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>Enable Account Lockout</strong>

                    <small>
                      Lock accounts after multiple failed login attempts.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="accountLockout"
                      checked={settings.accountLockout}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>
              </div>
            </div>
          )}

          {activeTab === "logbook" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon teal"></div>

                <div>
                  <h5>Logbook Settings</h5>

                  <p>
                    Configure student daily field logbook requirements.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    Working Hours per Day
                  </label>

                  <input
                    type="number"
                    name="workingHours"
                    className="form-control"
                    min="1"
                    value={settings.workingHours}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Minimum Required Days
                  </label>

                  <input
                    type="number"
                    name="minimumRequiredDays"
                    className="form-control"
                    min="1"
                    value={settings.minimumRequiredDays}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-options">
                <label className="setting-option">
                  <div>
                    <strong>
                      Require daily logbook entry
                    </strong>

                    <small>
                      Students must submit an entry every working day.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="requireDailyEntry"
                      checked={settings.requireDailyEntry}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>
                      Require Supervisor approval
                    </strong>

                    <small>
                      Submitted logbooks must be approved by supervisors.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="logbookApproval"
                      checked={settings.logbookApproval}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>
                      Allow editing submitted logbook
                    </strong>

                    <small>
                      Allow students to edit entries after submission.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="allowEditSubmittedLog"
                      checked={settings.allowEditSubmittedLog}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon blue"></div>

                <div>
                  <h5>Report Settings</h5>

                  <p>
                    Configure information displayed on generated reports.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    Institution Name on Report
                  </label>

                  <input
                    type="text"
                    name="reportInstitutionName"
                    className="form-control"
                    value={settings.reportInstitutionName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Date Format
                  </label>

                  <select
                    name="dateFormat"
                    className="form-select"
                    value={settings.dateFormat}
                    onChange={handleChange}
                  >
                    <option value="DD/MM/YYYY">
                      DD/MM/YYYY
                    </option>

                    <option value="MM/DD/YYYY">
                      MM/DD/YYYY
                    </option>

                    <option value="YYYY-MM-DD">
                      YYYY-MM-DD
                    </option>
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label">
                    Report Footer
                  </label>

                  <input
                    type="text"
                    name="reportFooter"
                    className="form-control"
                    value={settings.reportFooter}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-options">
                <label className="setting-option">
                  <div>
                    <strong>
                      Show institution logo on reports
                    </strong>

                    <small>
                      Display the E-GAZ logo on generated reports.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="showLogoOnReport"
                      checked={settings.showLogoOnReport}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>

                <label className="setting-option">
                  <div>
                    <strong>
                      Show signature fields
                    </strong>

                    <small>
                      Display signature areas on generated reports.
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="showSignature"
                      checked={settings.showSignature}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </label>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="dashboard-card settings-card">
              <div className="settings-section-title">
                <div className="settings-icon purple">
                  ℹ
                </div>

                <div>
                  <h5>System Information</h5>

                  <p>
                    Technical information about the SFPMS system.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="system-info-card">
                    <small>
                      System Version
                    </small>

                    <h4>
                      1.0.0
                    </h4>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="system-info-card">
                    <small>
                      Frontend
                    </small>

                    <h4>
                      React
                    </h4>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="system-info-card">
                    <small>
                      Backend
                    </small>

                    <h4>
                      Flask
                    </h4>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="system-info-card">
                    <small>
                      Database
                    </small>

                    <h4>
                      Database
                    </h4>
                  </div>
                </div>
              </div>

              <div className="settings-divider"></div>

              <h6 className="system-status-title">
                System Status
              </h6>

              <div className="system-status-list">
                <div className="system-status-item">
                  <span className="status-dot connected"></span>

                  <div>
                    <strong>Frontend</strong>
                    <small>Connected</small>
                  </div>
                </div>

                <div className="system-status-item">
                  <span className="status-dot running"></span>

                  <div>
                    <strong>Backend</strong>
                    <small>Running</small>
                  </div>
                </div>

                <div className="system-status-item">
                  <span className="status-dot available"></span>

                  <div>
                    <strong>Database</strong>
                    <small>Available</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="settings-bottom-actions">
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Poppins, Arial, sans-serif;
          background: #f4f7fb;
          color: #0f172a;
        }

        .settings-dashboard {
          min-height: 100vh;
          background: #f4f7fb;
        }

        .settings-dashboard .sidebar {
          width: 250px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: #2563eb;
          border-right: 1px solid #e2e8f0;
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .settings-dashboard .sidebar-header {
          text-align: center;
          padding: 4px 8px 22px;
          border-bottom: 1px solid #eef2f7;
        }

        .settings-dashboard .sidebar-header .dashboard-logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
          border-radius: 12px;
          margin-bottom: 10px;
        }

        .settings-dashboard .sidebar-header h5 {
          margin: 0;
          color: #0f172a;
          font-weight: 800;
        }

        .settings-dashboard .sidebar-header small {
          display: block;
          color: #cdd5df;
          margin-top: 4px;
          font-size: 12px;
        }

        .settings-dashboard .sidebar-menu {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .settings-dashboard .sidebar-link {
          text-decoration: none;
          color: #ffffff;
          padding: 12px 14px;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .settings-dashboard .sidebar-link:hover {
          background: #eff6ff;
          color: #2563eb;
          transform: translateX(2px);
        }

        .settings-dashboard .sidebar-link.active {
          background: #636fce;
          color: #ffffff;
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.20);
        }

        .settings-dashboard .logout-link {
          color: #dc2626;
        }

        .settings-dashboard .logout-link:hover {
          background: #fef2f2;
          color: #b91c1c;
        }

        .settings-dashboard .sidebar-footer {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #eef2f7;
        }

        .settings-dashboard .dashboard-content {
          margin-left: 250px;
          min-height: 100vh;
          background: #f4f7fb;
          padding: 18px;
        }

        .settings-dashboard .dashboard-navbar {
          min-height: 74px;
          padding: 15px 20px;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
          color: #ffffff;
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.18);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .settings-dashboard .dashboard-navbar small {
          color: rgba(255,255,255,0.80);
        }

        .settings-dashboard .admin-welcome {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .settings-dashboard .admin-welcome .dashboard-logo {
          width: 42px;
          height: 42px;
          object-fit: contain;
          background: #ffffff;
          padding: 4px;
          border-radius: 11px;
        }

        .settings-page {
          margin-top: 18px;
          padding: 24px !important;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .settings-header h2 {
          margin: 0 0 6px;
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
        }

        .settings-header p {
          margin: 0;
          color: #64748b;
        }

        .settings-header-actions {
          display: flex;
          gap: 10px;
        }

        .settings-dashboard .dashboard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
        }

        .settings-tabs-card {
          padding: 12px;
          margin-bottom: 20px;
        }

        .settings-card {
          padding: 26px;
        }

        .settings-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .settings-tab {
          border: 1px solid #dbe3ee;
          background: #ffffff;
          color: #475569;
          border-radius: 10px;
          padding: 10px 15px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .settings-tab:hover {
          border-color: #2563eb;
          color: #2563eb;
          background: #eff6ff;
        }

        .settings-tab.active {
          color: #ffffff;
          background: #2563eb;
          border-color: #2563eb;
          box-shadow: 0 5px 14px rgba(37, 99, 235, 0.20);
        }

        .settings-section-title {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 26px;
        }

        .settings-section-title h5 {
          margin: 0 0 5px;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        .settings-section-title p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .settings-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .settings-icon.blue {
          background: #eff6ff;
        }

        .settings-icon.green {
          background: #f0fdf4;
        }

        .settings-icon.purple {
          background: #f5f3ff;
        }

        .settings-icon.orange {
          background: #fff7ed;
        }

        .settings-icon.red {
          background: #fef2f2;
        }

        .settings-icon.teal {
          background: #ecfeff;
        }

        .settings-dashboard .form-label {
          color: #334155;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .settings-dashboard .form-control,
        .settings-dashboard .form-select {
          min-height: 45px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          color: #334155;
          background: #ffffff;
          box-shadow: none;
          transition: all 0.2s ease;
        }

        .settings-dashboard .form-control:focus,
        .settings-dashboard .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .settings-dashboard .btn {
          border-radius: 10px;
          font-weight: 700;
          padding: 10px 17px;
          transition: all 0.2s ease;
        }

        .settings-dashboard .btn-primary {
          background: #2563eb;
          border-color: #2563eb;
        }

        .settings-dashboard .btn-primary:hover {
          background: #1d4ed8;
          border-color: #1d4ed8;
          transform: translateY(-1px);
        }

        .settings-dashboard .btn-outline-secondary {
          border-color: #cbd5e1;
          color: #475569;
          background: #ffffff;
        }

        .settings-dashboard .btn-outline-secondary:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .settings-dashboard .btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .settings-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 26px 0;
        }

        .settings-options {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .setting-option,
        .notification-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 17px 0;
          border-bottom: 1px solid #eef2f7;
        }

        .setting-option:last-child {
          border-bottom: none;
        }

        .setting-option strong,
        .notification-main strong {
          display: block;
          color: #1e293b;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .setting-option small,
        .notification-main small {
          display: block;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .setting-option.single {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px;
          margin-top: 4px;
          background: #f8fafc;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 26px;
          flex-shrink: 0;
          margin: 0;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #cbd5e1;
          border-radius: 30px;
          transition: 0.25s;
        }

        .slider:before {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          left: 3px;
          top: 3px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.18);
          transition: 0.25s;
        }

        .switch input:checked + .slider {
          background: #2563eb;
        }

        .switch input:checked + .slider:before {
          transform: translateX(22px);
        }

        .status-label {
          display: inline-block;
          margin-top: 10px;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-open {
          background: #dcfce7;
          color: #166534;
        }

        .status-closed {
          background: #fee2e2;
          color: #991b1b;
        }

        .system-info-card {
          height: 100%;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          transition: all 0.2s ease;
        }

        .system-info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
        }

        .system-info-card small {
          display: block;
          color: #64748b;
          font-weight: 600;
          font-size: 12px;
        }

        .system-info-card h4 {
          margin: 8px 0 0;
          color: #1d4ed8;
          font-weight: 800;
        }

        .system-status-title {
          color: #0f172a;
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 15px;
        }

        .system-status-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .system-status-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
        }

        .system-status-item strong {
          display: block;
          font-size: 13px;
          color: #1e293b;
        }

        .system-status-item small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 2px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-dot.connected,
        .status-dot.running,
        .status-dot.available {
          background: #16a34a;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        .settings-bottom-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 22px;
          padding-bottom: 10px;
        }

        @media (max-width: 1100px) {
          .settings-dashboard .sidebar {
            width: 220px;
          }

          .settings-dashboard .dashboard-content {
            margin-left: 220px;
          }

          .system-status-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .settings-dashboard .sidebar {
            position: static;
            width: 100%;
            height: auto;
            min-height: auto;
          }

          .settings-dashboard .sidebar-menu {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .settings-dashboard .sidebar-footer {
            margin-top: 16px;
          }

          .settings-dashboard .dashboard-content {
            margin-left: 0;
            padding: 12px;
          }

          .settings-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-header-actions {
            width: 100%;
          }

          .settings-header-actions .btn {
            flex: 1;
          }
        }

        @media (max-width: 700px) {
          .settings-page {
            padding: 16px !important;
          }

          .settings-dashboard .dashboard-navbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-welcome {
            width: 100%;
          }

          .settings-tabs {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .settings-tab {
            width: 100%;
          }

          .settings-card {
            padding: 20px;
          }
        }

        @media (max-width: 500px) {
          .settings-dashboard .sidebar-menu {
            grid-template-columns: 1fr;
          }

          .settings-header h2 {
            font-size: 24px;
          }

          .settings-header-actions {
            flex-direction: column;
          }

          .settings-header-actions .btn {
            width: 100%;
          }

          .settings-tabs {
            grid-template-columns: 1fr;
          }

          .setting-option,
          .notification-main {
            align-items: flex-start;
          }

          .settings-section-title {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default SystemSettings;


