import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Acc-super.css";

function AcademicRemarks() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    academicProgress: "",
    practicalSkills: "",
    professionalConduct: "",
    attendance: "",
    strengths: "",
    improvement: "",
    remarks: "",
    recommendation: "",
    rating: "Good",
  });

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("sfpms_user")
      );
    } catch {
      return null;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const user = getCurrentUser();

      if (!user?.id) {
        throw new Error(
          "Academic Supervisor account not found."
        );
      }

      const assignments = await api.get(
        `/supervisor-assignment/supervisor/${user.id}`
      );

      const academicAssignments = Array.isArray(assignments)
        ? assignments.filter(
            (item) =>
              item?.assignment?.role ===
              "ACADEMIC_SUPERVISOR"
          )
        : [];

      const remarks = await api.get(
        `/academic-remarks/?supervisor_id=${user.id}`
      );

      const remarksList = Array.isArray(remarks)
        ? remarks
        : remarks?.remarks || [];

      const studentData = academicAssignments.map(
        (item) => {
          const assignment =
            item.assignment || {};

          const student =
            item.student || {};

          const studentId =
            student.id ||
            assignment.student_id;

          const remark = remarksList.find(
            (remarkItem) =>
              Number(remarkItem.student_id) ===
              Number(studentId)
          );

          return {
            id:
              student.institutional_id ||
              student.id ||
              assignment.student_id,

            userId: studentId,

            name:
              student.name ||
              "Unknown Student",

            programme:
              student.programme ||
              "Not provided",

            organization:
              "Not assigned",

            academicProgress:
              remark?.academic_progress ?? "",

            practicalSkills:
              remark?.practical_skills ?? "",

            professionalConduct:
              remark?.professional_conduct ?? "",

            attendance:
              remark?.attendance ?? "",

            strengths:
              remark?.strengths || "",

            improvement:
              remark?.improvement || "",

            remarks:
              remark?.remarks || "",

            recommendation:
              remark?.recommendation || "",

            rating:
              remark?.rating || "Good",

            submitted:
              Boolean(remark?.submitted),

            remarkId:
              remark?.id || null,

            placementId:
              remark?.placement_id || null,
          };
        }
      );

      setStudents(studentData);
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to load academic remarks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRemarks = (student) => {
    setSelectedStudent(student);

    setForm({
      academicProgress:
        student.academicProgress ?? "",

      practicalSkills:
        student.practicalSkills ?? "",

      professionalConduct:
        student.professionalConduct ?? "",

      attendance:
        student.attendance ?? "",

      strengths:
        student.strengths ?? "",

      improvement:
        student.improvement ?? "",

      remarks:
        student.remarks ?? "",

      recommendation:
        student.recommendation ?? "",

      rating:
        student.rating || "Good",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveRemarks = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      return;
    }

    try {
      setSaving(true);

      const user = getCurrentUser();

      if (!user?.id) {
        throw new Error(
          "Academic Supervisor account not found."
        );
      }

      await api.post(
        "/academic-remarks/",
        {
          student_id:
            selectedStudent.userId,

          supervisor_id:
            user.id,

          placement_id:
            selectedStudent.placementId,

          academic_progress:
            Number(form.academicProgress),

          practical_skills:
            Number(form.practicalSkills),

          professional_conduct:
            Number(form.professionalConduct),

          attendance:
            Number(form.attendance),

          strengths:
            form.strengths,

          improvement:
            form.improvement,

          remarks:
            form.remarks,

          recommendation:
            form.recommendation,

          rating:
            form.rating,

          submitted: true,
        }
      );

      alert(
        "Academic remarks saved successfully."
      );

      setSelectedStudent(null);

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to save academic remarks."
      );
    } finally {
      setSaving(false);
    }
  };

  const getRatingBadge = (rating) => {
    switch (rating) {
      case "Excellent":
        return "badge bg-success";

      case "Very Good":
        return "badge bg-primary";

      case "Good":
        return "badge bg-info text-dark";

      case "Satisfactory":
        return "badge bg-warning text-dark";

      case "Needs Improvement":
        return "badge bg-danger";

      default:
        return "badge bg-secondary";
    }
  };

  const totalStudents =
    students.length;

  const completedRemarks =
    students.filter(
      (student) =>
        student.submitted
    ).length;

  const pendingRemarks =
    students.filter(
      (student) =>
        !student.submitted
    ).length;

  const excellentStudents =
    students.filter(
      (student) =>
        student.rating === "Excellent"
    ).length;

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
            className="sidebar-link"
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
            className="sidebar-link active"
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
              Academic Remarks
            </h5>

            <small className="text-muted">
              Evaluate and provide academic feedback for students
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

          <h2 className="fw-bold mb-4">
            Academic Evaluation
          </h2>

          <div className="alert alert-primary mb-4">

            <h6 className="fw-bold mb-2">
              Academic Evaluation
            </h6>

            <p className="mb-0">
              Evaluate students based on academic progress,
              practical skills, professional conduct,
              attendance and overall field performance.
            </p>

          </div>

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
                  Completed Remarks
                </small>

                <div className="stat-number text-success mt-2">
                  {completedRemarks}
                </div>

              </div>

            </div>

            <div className="col-lg-3 col-md-6">

              <div className="stat-card h-100">

                <small className="text-muted">
                  Pending Remarks
                </small>

                <div className="stat-number text-warning mt-2">
                  {pendingRemarks}
                </div>

              </div>

            </div>

            <div className="col-lg-3 col-md-6">

              <div className="stat-card h-100">

                <small className="text-muted">
                  Excellent
                </small>

                <div className="stat-number text-primary mt-2">
                  {excellentStudents}
                </div>

              </div>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="d-flex justify-content-between align-items-center mb-3">

              <div>

                <h5 className="fw-bold mb-1">
                  Student Academic Evaluation
                </h5>

                <small className="text-muted">
                  Select a student to add or update academic remarks.
                </small>

              </div>

            </div>

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>
                      Student ID
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Programme
                    </th>

                    <th>
                      Organization
                    </th>

                    <th>
                      Academic Progress
                    </th>

                    <th>
                      Practical Skills
                    </th>

                    <th>
                      Conduct
                    </th>

                    <th>
                      Attendance
                    </th>

                    <th>
                      Rating
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="10"
                        className="text-center py-4"
                      >
                        Loading students...
                      </td>

                    </tr>

                  ) : students.length > 0 ? (

                    students.map(
                      (student) => (

                        <tr
                          key={
                            student.userId
                          }
                        >

                          <td>

                            <strong>
                              {student.id}
                            </strong>

                          </td>

                          <td>

                            <strong>
                              {student.name}
                            </strong>

                          </td>

                          <td>
                            {student.programme}
                          </td>

                          <td>
                            {student.organization}
                          </td>

                          <td>

                            {student.academicProgress !== "" ? (

                              <span
                                className={
                                  Number(
                                    student.academicProgress
                                  ) >= 80
                                    ? "text-success fw-semibold"
                                    : "fw-semibold"
                                }
                              >
                                {student.academicProgress}%
                              </span>

                            ) : (

                              <span className="text-muted">
                                —
                              </span>

                            )}

                          </td>

                          <td>

                            {student.practicalSkills !== "" ? (

                              <span
                                className={
                                  Number(
                                    student.practicalSkills
                                  ) >= 80
                                    ? "text-success fw-semibold"
                                    : "fw-semibold"
                                }
                              >
                                {student.practicalSkills}%
                              </span>

                            ) : (

                              <span className="text-muted">
                                —
                              </span>

                            )}

                          </td>

                          <td>

                            {student.professionalConduct !== "" ? (

                              <span
                                className={
                                  Number(
                                    student.professionalConduct
                                  ) >= 80
                                    ? "text-success fw-semibold"
                                    : "fw-semibold"
                                }
                              >
                                {student.professionalConduct}%
                              </span>

                            ) : (

                              <span className="text-muted">
                                —
                              </span>

                            )}

                          </td>

                          <td>

                            {student.attendance !== "" ? (

                              <span
                                className={
                                  Number(
                                    student.attendance
                                  ) >= 80
                                    ? "text-success fw-semibold"
                                    : "fw-semibold"
                                }
                              >
                                {student.attendance}%
                              </span>

                            ) : (

                              <span className="text-muted">
                                —
                              </span>

                            )}

                          </td>

                          <td>

                            {student.submitted ? (

                              <span
                                className={getRatingBadge(
                                  student.rating
                                )}
                              >
                                {student.rating}
                              </span>

                            ) : (

                              <span className="badge bg-secondary">
                                Pending
                              </span>

                            )}

                          </td>

                          <td>

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                openRemarks(
                                  student
                                )
                              }
                            >
                              {student.submitted
                                ? "Edit Remarks"
                                : "Add Remarks"}
                            </button>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="10"
                        className="text-center py-4"
                      >
                        No students assigned to you.
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
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold mb-1">
                    Academic Evaluation
                  </h5>

                  <small className="text-muted">

                    {selectedStudent.name} —{" "}
                    {selectedStudent.id}

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

              <form
                onSubmit={saveRemarks}
              >

                <div className="modal-body">

                  <div className="alert alert-light border mb-4">

                    <div className="row g-3">

                      <div className="col-md-6">

                        <small className="text-muted">
                          Student Name
                        </small>

                        <div className="fw-semibold">
                          {selectedStudent.name}
                        </div>

                      </div>

                      <div className="col-md-6">

                        <small className="text-muted">
                          Student ID
                        </small>

                        <div className="fw-semibold">
                          {selectedStudent.id}
                        </div>

                      </div>

                      <div className="col-md-6">

                        <small className="text-muted">
                          Programme
                        </small>

                        <div className="fw-semibold">
                          {selectedStudent.programme}
                        </div>

                      </div>

                      <div className="col-md-6">

                        <small className="text-muted">
                          Organization
                        </small>

                        <div className="fw-semibold">
                          {selectedStudent.organization}
                        </div>

                      </div>

                    </div>

                  </div>

                  <h6 className="fw-bold mb-3">
                    Performance Scores
                  </h6>

                  <div className="row g-3 mb-4">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Academic Progress (%)
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        name="academicProgress"
                        value={
                          form.academicProgress
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Practical Skills (%)
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        name="practicalSkills"
                        value={
                          form.practicalSkills
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Professional Conduct (%)
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        name="professionalConduct"
                        value={
                          form.professionalConduct
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Attendance (%)
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        name="attendance"
                        value={
                          form.attendance
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Overall Rating
                    </label>

                    <select
                      className="form-select"
                      name="rating"
                      value={
                        form.rating
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="Excellent">
                        Excellent
                      </option>

                      <option value="Very Good">
                        Very Good
                      </option>

                      <option value="Good">
                        Good
                      </option>

                      <option value="Satisfactory">
                        Satisfactory
                      </option>

                      <option value="Needs Improvement">
                        Needs Improvement
                      </option>

                    </select>

                  </div>

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Student Strengths
                    </label>

                    <textarea
                      className="form-control"
                      name="strengths"
                      value={
                        form.strengths
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                      placeholder="Describe student's strengths..."
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Areas for Improvement
                    </label>

                    <textarea
                      className="form-control"
                      name="improvement"
                      value={
                        form.improvement
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                      placeholder="Describe areas requiring improvement..."
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Academic Remarks
                    </label>

                    <textarea
                      className="form-control"
                      name="remarks"
                      value={
                        form.remarks
                      }
                      onChange={
                        handleChange
                      }
                      rows="4"
                      placeholder="Write academic remarks..."
                      required
                    />

                  </div>

                  <div className="mb-2">

                    <label className="form-label fw-semibold">
                      Recommendations
                    </label>

                    <textarea
                      className="form-control"
                      name="recommendation"
                      value={
                        form.recommendation
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                      placeholder="Write recommendations..."
                      required
                    />

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setSelectedStudent(
                        null
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Academic Remarks"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AcademicRemarks;


