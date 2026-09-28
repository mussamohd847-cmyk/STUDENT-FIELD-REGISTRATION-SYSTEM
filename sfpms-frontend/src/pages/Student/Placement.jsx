import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

const EGAZ_INFO = {
  name: "e-Government Agency Zanzibar (eGAZ)",
  poBox: "P.O. Box 800 Zanzibar, Tanzania",
  phone: "+255 (0) 24 22 35688 / +255 (0) 24 22 35689",
  email: "info@egaz.go.tz",
  website: "www.egaz.go.tz",
  address: "Zanzibar, Tanzania",
};

function Placement() {
  const [placement, setPlacement] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [supervisor, setSupervisor] = useState(null);
  const [academicSupervisor, setAcademicSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(
    localStorage.getItem("sfpms_user") || "null"
  );

  const studentId = storedUser?.id;

  useEffect(() => {
    const loadPlacement = async () => {
      if (!studentId) {
        setError("Student account not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const placements = await api.get(
          `/placements/?student_id=${studentId}`
        );

        if (!Array.isArray(placements) || placements.length === 0) {
          setPlacement(null);
          setOrganization(null);
          setSupervisor(null);
          setAcademicSupervisor(null);
          setLoading(false);
          return;
        }

        const activePlacement =
          placements.find(
            (item) =>
              String(item.status).toUpperCase() === "ACTIVE"
          ) || placements[0];

        setPlacement(activePlacement);

        if (activePlacement.organization_id) {
          try {
            const organizationData = await api.get(
              `/organizations/${activePlacement.organization_id}`
            );

            setOrganization(organizationData);
          } catch {
            setOrganization(null);
          }
        }

        try {
          const assignments = await api.get(
            `/supervisor-assignment/student/${studentId}`
          );

          if (Array.isArray(assignments)) {
            const fieldSupervisorAssignment =
              assignments.find(
                (item) =>
                  item.role === "FIELD_SUPERVISOR" ||
                  item.supervisor?.role === "FIELD_SUPERVISOR"
              );

            const academicSupervisorAssignment =
              assignments.find(
                (item) =>
                  item.role === "ACADEMIC_SUPERVISOR" ||
                  item.supervisor?.role === "ACADEMIC_SUPERVISOR"
              );

            setSupervisor(
              fieldSupervisorAssignment?.supervisor || null
            );

            setAcademicSupervisor(
              academicSupervisorAssignment?.supervisor || null
            );
          }
        } catch {
          setSupervisor(null);
          setAcademicSupervisor(null);
        }
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load placement information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlacement();
  }, [studentId]);

  const formatDate = (date) => {
    if (!date) {
      return "Not assigned";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not assigned";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const duration = useMemo(() => {
    if (!placement?.start_date || !placement?.end_date) {
      return "Not available";
    }

    const start = new Date(placement.start_date);
    const end = new Date(placement.end_date);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return "Not available";
    }

    const totalDays =
      Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const months = Math.floor(totalDays / 30);
    const remainingDays = totalDays % 30;

    if (months > 0 && remainingDays > 0) {
      return `${months} month${
        months > 1 ? "s" : ""
      } ${remainingDays} day${
        remainingDays > 1 ? "s" : ""
      }`;
    }

    if (months > 0) {
      return `${months} month${months > 1 ? "s" : ""}`;
    }

    return `${totalDays} day${totalDays > 1 ? "s" : ""}`;
  }, [placement]);

  const status = placement?.status || "NOT ASSIGNED";

  const statusClass =
    status === "ACTIVE"
      ? "bg-success"
      : status === "COMPLETED"
      ? "bg-primary"
      : status === "INACTIVE"
      ? "bg-secondary"
      : "bg-warning text-dark";

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />

        <div className="dashboard-content">
          <div className="dashboard-navbar">
            <div>
              <h5 className="mb-0 fw-bold">
                My Placement
              </h5>

              <small className="text-muted">
                Student Field Placement Information
              </small>
            </div>

            <div className="d-flex align-items-center gap-2">
              <img
                src="/image/egaz-logo.jpg"
                alt="E-GAZ"
                className="dashboard-logo"
              />

              <span className="fw-semibold">
                Welcome, {storedUser?.name || "Student"}
              </span>
            </div>
          </div>

          <div className="container-fluid p-4">
            <div className="card dashboard-card">
              <div className="card-body text-center py-5">
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                ></div>

                <p className="text-muted mb-0">
                  Loading placement information...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-navbar">
          <div>
            <h5 className="mb-0 fw-bold">
              My Placement
            </h5>

            <small className="text-muted">
              Student Field Placement Information
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo"
            />

            <span className="fw-semibold">
              Welcome, {storedUser?.name || "Student"}
            </span>
          </div>
        </div>

        <div className="container-fluid p-4">
          <div className="mb-4">
            <h2 className="fw-bold">
              Field Placement
            </h2>

            <p className="text-muted">
              View your field placement details,
              organization and supervisor information.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          {!placement ? (
            <div className="card dashboard-card">
              <div className="card-body text-center py-5">
                <h4 className="fw-bold mb-2">
                  Placement Not Available
                </h4>

                <p className="text-muted mb-0">
                  Your placement information has not been
                  assigned yet.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="card placement-status-card mb-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <small className="text-muted">
                        Placement Status
                      </small>

                      <h3 className="fw-bold mt-2">
                        {status}
                      </h3>

                      <p className="text-muted mb-0">
                        Your current field placement status.
                      </p>
                    </div>

                    <div className="col-md-4 text-md-end">
                      <span
                        className={`badge ${statusClass} placement-badge`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card dashboard-card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-4">
                    Organization Information
                  </h4>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Organization Name
                        </small>

                        <h5 className="fw-bold mt-2">
                          {organization?.name ||
                            EGAZ_INFO.name}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Department
                        </small>

                        <h5 className="fw-bold mt-2">
                          {placement.department ||
                            "Not assigned"}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          S.L.P / P.O. Box
                        </small>

                        <h5 className="fw-bold mt-2">
                          {EGAZ_INFO.poBox}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Simu (Tel)
                        </small>

                        <h5 className="fw-bold mt-2">
                          {EGAZ_INFO.phone}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Barua Pepe (Email)
                        </small>

                        <h5 className="fw-bold mt-2">
                          {EGAZ_INFO.email}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Tovuti (Website)
                        </small>

                        <h5 className="fw-bold mt-2">
                          {EGAZ_INFO.website}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Organization Address
                        </small>

                        <h5 className="fw-bold mt-2">
                          {organization?.address ||
                            EGAZ_INFO.address}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card dashboard-card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-4">
                    Placement Period
                  </h4>

                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Start Date
                        </small>

                        <h5 className="fw-bold mt-2">
                          {formatDate(
                            placement.start_date
                          )}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          End Date
                        </small>

                        <h5 className="fw-bold mt-2">
                          {formatDate(
                            placement.end_date
                          )}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Duration
                        </small>

                        <h5 className="fw-bold mt-2">
                          {duration}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card dashboard-card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-4">
                    Supervisor Information
                  </h4>

                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="placement-info-box h-100">
                        <h5 className="fw-bold mb-4">
                          Field Supervisor
                        </h5>

                        <div className="mb-3">
                          <small className="text-muted">
                            Name
                          </small>

                          <h5 className="fw-bold mt-2">
                            {supervisor?.name ||
                              "Not assigned"}
                          </h5>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            Role
                          </small>

                          <h5 className="fw-bold mt-2">
                            {supervisor
                              ? "Field Supervisor"
                              : "Not assigned"}
                          </h5>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            Phone
                          </small>

                          <h5 className="fw-bold mt-2">
                            {supervisor?.phone ||
                              "Not available"}
                          </h5>
                        </div>

                        <div>
                          <small className="text-muted">
                            Email
                          </small>

                          <h5 className="fw-bold mt-2">
                            {supervisor?.email ||
                              "Not available"}
                          </h5>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="placement-info-box h-100">
                        <h5 className="fw-bold mb-4">
                          Academic Supervisor
                        </h5>

                        <div className="mb-3">
                          <small className="text-muted">
                            Name
                          </small>

                          <h5 className="fw-bold mt-2">
                            {academicSupervisor?.name ||
                              "Not assigned"}
                          </h5>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            Role
                          </small>

                          <h5 className="fw-bold mt-2">
                            {academicSupervisor
                              ? "Academic Supervisor"
                              : "Not assigned"}
                          </h5>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            Phone
                          </small>

                          <h5 className="fw-bold mt-2">
                            {academicSupervisor?.phone ||
                              "Not available"}
                          </h5>
                        </div>

                        <div>
                          <small className="text-muted">
                            Email
                          </small>

                          <h5 className="fw-bold mt-2">
                            {academicSupervisor?.email ||
                              "Not available"}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card dashboard-card mb-4">
                <div className="card-body">
                  <h4 className="fw-bold mb-4">
                    Placement Information
                  </h4>

                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Placement ID
                        </small>

                        <h5 className="fw-bold mt-2">
                          #{placement.id}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Application ID
                        </small>

                        <h5 className="fw-bold mt-2">
                          {placement.application_id
                            ? `#${placement.application_id}`
                            : "Not available"}
                        </h5>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="placement-info-box">
                        <small className="text-muted">
                          Student
                        </small>

                        <h5 className="fw-bold mt-2">
                          {storedUser?.name ||
                            "Student"}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card dashboard-card">
                <div className="card-body">
                  <h4 className="fw-bold mb-3">
                    Quick Actions
                  </h4>

                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      to="/student/daily-logbook"
                      className="btn btn-primary"
                    >
                      Open Daily Logbook
                    </Link>

                    <Link
                      to="/student/dashboard"
                      state={{ openProfile: true }}
                      className="btn btn-outline-primary"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Placement;