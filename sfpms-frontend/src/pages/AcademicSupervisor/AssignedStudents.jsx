import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AssignedStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const savedUser = localStorage.getItem("sfpms_user");

      if (!savedUser) {
        throw new Error("Academic Supervisor is not logged in.");
      }

      const user = JSON.parse(savedUser);

      if (!user.id) {
        throw new Error("Supervisor ID not found.");
      }

      const response = await api.get(
        `/supervisor-assignment/supervisor/${user.id}`
      );

      const assignments = Array.isArray(response)
        ? response
        : response?.data || [];

      const mappedStudents = assignments
        .filter(
          (item) =>
            item.student &&
            item.assignment
        )
        .map((item) => ({
          id: item.student.id,
          institutionalId:
            item.student.institutional_id || "",
          name: item.student.name || "",
          email: item.student.email || "",
          programme: item.student.programme || "N/A",
          organization: "Not Available",
          fieldSupervisor: "Not Assigned",
          startDate: "Not Available",
          endDate: "Not Available",
          status: "Active",
          attendance: 0,
          logbooks: "Pending",
          progress: 0,
          assignmentId: item.assignment.id,
          role: item.assignment.role,
        }));

      setStudents(mappedStudents);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load assigned students.";

      setError(message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        student.name
          .toLowerCase()
          .includes(searchText) ||
        student.institutionalId
          .toLowerCase()
          .includes(searchText) ||
        student.email
          .toLowerCase()
          .includes(searchText) ||
        student.programme
          .toLowerCase()
          .includes(searchText) ||
        student.organization
          .toLowerCase()
          .includes(searchText) ||
        student.fieldSupervisor
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "Active"
  ).length;

  const completedStudents = students.filter(
    (student) => student.status === "Completed"
  ).length;

  const attentionStudents = students.filter(
    (student) => student.status === "Needs Attention"
  ).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "badge bg-success";

      case "Completed":
        return "badge bg-primary";

      case "Needs Attention":
        return "badge bg-warning text-dark";

      default:
        return "badge bg-secondary";
    }
  };

  const getLogbookBadge = (status) => {
    switch (status) {
      case "Approved":
        return "badge bg-success";

      case "Pending":
        return "badge bg-warning text-dark";

      default:
        return "badge bg-secondary";
    }
  };

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
            Academic Supervisor
          </small>
        </div>

        <nav className="sidebar-menu">
          <Link
            to="/academic-supervisor/dashboard"
            className="sidebar-link"
          >
            Dashboard
          </Link>

          <Link
            to="/academic-supervisor/students"
            className="sidebar-link active"
          >
            Assigned Students
          </Link>

          <Link
            to="/academic-supervisor/logs"
            className="sidebar-link"
          >
            Logs
          </Link>

          <Link
            to="/academic-supervisor/remarks"
            className="sidebar-link"
          >
            Academic Remarks
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

      <div className="dashboard-content">
        <div className="dashboard-navbar">
          <div>
            <h5 className="mb-0 fw-bold">
              Assigned Students
            </h5>

            <small className="text-muted">
              Students assigned to you for academic supervision
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo"
            />

            <span className="fw-semibold">
              Academic Supervisor
            </span>
          </div>
        </div>

        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">
              Assigned Students Overview
            </h2>

            <button
              className="btn btn-outline-primary"
              onClick={loadStudents}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="stat-card h-100">
                <small className="text-muted">
                  Total Students
                </small>

                <div className="stat-number mt-2">
                  {totalStudents}
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card h-100">
                <small className="text-muted">
                  Active Students
                </small>

                <div className="stat-number text-success mt-2">
                  {activeStudents}
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card h-100">
                <small className="text-muted">
                  Completed
                </small>

                <div className="stat-number text-primary mt-2">
                  {completedStudents}
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card h-100">
                <small className="text-muted">
                  Needs Attention
                </small>

                <div className="stat-number text-warning mt-2">
                  {attentionStudents}
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-lg-8">
                <label className="form-label fw-semibold">
                  Search Students
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student, ID, programme, organization or supervisor..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-semibold">
                  Filter by Status
                </label>

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Students
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Needs Attention">
                    Needs Attention
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">
                  My Assigned Students
                </h5>

                <small className="text-muted">
                  Students assigned by Administration.
                </small>
              </div>

              <span className="badge bg-primary">
                {filteredStudents.length} Students
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student</th>
                    <th>Programme</th>
                    <th>Organization</th>
                    <th>Placement</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-5"
                      >
                        Loading assigned students...
                      </td>
                    </tr>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map(
                      (student) => (
                        <tr key={student.assignmentId}>
                          <td>
                            <strong>
                              {student.institutionalId}
                            </strong>
                          </td>

                          <td>
                            <strong>
                              {student.name}
                            </strong>

                            <br />

                            <small className="text-muted">
                              {student.email}
                            </small>
                          </td>

                          <td>
                            {student.programme}
                          </td>

                          <td>
                            {student.organization}
                          </td>

                          <td>
                            <small>
                              {student.startDate}
                            </small>

                            <br />

                            <span className="text-muted">
                              ↓
                            </span>

                            <br />

                            <small>
                              {student.endDate}
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusBadge(
                                student.status
                              )}
                            >
                              {student.status}
                            </span>
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-5"
                      >
                        <div className="text-muted">
                          No students assigned to this supervisor.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {selectedStudent.name}
                  </h5>

                  <small className="text-muted">
                    {selectedStudent.institutionalId}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedStudent(null)
                  }
                />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Email
                      </small>

                      <div className="fw-semibold mt-1">
                        {selectedStudent.email}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Programme
                      </small>

                      <div className="fw-semibold mt-1">
                        {selectedStudent.programme}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Organization
                      </small>

                      <div className="fw-semibold mt-1">
                        {selectedStudent.organization}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Status
                      </small>

                      <div className="mt-1">
                        <span
                          className={getStatusBadge(
                            selectedStudent.status
                          )}
                        >
                          {selectedStudent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Placement Start
                      </small>

                      <div className="fw-semibold mt-1">
                        {selectedStudent.startDate}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Placement End
                      </small>

                      <div className="fw-semibold mt-1">
                        {selectedStudent.endDate}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Attendance
                      </small>

                      <div className="fw-semibold text-success mt-1">
                        {selectedStudent.attendance}%
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted">
                        Logbooks
                      </small>

                      <div className="mt-1">
                        <span
                          className={getLogbookBadge(
                            selectedStudent.logbooks
                          )}
                        >
                          {selectedStudent.logbooks}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">
                          Overall Placement Progress
                        </small>

                        <strong>
                          {selectedStudent.progress}%
                        </strong>
                      </div>

                      <div
                        className="progress mt-2"
                        style={{
                          height: "10px",
                        }}
                      >
                        <div
                          className={
                            selectedStudent.progress >= 80
                              ? "progress-bar bg-success"
                              : selectedStudent.progress >= 60
                              ? "progress-bar bg-primary"
                              : "progress-bar bg-warning"
                          }
                          style={{
                            width: `${selectedStudent.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setSelectedStudent(null)
                  }
                >
                  Close
                </button>

                <Link
                  to="/academic-supervisor/logs"
                  className="btn btn-outline-primary"
                >
                  View Logs
                </Link>

                <Link
                  to="/academic-supervisor/remarks"
                  className="btn btn-primary"
                >
                  Academic Remarks
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignedStudents;


