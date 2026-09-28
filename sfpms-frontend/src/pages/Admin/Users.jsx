import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const roleLabels = {
  STUDENT: "Student",
  FIELD_SUPERVISOR: "Field Supervisor",
  ACADEMIC_SUPERVISOR: "Academic Supervisor",
  COORDINATOR: "Coordinator",
  ADMIN: "Admin",
};

const statusLabels = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const emptyForm = {
    institutional_id: "",
    name: "",
    email: "",
    phone: "",
    programme: "",
    password: "",
    role: "STUDENT",
    status: "ACTIVE",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/users/`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.phone?.toLowerCase().includes(searchText) ||
      user.institutional_id?.toLowerCase().includes(searchText);

    const matchesRole =
      roleFilter === "All" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (user) => user.role === "STUDENT"
  ).length;

  const totalSupervisors = users.filter(
    (user) =>
      user.role === "FIELD_SUPERVISOR" ||
      user.role === "ACADEMIC_SUPERVISOR"
  ).length;

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create user");
        return;
      }

      alert("User created successfully");

      setShowAddModal(false);
      setFormData(emptyForm);

      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to create user");
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);

    setFormData({
      institutional_id: user.institutional_id || "",
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      programme: user.programme || "",
      password: "",
      role: user.role || "STUDENT",
      status: user.status || "ACTIVE",
    });

    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        programme: formData.programme,
        role: formData.role,
        status: formData.status,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(
        `${API_URL}/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update user");
        return;
      }

      alert("User updated successfully");

      setShowEditModal(false);
      setSelectedUser(null);
      setFormData(emptyForm);

      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to update user");
    }
  };

  const toggleStatus = async (user) => {
    const newStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await fetch(
        `${API_URL}/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete user");
        return;
      }

      alert("User deleted successfully");

      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="dashboard users-page">
      <div className="sidebar">
        <div className="sidebar-header">
          <img
            src="/image/egaz-logo.jpg"
            alt="E-GAZ"
            className="dashboard-logo"
          />

          <h5>Admin Panel</h5>
        </div>

        <div className="sidebar-menu">
          <Link
            to="/admin/dashboard"
            className="sidebar-link"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="sidebar-link active"
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
            Settings
          </Link>
        </div>

        <div className="sidebar-footer">
          <Link
            to="/login"
            className="sidebar-link logout-link"
          >
            Logout
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-navbar">
          <div>
            <h5 className="mb-0 fw-bold">
              User Management
            </h5>

            <small className="text-muted">
              Manage system users and their roles
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo navbar-logo"
            />

            <span className="fw-semibold">
              Welcome, Admin
            </span>
          </div>
        </div>

        <div className="container-fluid p-4 users-content">
          <div className="users-header">
            <div>
              <h2>Users</h2>

              <p>
                View and manage all system users.
              </p>
            </div>

            <button
              className="btn btn-primary add-user-btn"
              onClick={() => {
                setFormData(emptyForm);
                setShowAddModal(true);
              }}
            >
              + Add New User
            </button>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="user-stat-card">
                <div className="stat-icon">
                  Users
                </div>

                <div>
                  <span>Total Users</span>

                  <h3>{totalUsers}</h3>

                  <small>
                    All registered users
                  </small>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="user-stat-card">
                <div className="stat-icon blue"></div>

                <div>
                  <span>Students</span>

                  <h3>{totalStudents}</h3>

                  <small>
                    Registered students
                  </small>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="user-stat-card">
                <div className="stat-icon purple"></div>

                <div>
                  <span>Supervisors</span>

                  <h3>{totalSupervisors}</h3>

                  <small>
                    System supervisors
                  </small>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="user-stat-card">
                <div className="stat-icon green"></div>

                <div>
                  <span>Active Users</span>

                  <h3 className="text-success">
                    {activeUsers}
                  </h3>

                  <small>
                    Currently active
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card users-table-card">
            <div className="filter-header">
              <div>
                <h5>All Users</h5>

                <small>
                  {filteredUsers.length} user
                  {filteredUsers.length !== 1 ? "s" : ""} found
                </small>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-lg-5">
                <div className="search-wrapper">
                  <span className="search-icon"></span>

                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search by name, email, ID or phone..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Roles
                  </option>

                  <option value="STUDENT">
                    Student
                  </option>

                  <option value="FIELD_SUPERVISOR">
                    Field Supervisor
                  </option>

                  <option value="ACADEMIC_SUPERVISOR">
                    Academic Supervisor
                  </option>

                  <option value="COORDINATOR">
                    Coordinator
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>
                </select>
              </div>

              <div className="col-lg-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="col-lg-2">
                <button
                  className="btn btn-outline-secondary w-100 filter-reset-btn"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="table-responsive users-table-wrapper">
              <table className="table align-middle users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Institutional ID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-5"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <span className="user-id">
                            #{user.id}
                          </span>
                        </td>

                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar">
                              {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {user.name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="table-text">
                            {user.institutional_id}
                          </span>
                        </td>

                        <td>
                          <span className="table-text">
                            {user.email}
                          </span>
                        </td>

                        <td>
                          <span className="table-text">
                            {user.phone || "-"}
                          </span>
                        </td>

                        <td>
                          <span className="role-badge">
                            {roleLabels[user.role] ||
                              user.role}
                          </span>
                        </td>

                        <td>
                          {user.status === "ACTIVE" ? (
                            <span className="status-badge active-status">
                              <span className="status-dot"></span>
                              Active
                            </span>
                          ) : (
                            <span className="status-badge inactive-status">
                              <span className="status-dot"></span>
                              Inactive
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="registered-date">
                            {user.created_at
                              ? user.created_at.split(" ")[0]
                              : "-"}
                          </span>
                        </td>

                        <td>
                          <div className="user-actions">
                            <button
                              className="action-btn view-btn"
                              onClick={() =>
                                openViewModal(user)
                              }
                            >
                              View
                            </button>

                            <button
                              className="action-btn edit-btn"
                              onClick={() =>
                                openEditModal(user)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="action-btn status-btn"
                              onClick={() =>
                                toggleStatus(user)
                              }
                            >
                              {user.status === "ACTIVE"
                                ? "Disable"
                                : "Activate"}
                            </button>

                            <button
                              className="action-btn delete-btn"
                              onClick={() =>
                                deleteUser(user.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="no-users"
                      >
                        <div className="no-users-content">
                          <div className="no-users-icon"></div>

                          <h6>
                            No users found
                          </h6>

                          <p>
                            Try changing your search or filters.
                          </p>
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

      {showAddModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal modal-lg-custom">
            <div className="custom-modal-header">
              <div>
                <h5>Add New User</h5>

                <small>
                  Create a new system user
                </small>
              </div>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="custom-modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">
                      Institutional ID
                    </label>

                    <input
                      type="text"
                      name="institutional_id"
                      className="form-control"
                      value={formData.institutional_id}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
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
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Programme
                    </label>

                    <input
                      type="text"
                      name="programme"
                      className="form-control"
                      value={formData.programme}
                      onChange={handleChange}
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
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Role
                    </label>

                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="STUDENT">
                        Student
                      </option>

                      <option value="FIELD_SUPERVISOR">
                        Field Supervisor
                      </option>

                      <option value="ACADEMIC_SUPERVISOR">
                        Academic Supervisor
                      </option>

                      <option value="COORDINATOR">
                        Coordinator
                      </option>

                      <option value="ADMIN">
                        Admin
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
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="custom-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <div>
                <h5>User Details</h5>

                <small>
                  View user account information
                </small>
              </div>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setShowViewModal(false)
                }
              >
                ×
              </button>
            </div>

            <div className="custom-modal-body">
              <div className="profile-preview">
                <div className="large-user-avatar">
                  {selectedUser.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <h4>{selectedUser.name}</h4>

                <span className="role-badge">
                  {roleLabels[selectedUser.role] ||
                    selectedUser.role}
                </span>
              </div>

              <div className="user-details-list">
                <div className="detail-row">
                  <span>User ID</span>
                  <strong>
                    #{selectedUser.id}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Institutional ID</span>
                  <strong>
                    {selectedUser.institutional_id}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Full Name</span>
                  <strong>
                    {selectedUser.name}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Email</span>
                  <strong>
                    {selectedUser.email}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Phone</span>
                  <strong>
                    {selectedUser.phone || "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Programme</span>
                  <strong>
                    {selectedUser.programme || "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Role</span>
                  <strong>
                    {roleLabels[selectedUser.role] ||
                      selectedUser.role}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Status</span>

                  {selectedUser.status === "ACTIVE" ? (
                    <span className="status-badge active-status">
                      <span className="status-dot"></span>
                      Active
                    </span>
                  ) : (
                    <span className="status-badge inactive-status">
                      <span className="status-dot"></span>
                      Inactive
                    </span>
                  )}
                </div>

                <div className="detail-row">
                  <span>Registered</span>

                  <strong>
                    {selectedUser.created_at
                      ? selectedUser.created_at.split(" ")[0]
                      : "-"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="custom-modal-footer">
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowViewModal(false)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="custom-modal-overlay">
          <div className="custom-modal modal-lg-custom">
            <div className="custom-modal-header">
              <div>
                <h5>Edit User</h5>

                <small>
                  Update user account information
                </small>
              </div>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditUser}>
              <div className="custom-modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">
                      Institutional ID
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        formData.institutional_id
                      }
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
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
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Programme
                    </label>

                    <input
                      type="text"
                      name="programme"
                      className="form-control"
                      value={formData.programme}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      New Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave empty to keep current password"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Role
                    </label>

                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="STUDENT">
                        Student
                      </option>

                      <option value="FIELD_SUPERVISOR">
                        Field Supervisor
                      </option>

                      <option value="ACADEMIC_SUPERVISOR">
                        Academic Supervisor
                      </option>

                      <option value="COORDINATOR">
                        Coordinator
                      </option>

                      <option value="ADMIN">
                        Admin
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
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="custom-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .users-page {
          font-family: Inter, Poppins, Arial, sans-serif;
          background: #f4f7fb;
          min-height: 100vh;
          color: #0f172a;
        }

        .users-page .sidebar {
          width: 250px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          background: #2563eb;
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .users-page .sidebar-header {
          text-align: center;
          padding: 5px 8px 22px;
          border-bottom: 1px solid #eef2f7;
        }

        .users-page .sidebar-header h5 {
          margin: 12px 0 0;
          color: #0d0d0e;
          font-weight: 800;
        }

        .users-page .dashboard-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 10px;
        }

        .users-page .sidebar-menu {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .users-page .sidebar-link {
          text-decoration: none;
          color: #ffffff;
          padding: 12px 14px;
          border-radius: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .users-page .sidebar-link:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        .users-page .sidebar-link.active {
          background: #636fce;
          color: #ffffff;
        }

        .users-page .sidebar-footer {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #eef2f7;
        }

        .users-page .logout-link {
          color: #dc2626;
        }

        .users-page .dashboard-content {
          margin-left: 250px;
          min-height: 100vh;
          background: #f4f7fb;
          padding: 18px;
        }

        .users-page .dashboard-navbar {
          min-height: 74px;
          padding: 15px 20px;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .users-page .dashboard-navbar .text-muted {
          color: rgba(255, 255, 255, 0.82) !important;
        }

        .users-page .navbar-logo {
          background: #ffffff;
          padding: 4px;
          width: 42px;
          height: 42px;
          border-radius: 12px;
        }

        .users-content {
          padding-top: 28px !important;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .users-header h2 {
          margin: 0 0 5px;
          font-size: 28px;
          font-weight: 800;
        }

        .users-header p {
          margin: 0;
          color: #64748b;
        }

        .add-user-btn {
          min-height: 44px;
          padding: 10px 20px;
          border-radius: 11px;
          font-weight: 700;
          border: none;
          background: #2563eb;
        }

        .user-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          min-height: 135px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
        }

        .user-stat-card span {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
        }

        .user-stat-card h3 {
          margin: 4px 0;
          color: #1d4ed8;
          font-size: 28px;
          font-weight: 800;
        }

        .user-stat-card small {
          color: #94a3b8;
          font-size: 12px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #eff6ff;
          font-size: 22px;
        }

        .stat-icon.blue {
          background: #eff6ff;
        }

        .stat-icon.purple {
          background: #f5f3ff;
        }

        .stat-icon.green {
          background: #f0fdf4;
        }

        .users-page .dashboard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
        }

        .users-table-card {
          padding: 24px;
        }

        .filter-header {
          margin-bottom: 20px;
        }

        .filter-header h5 {
          margin: 0 0 3px;
          font-weight: 800;
        }

        .filter-header small {
          color: #94a3b8;
        }

        .search-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }

        .search-input {
          padding-left: 40px !important;
        }

        .users-page .form-control,
        .users-page .form-select {
          min-height: 44px;
          border: 1px solid #dbe3ee;
          border-radius: 11px;
          color: #334155;
          background: #ffffff;
          box-shadow: none;
        }

        .users-page .form-control:focus,
        .users-page .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .filter-reset-btn {
          min-height: 44px;
          border-radius: 11px;
          font-weight: 600;
        }

        .users-table-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          overflow-x: auto;
        }

        .users-table {
          margin-bottom: 0;
          min-width: 1250px;
        }

        .users-table thead th {
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 15px;
          white-space: nowrap;
        }

        .users-table tbody td {
          padding: 15px;
          border-bottom: 1px solid #eef2f7;
          color: #334155;
          font-size: 14px;
        }

        .user-id {
          color: #64748b;
          font-weight: 700;
        }

        .user-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 170px;
        }

        .user-avatar,
        .large-user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 800;
          border-radius: 50%;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
        }

        .large-user-avatar {
          width: 72px;
          height: 72px;
          font-size: 28px;
          margin: 0 auto 12px;
        }

        .table-text,
        .registered-date {
          color: #64748b;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .active-status {
          background: #f0fdf4;
          color: #15803d;
        }

        .inactive-status {
          background: #f1f5f9;
          color: #64748b;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .user-actions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          min-width: 300px;
        }

        .action-btn {
          border: 1px solid;
          background: #ffffff;
          border-radius: 8px;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 700;
        }

        .view-btn {
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .edit-btn {
          color: #d97706;
          border-color: #fde68a;
        }

        .status-btn {
          color: #64748b;
          border-color: #cbd5e1;
        }

        .delete-btn {
          color: #dc2626;
          border-color: #fecaca;
        }

        .no-users {
          padding: 45px !important;
        }

        .no-users-content {
          text-align: center;
        }

        .no-users-icon {
          font-size: 30px;
          margin-bottom: 10px;
        }

        .no-users-content h6 {
          font-weight: 800;
        }

        .no-users-content p {
          color: #94a3b8;
        }

        .custom-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.58);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 2000;
          overflow-y: auto;
        }

        .custom-modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 17px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
        }

        .modal-lg-custom {
          max-width: 780px;
        }

        .custom-modal-header {
          padding: 20px 22px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .custom-modal-header h5 {
          margin: 0 0 3px;
          font-weight: 800;
        }

        .custom-modal-header small {
          color: #64748b;
        }

        .modal-close-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 9px;
          background: #f1f5f9;
          color: #475569;
          font-size: 24px;
          cursor: pointer;
        }

        .custom-modal-body {
          padding: 24px;
        }

        .custom-modal .form-label {
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .custom-modal-footer {
          padding: 16px 22px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .custom-modal-footer .btn {
          border-radius: 10px;
          padding: 9px 17px;
          font-weight: 700;
        }

        .profile-preview {
          text-align: center;
          padding: 5px 0 20px;
          border-bottom: 1px solid #eef2f7;
          margin-bottom: 10px;
        }

        .profile-preview h4 {
          margin-bottom: 9px;
          font-weight: 800;
        }

        .user-details-list {
          display: flex;
          flex-direction: column;
        }

        .detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #eef2f7;
        }

        .detail-row span:first-child {
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
        }

        .detail-row strong {
          color: #334155;
          text-align: right;
        }

        @media (max-width: 768px) {
          .users-page .sidebar {
            position: static;
            width: 100%;
          }

          .users-page .dashboard-content {
            margin-left: 0;
            padding: 12px;
          }

          .users-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .add-user-btn {
            width: 100%;
          }

          .users-page .dashboard-navbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .users-content {
            padding: 18px 4px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Users;


