import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const USERS_API = "http://localhost:5000/api/users";
const ASSIGNMENT_API =
  "http://localhost:5000/api/supervisor-assignment";

function Supervisors() {
  const emptyForm = {
    staffId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    organization: "",
    username: "",
    password: "",
    status: "Active",
    role: "FIELD_SUPERVISOR",
  };

  const [supervisors, setSupervisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  const [showAssign, setShowAssign] = useState(false);
  const [assignSupervisorId, setAssignSupervisorId] = useState("");

  // MULTIPLE STUDENTS
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState(false);

  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        fieldSupervisorResponse,
        academicSupervisorResponse,
        studentResponse,
        assignmentResponse,
      ] = await Promise.all([
        fetch(`${USERS_API}/?role=FIELD_SUPERVISOR`),
        fetch(`${USERS_API}/?role=ACADEMIC_SUPERVISOR`),
        fetch(`${USERS_API}/?role=STUDENT`),
        fetch(`${ASSIGNMENT_API}/`),
      ]);

      if (
        !fieldSupervisorResponse.ok ||
        !academicSupervisorResponse.ok ||
        !studentResponse.ok ||
        !assignmentResponse.ok
      ) {
        throw new Error("Failed to load supervisor data.");
      }

      const fieldSupervisors =
        await fieldSupervisorResponse.json();

      const academicSupervisors =
        await academicSupervisorResponse.json();

      const studentData =
        await studentResponse.json();

      const assignmentData =
        await assignmentResponse.json();

      const allSupervisors = [
        ...fieldSupervisors,
        ...academicSupervisors,
      ];

      setSupervisors(allSupervisors);
      setStudents(studentData);
      setAssignments(assignmentData);
    } catch (error) {
      alert(error.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const getStudentCount = (supervisorId) => {
    return assignments.filter(
      (assignment) =>
        Number(assignment.supervisor_id) === Number(supervisorId)
    ).length;
  };

  const getSupervisorStudents = (supervisorId) => {
    return assignments
      .filter(
        (assignment) =>
          Number(assignment.supervisor_id) === Number(supervisorId)
      )
      .map((assignment) => {
        const student = students.find(
          (item) =>
            Number(item.id) === Number(assignment.student_id)
        );

        return {
          ...student,
          assignmentId: assignment.id,
          role: assignment.role,
          assignedAt: assignment.assigned_at,
        };
      })
      .filter(Boolean);
  };

  const getDisplayStatus = (status) => {
    return status === "ACTIVE" ? "Active" : "Inactive";
  };

  const getDisplayRole = (role) => {
    if (role === "FIELD_SUPERVISOR") {
      return "Field Supervisor";
    }

    if (role === "ACADEMIC_SUPERVISOR") {
      return "Academic Supervisor";
    }

    return role;
  };

  const getDepartment = (supervisor) => {
    return supervisor.programme || "—";
  };

  const getOrganization = () => {
    return "—";
  };

  const supervisorRows = useMemo(() => {
    return supervisors.map((supervisor) => ({
      ...supervisor,
      staffId: supervisor.institutional_id,
      department: getDepartment(supervisor),
      organization: getOrganization(supervisor),
      username: supervisor.institutional_id,
      status: getDisplayStatus(supervisor.status),
      students: getStudentCount(supervisor.id),
    }));
  }, [supervisors, assignments]);

  const departments = useMemo(() => {
    return [
      ...new Set(
        supervisorRows
          .map((supervisor) => supervisor.department)
          .filter((department) => department !== "—")
      ),
    ];
  }, [supervisorRows]);

  const filteredSupervisors = useMemo(() => {
    return supervisorRows.filter((supervisor) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        supervisor.name
          ?.toLowerCase()
          .includes(searchValue) ||
        supervisor.staffId
          ?.toLowerCase()
          .includes(searchValue) ||
        supervisor.email
          ?.toLowerCase()
          .includes(searchValue);

      const matchesOrganization =
        !organizationFilter ||
        supervisor.organization === organizationFilter;

      const matchesDepartment =
        !departmentFilter ||
        supervisor.department === departmentFilter;

      const matchesStatus =
        !statusFilter ||
        supervisor.status === statusFilter;

      return (
        matchesSearch &&
        matchesOrganization &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    supervisorRows,
    search,
    organizationFilter,
    departmentFilter,
    statusFilter,
  ]);

  const totalSupervisors = supervisors.length;

  const activeSupervisors = supervisors.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const inactiveSupervisors = supervisors.filter(
    (item) => item.status === "INACTIVE"
  ).length;

  const totalAssignedStudents = assignments.length;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.staffId ||
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.department
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          programme: form.department,
          role: form.role,
          status: form.status.toUpperCase(),
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        const response = await fetch(
          `${USERS_API}/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to update supervisor."
          );
        }

        alert("Supervisor updated successfully.");
      } else {
        if (!form.password) {
          alert("Password is required.");
          return;
        }

        const payload = {
          institutional_id: form.staffId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          programme: form.department,
          password: form.password,
          role: form.role,
          status: form.status.toUpperCase(),
        };

        const response = await fetch(`${USERS_API}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to create supervisor."
          );
        }

        alert("Supervisor added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await loadData();
    } catch (error) {
      alert(error.message || "Operation failed.");
    }
  };

  const editSupervisor = (supervisor) => {
    setForm({
      staffId: supervisor.staffId,
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone,
      department:
        supervisor.department === "—"
          ? ""
          : supervisor.department,
      organization: "",
      username: supervisor.username,
      password: "",
      status: supervisor.status,
      role: supervisor.role,
    });

    setEditingId(supervisor.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteSupervisor = async (id) => {
    const supervisor = supervisorRows.find(
      (item) => item.id === id
    );

    if (!supervisor) return;

    const studentCount = getStudentCount(id);

    if (studentCount > 0) {
      alert(
        "This supervisor has assigned students. Reassign the students before deleting the supervisor."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${supervisor.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${USERS_API}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete supervisor."
        );
      }

      alert("Supervisor deleted successfully.");

      if (
        selectedSupervisor &&
        selectedSupervisor.id === id
      ) {
        setSelectedSupervisor(null);
      }

      await loadData();
    } catch (error) {
      alert(error.message || "Failed to delete supervisor.");
    }
  };

  const viewSupervisor = (supervisor) => {
    setSelectedSupervisor(supervisor);
  };

  /*
   * OPEN ASSIGNMENT
   * Supervisor anaweza kuchaguliwa mapema kutoka
   * kwenye button ya row.
   */
  const openAssign = (supervisorId = "") => {
    setAssignSupervisorId(supervisorId);
    setSelectedStudentIds([]);
    setSelectAllStudents(false);
    setShowAssign(true);
  };

  /*
   * SELECT / UNSELECT STUDENT
   */
  const toggleStudentSelection = (studentId) => {
    const id = Number(studentId);

    setSelectedStudentIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (student) => student !== id
        );
      }

      return [...current, id];
    });
  };

  /*
   * SELECT ALL STUDENTS
   */
  const toggleSelectAllStudents = () => {
    if (selectAllStudents) {
      setSelectedStudentIds([]);
      setSelectAllStudents(false);
      return;
    }

    const allIds = students.map(
      (student) => Number(student.id)
    );

    setSelectedStudentIds(allIds);
    setSelectAllStudents(true);
  };

  /*
   * Keep Select All state correct when individual
   * checkboxes are changed.
   */
  useEffect(() => {
    if (
      students.length > 0 &&
      selectedStudentIds.length === students.length
    ) {
      setSelectAllStudents(true);
    } else {
      setSelectAllStudents(false);
    }
  }, [selectedStudentIds, students]);

  /*
   * MULTIPLE STUDENT ASSIGNMENT
   *
   * Backend yako bado inapokea student mmoja kwa POST.
   * Hapa tunatumia endpoint hiyo hiyo mara nyingi,
   * bila kuharibu backend ya sasa.
   */
  const assignStudent = async (e) => {
    e.preventDefault();

    if (!assignSupervisorId) {
      alert("Please select supervisor.");
      return;
    }

    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const supervisor = supervisors.find(
      (item) =>
        Number(item.id) === Number(assignSupervisorId)
    );

    if (!supervisor) {
      alert("Invalid supervisor.");
      return;
    }

    const selectedStudents = students.filter((student) =>
      selectedStudentIds.includes(Number(student.id))
    );

    if (selectedStudents.length === 0) {
      alert("No valid students selected.");
      return;
    }

    const alreadyAssignedStudents =
      selectedStudents.filter((student) =>
        assignments.some(
          (assignment) =>
            Number(assignment.student_id) ===
              Number(student.id) &&
            Number(assignment.supervisor_id) ===
              Number(assignSupervisorId)
        )
      );

    const studentsToAssign = selectedStudents.filter(
      (student) =>
        !alreadyAssignedStudents.some(
          (already) =>
            Number(already.id) === Number(student.id)
        )
    );

    if (studentsToAssign.length === 0) {
      alert(
        "All selected students are already assigned to this supervisor."
      );
      return;
    }

    try {
      setAssigningStudents(true);

      let successCount = 0;
      let failedCount = 0;

      for (const student of studentsToAssign) {
        try {
          const response = await fetch(
            `${ASSIGNMENT_API}/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                student_id: Number(student.id),
                supervisor_id: Number(assignSupervisorId),
                role: supervisor.role,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            failedCount++;
            continue;
          }

          successCount++;
        } catch (error) {
          failedCount++;
        }
      }

      let message =
        `${successCount} student(s) assigned successfully to ${supervisor.name}.`;

      if (alreadyAssignedStudents.length > 0) {
        message +=
          `\n${alreadyAssignedStudents.length} student(s) were already assigned and skipped.`;
      }

      if (failedCount > 0) {
        message +=
          `\n${failedCount} student(s) could not be assigned.`;
      }

      alert(message);

      setSelectedStudentIds([]);
      setSelectAllStudents(false);
      setAssignSupervisorId("");
      setShowAssign(false);

      await loadData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to assign selected students."
      );
    } finally {
      setAssigningStudents(false);
    }
  };

  const removeAssignment = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this student assignment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${ASSIGNMENT_API}/${assignmentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to remove assignment."
        );
      }

      alert("Student assignment removed successfully.");

      await loadData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to remove student assignment."
      );
    }
  };

  return (
    <div className="dashboard supervisors-layout">

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
            className="sidebar-link"
          >
            Organizations
          </Link>

          <Link
            to="/admin/supervisors"
            className="sidebar-link active"
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

      <div className="dashboard-content">

        <div className="dashboard-navbar">

          <div>
            <h5 className="mb-1 fw-bold">
              Supervisor Management
            </h5>

            <small className="text-muted">
              Manage field supervisors and assigned students
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">

            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo navbar-logo"
            />

            <span className="fw-semibold">
              Welcome, Administrator
            </span>

          </div>

        </div>

        <div className="supervisor-page container-fluid">

          <div className="page-header">

            <div>
              <span className="page-kicker">
                ADMINISTRATION
              </span>

              <h1>
                Supervisors
              </h1>

              <p>
                Register, manage, assign and monitor field supervisors.
              </p>
            </div>

            <button
              className="btn btn-primary add-supervisor-btn"
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <span>+</span>
              Add Supervisor
            </button>

          </div>

          <div className="row g-4 mb-4">

            <div className="col-xl-3 col-md-6">
              <div className="stat-card supervisor-stat-card">

                <div className="stat-top">
                  <span className="stat-label">
                    Total Supervisors
                  </span>
                </div>

                <div className="stat-number">
                  {totalSupervisors}
                </div>

                <p className="mb-0">
                  Registered supervisors
                </p>

              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="stat-card supervisor-stat-card">

                <div className="stat-top">
                  <span className="stat-label">
                    Active Supervisors
                  </span>
                </div>

                <div className="stat-number text-success">
                  {activeSupervisors}
                </div>

                <p className="mb-0">
                  Currently active
                </p>

              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="stat-card supervisor-stat-card">

                <div className="stat-top">
                  <span className="stat-label">
                    Inactive Supervisors
                  </span>
                </div>

                <div className="stat-number text-danger">
                  {inactiveSupervisors}
                </div>

                <p className="mb-0">
                  Currently inactive
                </p>

              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="stat-card supervisor-stat-card">

                <div className="stat-top">
                  <span className="stat-label">
                    Assigned Students
                  </span>
                </div>

                <div className="stat-number text-primary">
                  {totalAssignedStudents}
                </div>

                <p className="mb-0">
                  Students under supervision
                </p>

              </div>
            </div>

          </div>

          {showForm && (
            <div className="dashboard-card mb-4 supervisor-form-card">

              <div className="section-heading">

                <div>
                  <span className="section-kicker">
                    SUPERVISOR ACCOUNT
                  </span>

                  <h4>
                    {editingId
                      ? "Edit Supervisor"
                      : "Add Supervisor"}
                  </h4>

                  <p>
                    Enter supervisor information below.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Close
                </button>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="form-subtitle">
                  Personal & Employment Information
                </div>

                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label">
                      Staff / Employee ID *
                    </label>

                    <input
                      type="text"
                      name="staffId"
                      className="form-control"
                      value={form.staffId}
                      onChange={handleChange}
                      placeholder="e.g. SUP004"
                      disabled={Boolean(editingId)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full name"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Email *
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Phone *
                    </label>

                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+255..."
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Department *
                    </label>

                    <input
                      type="text"
                      name="department"
                      className="form-control"
                      value={form.department}
                      onChange={handleChange}
                      placeholder="Department / Programme"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Organization
                    </label>

                    <input
                      type="text"
                      name="organization"
                      className="form-control"
                      value={form.organization}
                      onChange={handleChange}
                      placeholder="Organization"
                      disabled
                    />
                  </div>

                </div>

                <div className="form-subtitle mt-4">
                  Login Information
                </div>

                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label">
                      Username *
                    </label>

                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      value={form.staffId}
                      disabled
                      placeholder="Institutional ID"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={
                        editingId
                          ? "Leave blank to keep current password"
                          : "Password"
                      }
                      required={!editingId}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Supervisor Type
                    </label>

                    <select
                      name="role"
                      className="form-select"
                      value={form.role}
                      onChange={handleChange}
                    >
                      <option value="FIELD_SUPERVISOR">
                        Field Supervisor
                      </option>

                      <option value="ACADEMIC_SUPERVISOR">
                        Academic Supervisor
                      </option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Status
                    </label>

                    <select
                      name="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                </div>

                <div className="form-actions mt-4">

                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                  >
                    {editingId
                      ? "Update Supervisor"
                      : "Save Supervisor"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>
          )}

          <div className="dashboard-card mb-4">

            <div className="section-heading compact">

              <div>
                <span className="section-kicker">
                  FIND RECORDS
                </span>

                <h5>
                  Search & Filter
                </h5>

                <p>
                  Search supervisors by name, ID or email and filter the results.
                </p>
              </div>

            </div>

            <div className="row g-3">

              <div className="col-xl-4 col-lg-6">
                <label className="form-label">
                  Search
                </label>

                <div className="search-input-wrapper">

                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search name, ID or email..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>
              </div>

              <div className="col-xl-2 col-lg-6">
                <label className="form-label">
                  Organization
                </label>

                <select
                  className="form-select"
                  value={organizationFilter}
                  onChange={(e) =>
                    setOrganizationFilter(e.target.value)
                  }
                >
                  <option value="">
                    All
                  </option>
                </select>
              </div>

              <div className="col-xl-2 col-lg-6">
                <label className="form-label">
                  Department
                </label>

                <select
                  className="form-select"
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(e.target.value)
                  }
                >
                  <option value="">
                    All
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-xl-2 col-lg-6">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="">
                    All
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="col-xl-2 col-lg-6 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 clear-filter-btn"
                  onClick={() => {
                    setSearch("");
                    setOrganizationFilter("");
                    setDepartmentFilter("");
                    setStatusFilter("");
                  }}
                >
                  Clear Filters
                </button>
              </div>

            </div>

          </div>

          <div className="dashboard-card mb-4">

            <div className="table-heading">

              <div>
                <span className="section-kicker">
                  SUPERVISOR DIRECTORY
                </span>

                <h5>
                  Supervisor List
                </h5>

                <p>
                  Manage registered field supervisors.
                </p>
              </div>

              <span className="count-badge">
                {filteredSupervisors.length} Supervisors
              </span>

            </div>

            <div className="table-responsive supervisor-table-wrapper">

              <table className="table supervisor-table align-middle">

                <thead>
                  <tr>
                    <th>Supervisor ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Organization</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td
                        colSpan="9"
                        className="text-center empty-state"
                      >
                        Loading supervisors...
                      </td>
                    </tr>

                  ) : filteredSupervisors.length === 0 ? (

                    <tr>
                      <td
                        colSpan="9"
                        className="text-center empty-state"
                      >
                        <div className="empty-icon">
                          ◌
                        </div>

                        <strong>
                          No supervisors found
                        </strong>

                        <p>
                          Try changing your search or filter criteria.
                        </p>
                      </td>
                    </tr>

                  ) : (

                    filteredSupervisors.map((supervisor) => (

                      <tr key={supervisor.id}>

                        <td>
                          <span className="staff-id">
                            {supervisor.staffId}
                          </span>
                        </td>

                        <td>
                          <div className="person-cell">

                            <div className="person-avatar">
                              {supervisor.name?.charAt(0)}
                            </div>

                            <div>
                              <strong>
                                {supervisor.name}
                              </strong>

                              <small>
                                {getDisplayRole(
                                  supervisor.role
                                )}
                              </small>
                            </div>

                          </div>
                        </td>

                        <td>
                          {supervisor.email}
                        </td>

                        <td>
                          {supervisor.phone || "—"}
                        </td>

                        <td>
                          {supervisor.department}
                        </td>

                        <td>
                          <span className="organization-text">
                            {supervisor.organization}
                          </span>
                        </td>

                        <td>
                          <span className="student-count-badge">
                            {supervisor.students}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              supervisor.status === "Active"
                                ? "status-badge active"
                                : "status-badge inactive"
                            }
                          >
                            <span className="status-dot"></span>
                            {supervisor.status}
                          </span>
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              type="button"
                              className="action-btn view"
                              onClick={() =>
                                viewSupervisor(supervisor)
                              }
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="action-btn edit"
                              onClick={() =>
                                editSupervisor(supervisor)
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="action-btn assign"
                              onClick={() =>
                                openAssign(supervisor.id)
                              }
                            >
                              Assign
                            </button>

                            <button
                              type="button"
                              className="action-btn delete"
                              onClick={() =>
                                deleteSupervisor(
                                  supervisor.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {showAssign && (

            <div className="dashboard-card mb-4 assign-card">

              <div className="section-heading">

                <div>
                  <span className="section-kicker">
                    STUDENT ASSIGNMENT
                  </span>

                  <h4>
                    Assign Students
                  </h4>

                  <p>
                    Select multiple students and assign them to one supervisor.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowAssign(false);
                    setAssignSupervisorId("");
                    setSelectedStudentIds([]);
                    setSelectAllStudents(false);
                  }}
                >
                  Close
                </button>

              </div>

              <form onSubmit={assignStudent}>

                <div className="row g-3">

                  <div className="col-md-5">

                    <label className="form-label">
                      Select Supervisor
                    </label>

                    <select
                      className="form-select"
                      value={assignSupervisorId}
                      onChange={(e) =>
                        setAssignSupervisorId(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Supervisor
                      </option>

                      {supervisorRows
                        .filter(
                          (supervisor) =>
                            supervisor.status === "Active"
                        )
                        .map((supervisor) => (

                          <option
                            key={supervisor.id}
                            value={supervisor.id}
                          >
                            {supervisor.name} -{" "}
                            {getDisplayRole(
                              supervisor.role
                            )}
                          </option>

                        ))}

                    </select>

                  </div>

                  <div className="col-md-7">

                    <div className="assignment-summary-box">

                      <div>
                        <small>
                          SELECTED STUDENTS
                        </small>

                        <strong>
                          {selectedStudentIds.length}
                        </strong>
                      </div>

                      <div>
                        <small>
                          TOTAL STUDENTS
                        </small>

                        <strong>
                          {students.length}
                        </strong>
                      </div>

                    </div>

                  </div>

                </div>

                <div className="student-selection-box mt-4">

                  <div className="student-selection-header">

                    <div>
                      <h6>
                        Select Students
                      </h6>

                      <small>
                        You can select one or many students.
                      </small>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={toggleSelectAllStudents}
                    >
                      {selectAllStudents
                        ? "Unselect All"
                        : "Select All"}
                    </button>

                  </div>

                  <div className="student-selection-list">

                    {students.length === 0 ? (

                      <div className="text-center py-4 text-muted">
                        No students available.
                      </div>

                    ) : (

                      students.map((student) => {

                        const isSelected =
                          selectedStudentIds.includes(
                            Number(student.id)
                          );

                        const isAlreadyAssigned =
                          assignSupervisorId &&
                          assignments.some(
                            (assignment) =>
                              Number(
                                assignment.student_id
                              ) === Number(student.id) &&
                              Number(
                                assignment.supervisor_id
                              ) ===
                                Number(assignSupervisorId)
                          );

                        return (
                          <label
                            key={student.id}
                            className={
                              isSelected
                                ? "student-select-row selected"
                                : "student-select-row"
                            }
                          >

                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleStudentSelection(
                                  student.id
                                )
                              }
                            />

                            <div className="student-select-avatar">
                              {student.name?.charAt(0)}
                            </div>

                            <div className="student-select-info">

                              <strong>
                                {student.name}
                              </strong>

                              <small>
                                {student.institutional_id}
                                {student.programme
                                  ? ` • ${student.programme}`
                                  : ""}
                              </small>

                            </div>

                            {isAlreadyAssigned && (
                              <span className="already-assigned-badge">
                                Already Assigned
                              </span>
                            )}

                          </label>
                        );
                      })

                    )}

                  </div>

                </div>

                <div className="assignment-actions mt-4">

                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={
                      assigningStudents ||
                      !assignSupervisorId ||
                      selectedStudentIds.length === 0
                    }
                  >
                    {assigningStudents
                      ? "Assigning..."
                      : `Assign ${selectedStudentIds.length || ""} Selected Student${
                          selectedStudentIds.length === 1
                            ? ""
                            : "s"
                        }`}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => {
                      setSelectedStudentIds([]);
                      setSelectAllStudents(false);
                    }}
                  >
                    Clear Selection
                  </button>

                </div>

              </form>

            </div>

          )}

          {selectedSupervisor && (

            <div className="dashboard-card mb-4 supervisor-details-card">

              <div className="section-heading">

                <div>
                  <span className="section-kicker">
                    SUPERVISOR PROFILE
                  </span>

                  <h4>
                    Supervisor Details
                  </h4>

                  <p>
                    Complete supervisor information and monitoring.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setSelectedSupervisor(null)
                  }
                >
                  Close
                </button>

              </div>

              <div className="detail-section">

                <div className="detail-section-title">
                  Personal Information
                </div>

                <div className="row g-3">

                  <div className="col-md-4">
                    <div className="detail-item">
                      <span>Supervisor ID</span>
                      <strong>
                        {selectedSupervisor.staffId}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="detail-item">
                      <span>Full Name</span>
                      <strong>
                        {selectedSupervisor.name}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="detail-item">
                      <span>Status</span>

                      <strong>
                        <span
                          className={
                            selectedSupervisor.status === "Active"
                              ? "status-badge active"
                              : "status-badge inactive"
                          }
                        >
                          <span className="status-dot"></span>
                          {selectedSupervisor.status}
                        </span>
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="detail-item">
                      <span>Email</span>
                      <strong>
                        {selectedSupervisor.email}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="detail-item">
                      <span>Phone</span>
                      <strong>
                        {selectedSupervisor.phone || "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="detail-item">
                      <span>Username</span>
                      <strong>
                        {selectedSupervisor.username}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="detail-item">
                      <span>Department</span>
                      <strong>
                        {selectedSupervisor.department}
                      </strong>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="detail-item">
                      <span>Supervisor Type</span>
                      <strong>
                        {getDisplayRole(
                          selectedSupervisor.role
                        )}
                      </strong>
                    </div>
                  </div>

                </div>

              </div>

              <div className="detail-section mt-4">

                <div className="table-heading">

                  <div>
                    <div className="detail-section-title mb-1">
                      Assigned Students
                    </div>

                    <p className="text-muted mb-0">
                      Students currently under this supervisor.
                    </p>
                  </div>

                  <span className="count-badge">
                    {
                      getSupervisorStudents(
                        selectedSupervisor.id
                      ).length
                    } Students
                  </span>

                </div>

                <div className="table-responsive">

                  <table className="table table-bordered supervisor-student-table align-middle">

                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Programme</th>
                        <th>Role</th>
                        <th>Assigned At</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>

                      {getSupervisorStudents(
                        selectedSupervisor.id
                      ).length === 0 ? (

                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-4"
                          >
                            No students assigned.
                          </td>
                        </tr>

                      ) : (

                        getSupervisorStudents(
                          selectedSupervisor.id
                        ).map((student) => (

                          <tr key={student.assignmentId}>

                            <td>
                              <strong>
                                {student.institutional_id}
                              </strong>
                            </td>

                            <td>
                              {student.name}
                            </td>

                            <td>
                              {student.programme || "—"}
                            </td>

                            <td>
                              {student.role || "—"}
                            </td>

                            <td>
                              {student.assignedAt || "—"}
                            </td>

                            <td>

                              <button
                                type="button"
                                className="action-btn delete"
                                onClick={() =>
                                  removeAssignment(
                                    student.assignmentId
                                  )
                                }
                              >
                                Remove
                              </button>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              <div className="detail-section mt-4">

                <div className="detail-section-title mb-3">
                  Monitoring Overview
                </div>

                <div className="row g-4">

                  <div className="col-md-4">

                    <div className="monitor-card blue-monitor">

                      <div className="monitor-icon">
                        ◫
                      </div>

                      <div>
                        <small>
                          Assigned Students
                        </small>

                        <h3>
                          {
                            getStudentCount(
                              selectedSupervisor.id
                            )
                          }
                        </h3>
                      </div>

                    </div>

                  </div>

                  <div className="col-md-4">

                    <div className="monitor-card yellow-monitor">

                      <div className="monitor-icon">
                        ◷
                      </div>

                      <div>
                        <small>
                          Logbooks Pending
                        </small>

                        <h3>
                          0
                        </h3>
                      </div>

                    </div>

                  </div>

                  <div className="col-md-4">

                    <div className="monitor-card red-monitor">

                      <div className="monitor-icon">
                        !
                      </div>

                      <div>
                        <small>
                          Assessments Pending
                        </small>

                        <h3>
                          0
                        </h3>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

      <style>{`

        .supervisors-layout {
          font-family:
            Inter,
            Poppins,
            Arial,
            sans-serif;
          background: #f4f7fb;
          min-height: 100vh;
        }

        .supervisors-layout .sidebar {
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

        .supervisors-layout .sidebar-header {
          text-align: center;
          padding: 4px 8px 22px;
          border-bottom: 1px solid #ffffff;
        }

        .supervisors-layout .dashboard-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 11px;
        }

        .supervisors-layout .sidebar-menu {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .supervisors-layout .sidebar-link {
          text-decoration: none;
          color: #ffffff;
          padding: 11px 14px;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 11px;
          transition: all 0.2s ease;
        }

        .supervisors-layout .sidebar-link:hover {
          background: #eff6ff;
          color: #2563eb;
          transform: translateX(2px);
        }

        .supervisors-layout .sidebar-link.active {
          background: #636fce;
          color: #ffffff;
          box-shadow:
            0 7px 18px rgba(37, 99, 235, 0.22);
        }

        .supervisors-layout .sidebar-link.text-danger {
          color: #dc2626 !important;
        }

        .supervisors-layout .sidebar-link.text-danger:hover {
          background: #fef2f2;
          color: #b91c1c !important;
        }

        .supervisors-layout .sidebar-footer {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #eef2f7;
        }

        .supervisors-layout .dashboard-content {
          width: calc(100% - 250px);
          min-height: 100vh;
          margin-left: 250px;
          padding: 22px;
        }

        .supervisors-layout .dashboard-navbar {
          min-height: 74px;
          padding: 15px 20px;
          border-radius: 16px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );
          color: #ffffff;
          box-shadow:
            0 8px 22px rgba(37, 99, 235, 0.18);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .supervisors-layout
        .dashboard-navbar
        .text-muted {
          color: rgba(
            255,
            255,
            255,
            0.82
          ) !important;
        }

        .supervisors-layout
        .dashboard-navbar
        .navbar-logo {
          width: 42px;
          height: 42px;
          padding: 4px;
          background: #ffffff;
          border-radius: 11px;
        }

        .supervisor-page {
          margin-top: 18px;
          padding: 24px;
          border-radius: 16px;
          min-height: calc(100vh - 110px);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-kicker,
        .section-kicker {
          display: block;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .page-header h1 {
          color: #0f172a;
          font-size: 29px;
          font-weight: 800;
          margin: 0 0 6px;
        }

        .page-header p {
          color: #64748b;
          margin: 0;
        }

        .add-supervisor-btn {
          min-height: 45px;
          padding: 10px 18px;
        }

        .add-supervisor-btn span {
          font-size: 19px;
          margin-right: 6px;
        }

        .supervisors-layout .dashboard-card,
        .supervisors-layout .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow:
            0 8px 22px rgba(15, 23, 42, 0.06);
        }

        .supervisors-layout .dashboard-card {
          padding: 24px;
        }

        .supervisor-stat-card {
          padding: 22px !important;
          height: 100%;
          transition: all 0.2s ease;
        }

        .supervisor-stat-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 28px rgba(15, 23, 42, 0.09);
        }

        .stat-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 13px;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
        }

        .stat-number {
          font-size: 30px;
          font-weight: 800;
          color: #1d4ed8;
          line-height: 1.1;
        }

        .stat-card p {
          color: #64748b;
          margin-top: 7px;
          font-size: 13px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e2e8f0;
        }

        .section-heading.compact {
          margin-bottom: 20px;
          padding-bottom: 0;
          border-bottom: 0;
        }

        .section-heading h4,
        .section-heading h5 {
          color: #0f172a;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .section-heading p {
          color: #64748b;
          margin: 0;
          font-size: 14px;
        }

        .form-subtitle {
          color: #1e293b;
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .form-label {
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .form-control,
        .form-select {
          min-height: 44px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          color: #334155;
          background-color: #ffffff;
          box-shadow: none;
          transition: all 0.2s ease;
        }

        .form-control::placeholder {
          color: #94a3b8;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .btn {
          border-radius: 10px;
          font-weight: 700;
          padding: 10px 16px;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #2563eb;
          border-color: #2563eb;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          border-color: #1d4ed8;
          transform: translateY(-1px);
        }

        .btn-success {
          background: #16a34a;
          border-color: #16a34a;
        }

        .btn-success:hover {
          background: #15803d;
          border-color: #15803d;
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-input {
          padding-left: 42px !important;
        }

        .clear-filter-btn {
          min-height: 44px;
        }

        .table-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .table-heading h5 {
          color: #0f172a;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .table-heading p {
          color: #64748b;
          margin: 0;
          font-size: 13px;
        }

        .count-badge {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #dbeafe;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .supervisor-table-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow-x: auto;
        }

        .supervisor-table {
          margin-bottom: 0;
          min-width: 1250px;
        }

        .supervisor-table thead th {
          background: #f8fafc;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          padding: 14px 12px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .supervisor-table tbody td {
          color: #475569;
          padding: 14px 12px;
          border-color: #eef2f7;
          font-size: 13px;
          white-space: nowrap;
        }

        .supervisor-table tbody tr:hover {
          background: #f8fbff;
        }

        .staff-id {
          color: #1d4ed8;
          background: #eff6ff;
          border-radius: 7px;
          padding: 6px 8px;
          font-size: 12px;
          font-weight: 800;
        }

        .person-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .person-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 800;
        }

        .person-cell strong {
          display: block;
          color: #1e293b;
        }

        .person-cell small {
          display: block;
          color: #94a3b8;
          margin-top: 2px;
          font-size: 11px;
        }

        .organization-text {
          color: #334155;
          font-weight: 600;
        }

        .student-count-badge {
          min-width: 31px;
          height: 31px;
          padding: 5px 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 800;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }

        .status-badge.active {
          background: #f0fdf4;
          color: #15803d;
        }

        .status-badge.inactive {
          background: #fef2f2;
          color: #b91c1c;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .action-btn {
          border: 1px solid;
          background: #ffffff;
          border-radius: 8px;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .action-btn.view {
          color: #2563eb;
          border-color: #bfdbfe;
          background: #eff6ff;
        }

        .action-btn.edit {
          color: #475569;
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .action-btn.assign {
          color: #15803d;
          border-color: #bbf7d0;
          background: #f0fdf4;
        }

        .action-btn.delete {
          color: #dc2626;
          border-color: #fecaca;
          background: #fef2f2;
        }

        .empty-state {
          padding: 45px !important;
          color: #64748b;
        }

        .empty-icon {
          font-size: 35px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .empty-state strong {
          display: block;
          color: #334155;
          margin-bottom: 5px;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        /*
         * MULTIPLE STUDENT ASSIGNMENT STYLES
         */

        .assignment-summary-box {
          min-height: 44px;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 35px;
          padding: 8px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
        }

        .assignment-summary-box small {
          display: block;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .assignment-summary-box strong {
          color: #2563eb;
          font-size: 19px;
          font-weight: 800;
        }

        .student-selection-box {
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          overflow: hidden;
          background: #ffffff;
        }

        .student-selection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 15px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .student-selection-header h6 {
          margin: 0 0 3px;
          color: #0f172a;
          font-weight: 800;
        }

        .student-selection-header small {
          color: #64748b;
        }

        .student-selection-list {
          max-height: 420px;
          overflow-y: auto;
          padding: 8px;
        }

        .student-select-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          margin-bottom: 4px;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .student-select-row:hover {
          background: #f8fbff;
          border-color: #dbeafe;
        }

        .student-select-row.selected {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .student-select-row input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #2563eb;
          cursor: pointer;
          flex-shrink: 0;
        }

        .student-select-avatar {
          width: 38px;
          height: 38px;
          min-width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 800;
        }

        .student-select-info {
          flex: 1;
          min-width: 0;
        }

        .student-select-info strong {
          display: block;
          color: #1e293b;
          font-size: 13px;
        }

        .student-select-info small {
          display: block;
          color: #64748b;
          margin-top: 2px;
          font-size: 11px;
        }

        .already-assigned-badge {
          padding: 5px 8px;
          border-radius: 999px;
          background: #fef3c7;
          color: #92400e;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .assignment-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .detail-section {
          padding-top: 4px;
        }

        .detail-section-title {
          color: #0f172a;
          font-size: 15px;
          font-weight: 800;
        }

        .detail-item {
          height: 100%;
          padding: 15px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
        }

        .detail-item span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 6px;
        }

        .detail-item strong {
          color: #1e293b;
          font-size: 14px;
        }

        .supervisor-student-table {
          min-width: 900px;
          margin-bottom: 0;
        }

        .supervisor-student-table th {
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          padding: 12px;
        }

        .supervisor-student-table td {
          padding: 12px;
          font-size: 13px;
          color: #475569;
          border-color: #e2e8f0;
        }

        .monitor-card {
          min-height: 110px;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid;
        }

        .monitor-card small {
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .monitor-card h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
        }

        .monitor-icon {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
        }

        .blue-monitor {
          background: #eff6ff;
          border-color: #dbeafe;
        }

        .blue-monitor .monitor-icon {
          background: #dbeafe;
          color: #2563eb;
        }

        .yellow-monitor {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .yellow-monitor .monitor-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .red-monitor {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .red-monitor .monitor-icon {
          background: #fee2e2;
          color: #dc2626;
        }

        @media (max-width: 1100px) {

          .supervisors-layout .sidebar {
            width: 220px;
          }

          .supervisors-layout .dashboard-content {
            margin-left: 220px;
            width: calc(100% - 220px);
          }

          .supervisor-page {
            padding: 18px;
          }

        }

        @media (max-width: 900px) {

          .supervisors-layout .sidebar {
            position: static;
            width: 100%;
            height: auto;
            min-height: auto;
          }

          .supervisors-layout .sidebar-menu {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .supervisors-layout .sidebar-footer {
            margin-top: 16px;
          }

          .supervisors-layout .dashboard-content {
            width: 100%;
            margin-left: 0;
            padding: 12px;
          }

        }

        @media (max-width: 768px) {

          .dashboard-navbar {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .dashboard-navbar > div:last-child {
            width: 100%;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .add-supervisor-btn {
            width: 100%;
          }

          .section-heading,
          .table-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .supervisor-page {
            padding: 15px !important;
          }

          .supervisors-layout .dashboard-card {
            padding: 18px;
          }

          .clear-filter-btn {
            width: 100%;
          }

          .monitor-card {
            min-height: 95px;
          }

          .assignment-summary-box {
            width: 100%;
          }

        }

        @media (max-width: 576px) {

          .supervisors-layout .sidebar-menu {
            grid-template-columns: 1fr;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .page-header p {
            font-size: 13px;
          }

          .stat-number {
            font-size: 27px;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions .btn {
            width: 100%;
          }

          .assignment-actions {
            flex-direction: column;
          }

          .assignment-actions .btn {
            width: 100%;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }

          .person-cell {
            min-width: 180px;
          }

          .monitor-card {
            width: 100%;
          }

          .student-select-row {
            align-items: flex-start;
          }

          .already-assigned-badge {
            display: none;
          }

        }

      `}</style>

    </div>
  );
}

export default Supervisors;