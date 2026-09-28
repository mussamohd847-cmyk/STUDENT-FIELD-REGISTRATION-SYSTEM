import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_BASE_URL = "http://localhost:5000/api";

function Reports() {
  const [reportType, setReportType] = useState("Application Report");
  const [academicYear, setAcademicYear] = useState("2026/2027");
  const [programme, setProgramme] = useState("All Programmes");
  const [organization, setOrganization] = useState("All Organizations");
  const [status, setStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [generated, setGenerated] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        usersResponse,
        applicationsResponse,
        organizationsResponse,
        placementsResponse,
        dailyLogsResponse,
        reportsResponse,
        evaluationsResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/users/`),
        fetch(`${API_BASE_URL}/applications/`),
        fetch(`${API_BASE_URL}/organizations/`),
        fetch(`${API_BASE_URL}/placements/`),
        fetch(`${API_BASE_URL}/daily-logs/`),
        fetch(`${API_BASE_URL}/reports/`),
        fetch(`${API_BASE_URL}/evaluations/`),
      ]);

      if (!usersResponse.ok) {
        throw new Error("Failed to load users");
      }

      if (!applicationsResponse.ok) {
        throw new Error("Failed to load applications");
      }

      if (!organizationsResponse.ok) {
        throw new Error("Failed to load organizations");
      }

      if (!placementsResponse.ok) {
        throw new Error("Failed to load placements");
      }

      if (!dailyLogsResponse.ok) {
        throw new Error("Failed to load daily logs");
      }

      if (!reportsResponse.ok) {
        throw new Error("Failed to load reports");
      }

      if (!evaluationsResponse.ok) {
        throw new Error("Failed to load evaluations");
      }

      const [
        usersData,
        applicationsData,
        organizationsData,
        placementsData,
        dailyLogsData,
        reportsData,
        evaluationsData,
      ] = await Promise.all([
        usersResponse.json(),
        applicationsResponse.json(),
        organizationsResponse.json(),
        placementsResponse.json(),
        dailyLogsResponse.json(),
        reportsResponse.json(),
        evaluationsResponse.json(),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setApplications(
        Array.isArray(applicationsData)
          ? applicationsData
          : []
      );
      setOrganizations(
        Array.isArray(organizationsData)
          ? organizationsData
          : []
      );
      setPlacements(
        Array.isArray(placementsData)
          ? placementsData
          : []
      );
      setDailyLogs(
        Array.isArray(dailyLogsData)
          ? dailyLogsData
          : []
      );
      setReports(
        Array.isArray(reportsData)
          ? reportsData
          : []
      );
      setEvaluations(
        Array.isArray(evaluationsData)
          ? evaluationsData
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load report data. Make sure the SFPMS backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const students = useMemo(
    () =>
      users.filter(
        (user) => user.role === "STUDENT"
      ),
    [users]
  );

  const supervisors = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "FIELD_SUPERVISOR" ||
          user.role === "ACADEMIC_SUPERVISOR"
      ),
    [users]
  );

  const getStudent = (studentId) =>
    users.find(
      (user) =>
        Number(user.id) === Number(studentId)
    );

  const getOrganization = (organizationId) =>
    organizations.find(
      (organizationItem) =>
        Number(organizationItem.id) ===
        Number(organizationId)
    );

  const getSupervisor = (supervisorId) =>
    users.find(
      (user) =>
        Number(user.id) === Number(supervisorId)
    );

  const getApplication = (applicationId) =>
    applications.find(
      (application) =>
        Number(application.id) ===
        Number(applicationId)
    );

  const getPlacement = (placementId) =>
    placements.find(
      (placementItem) =>
        Number(placementItem.id) ===
        Number(placementId)
    );

  const getStudentName = (studentId) => {
    const student = getStudent(studentId);

    if (student?.name) {
      return student.name;
    }

    const application = applications.find(
      (item) =>
        Number(item.student_id) ===
        Number(studentId)
    );

    return (
      application?.student_name ||
      "Unknown Student"
    );
  };

  const getProgramme = (
    studentId,
    application = null
  ) => {
    if (application?.programme) {
      return application.programme;
    }

    const student = getStudent(studentId);

    return student?.programme || "N/A";
  };

  const getOrganizationName = (
    organizationId,
    application = null
  ) => {
    const organizationItem =
      getOrganization(organizationId);

    if (organizationItem?.name) {
      return organizationItem.name;
    }

    return (
      application?.preferred_organization ||
      "N/A"
    );
  };

  const getStatusLabel = (value) => {
    if (!value) {
      return "N/A";
    }

    return String(value)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (value) => {
    const normalized = String(
      value || ""
    ).toLowerCase();

    if (
      normalized === "approved" ||
      normalized === "active" ||
      normalized === "completed"
    ) {
      return "approved";
    }

    if (
      normalized === "rejected" ||
      normalized === "inactive"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const matchesCommonFilters = (
    item,
    itemDate,
    itemProgramme,
    itemOrganization,
    itemStatus
  ) => {
    const programmeMatch =
      programme === "All Programmes" ||
      itemProgramme === programme;

    const organizationMatch =
      organization ===
        "All Organizations" ||
      itemOrganization === organization;

    const statusMatch =
      status === "All Status" ||
      getStatusLabel(itemStatus) === status;

    const fromDateMatch =
      !fromDate ||
      !itemDate ||
      itemDate >= fromDate;

    const toDateMatch =
      !toDate ||
      !itemDate ||
      itemDate <= toDate;

    return (
      programmeMatch &&
      organizationMatch &&
      statusMatch &&
      fromDateMatch &&
      toDateMatch
    );
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((item) =>
      matchesCommonFilters(
        item,
        item.submitted_at
          ? String(
              item.submitted_at
            ).slice(0, 10)
          : "",
        item.programme || "N/A",
        getOrganizationName(
          item.organization_id,
          item
        ),
        item.status
      )
    );
  }, [
    applications,
    programme,
    organization,
    status,
    fromDate,
    toDate,
    organizations,
    users,
  ]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const studentApplications =
        applications.filter(
          (application) =>
            Number(application.student_id) ===
            Number(student.id)
        );

      const application =
        studentApplications[0];

      return matchesCommonFilters(
        student,
        application?.submitted_at
          ? String(
              application.submitted_at
            ).slice(0, 10)
          : "",
        student.programme ||
          application?.programme ||
          "N/A",
        getOrganizationName(
          application?.organization_id,
          application
        ),
        application?.status ||
          student.status
      );
    });
  }, [
    students,
    applications,
    programme,
    organization,
    status,
    fromDate,
    toDate,
    organizations,
    users,
  ]);

  const filteredPlacements = useMemo(() => {
    return placements.filter((item) => {
      const application =
        getApplication(
          item.application_id
        );

      return matchesCommonFilters(
        item,
        item.start_date,
        getProgramme(
          item.student_id,
          application
        ),
        getOrganizationName(
          item.organization_id,
          application
        ),
        item.status
      );
    });
  }, [
    placements,
    applications,
    programme,
    organization,
    status,
    fromDate,
    toDate,
    organizations,
    users,
  ]);

  const filteredDailyLogs = useMemo(() => {
    return dailyLogs.filter((item) => {
      const placement =
        getPlacement(item.placement_id);

      const application = placement
        ? getApplication(
            placement.application_id
          )
        : null;

      return matchesCommonFilters(
        item,
        item.log_date,
        getProgramme(
          item.student_id,
          application
        ),
        getOrganizationName(
          placement?.organization_id,
          application
        ),
        item.status
      );
    });
  }, [
    dailyLogs,
    placements,
    applications,
    programme,
    organization,
    status,
    fromDate,
    toDate,
    organizations,
    users,
  ]);

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const placement =
        getPlacement(item.placement_id);

      const application = placement
        ? getApplication(
            placement.application_id
          )
        : null;

      return matchesCommonFilters(
        item,
        item.submitted_at
          ? String(
              item.submitted_at
            ).slice(0, 10)
          : "",
        getProgramme(
          item.student_id,
          application
        ),
        getOrganizationName(
          placement?.organization_id,
          application
        ),
        item.status
      );
    });
  }, [
    reports,
    placements,
    applications,
    programme,
    organization,
    status,
    fromDate,
    toDate,
    organizations,
    users,
  ]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      const placement =
        getPlacement(item.placement_id);

      const application = placement
        ? getApplication(
            placement.application_id
          )
        : null;

      return matchesCommonFilters(
        item,
        item.submitted_at
          ? String(
              item.submitted_at
            ).slice(0, 10)
          : "",
        getProgramme(
          item.student_id,
          application
        ),
        getOrganizationName(
          placement?.organization_id,
          application
        ),
        item.status
      );
    });
  }, [
    evaluations,
    placements,
    applications,
    programme,
    organization,
    status,
    fromDate,
    toDate,
    organizations,
    users,
  ]);

  const filteredSupervisors = useMemo(() => {
    return supervisors.filter(
      (supervisor) => {
        if (
          programme !==
          "All Programmes"
        ) {
          if (
            supervisor.programme !==
            programme
          ) {
            return false;
          }
        }

        return true;
      }
    );
  }, [supervisors, programme]);

  const filteredOrganizations =
    useMemo(() => {
      return organizations.filter(
        (organizationItem) => {
          const organizationMatch =
            organization ===
              "All Organizations" ||
            organizationItem.name ===
              organization;

          const statusMatch =
            status === "All Status" ||
            getStatusLabel(
              organizationItem.status
            ) === status;

          return (
            organizationMatch &&
            statusMatch
          );
        }
      );
    }, [
      organizations,
      organization,
      status,
    ]);

  const reportRows = useMemo(() => {
    if (
      reportType ===
      "Student Report"
    ) {
      return filteredStudents.map(
        (student) => {
          const application =
            applications.find(
              (item) =>
                Number(
                  item.student_id
                ) ===
                Number(student.id)
            );

          const placement =
            placements.find(
              (item) =>
                Number(
                  item.student_id
                ) ===
                  Number(student.id) &&
                item.status ===
                  "ACTIVE"
            );

          return {
            id: student.id,
            studentId:
              student.institutional_id ||
              student.id,
            student:
              student.name ||
              application?.student_name ||
              "Unknown Student",
            programme:
              student.programme ||
              application?.programme ||
              "N/A",
            organization:
              getOrganizationName(
                placement?.organization_id ||
                  application?.organization_id,
                application
              ),
            date:
              application?.submitted_at
                ? String(
                    application.submitted_at
                  ).slice(0, 10)
                : "",
            status:
              student.status ||
              application?.status ||
              "ACTIVE",
          };
        }
      );
    }

    if (
      reportType ===
      "Application Report"
    ) {
      return filteredApplications.map(
        (item) => ({
          id:
            item.application_code ||
            item.id,
          studentId:
            item.student_number ||
            item.student_id,
          student:
            item.student_name ||
            getStudentName(
              item.student_id
            ),
          programme:
            item.programme || "N/A",
          organization:
            getOrganizationName(
              item.organization_id,
              item
            ),
          date: item.submitted_at
            ? String(
                item.submitted_at
              ).slice(0, 10)
            : "",
          status: item.status,
        })
      );
    }

    if (
      reportType ===
      "Placement Report"
    ) {
      return filteredPlacements.map(
        (item) => {
          const application =
            getApplication(
              item.application_id
            );

          return {
            id: item.id,
            studentId:
              getStudent(
                item.student_id
              )?.institutional_id ||
              item.student_id,
            student:
              getStudentName(
                item.student_id
              ),
            programme:
              getProgramme(
                item.student_id,
                application
              ),
            organization:
              getOrganizationName(
                item.organization_id,
                application
              ),
            date: item.start_date,
            status: item.status,
            department:
              item.department ||
              "N/A",
            startDate:
              item.start_date,
            endDate:
              item.end_date,
          };
        }
      );
    }

    if (
      reportType ===
      "Attendance Report"
    ) {
      return filteredDailyLogs.map(
        (item) => {
          const placement =
            getPlacement(
              item.placement_id
            );

          const application =
            placement
              ? getApplication(
                  placement.application_id
                )
              : null;

          return {
            id: item.id,
            studentId:
              getStudent(
                item.student_id
              )?.institutional_id ||
              item.student_id,
            student:
              getStudentName(
                item.student_id
              ),
            programme:
              getProgramme(
                item.student_id,
                application
              ),
            organization:
              getOrganizationName(
                placement?.organization_id,
                application
              ),
            date: item.log_date,
            status: item.status,
            signIn:
              item.sign_in_time ||
              "N/A",
            signOut:
              item.sign_out_time ||
              "N/A",
          };
        }
      );
    }

    if (
      reportType ===
      "Daily Logbook Report"
    ) {
      return filteredDailyLogs.map(
        (item) => {
          const placement =
            getPlacement(
              item.placement_id
            );

          const application =
            placement
              ? getApplication(
                  placement.application_id
                )
              : null;

          return {
            id: item.id,
            studentId:
              getStudent(
                item.student_id
              )?.institutional_id ||
              item.student_id,
            student:
              getStudentName(
                item.student_id
              ),
            programme:
              getProgramme(
                item.student_id,
                application
              ),
            organization:
              getOrganizationName(
                placement?.organization_id,
                application
              ),
            date: item.log_date,
            status: item.status,
            activity:
              item.activity ||
              "N/A",
            signIn:
              item.sign_in_time ||
              "N/A",
            signOut:
              item.sign_out_time ||
              "N/A",
          };
        }
      );
    }

    if (
      reportType ===
      "Field Report"
    ) {
      return filteredReports.map(
        (item) => {
          const placement =
            getPlacement(
              item.placement_id
            );

          const application =
            placement
              ? getApplication(
                  placement.application_id
                )
              : null;

          return {
            id: item.id,
            studentId:
              getStudent(
                item.student_id
              )?.institutional_id ||
              item.student_id,
            student:
              getStudentName(
                item.student_id
              ),
            programme:
              getProgramme(
                item.student_id,
                application
              ),
            organization:
              getOrganizationName(
                placement?.organization_id,
                application
              ),
            title:
              item.title ||
              "N/A",
            date:
              item.submitted_at
                ? String(
                    item.submitted_at
                  ).slice(0, 10)
                : "",
            status:
              item.status,
          };
        }
      );
    }

    if (
      reportType ===
      "Supervisor Report"
    ) {
      return filteredSupervisors.map(
        (supervisor) => {
          const evaluationCount =
            evaluations.filter(
              (evaluation) =>
                Number(
                  evaluation.supervisor_id
                ) ===
                Number(
                  supervisor.id
                )
            ).length;

          return {
            id: supervisor.id,
            studentId:
              supervisor.institutional_id,
            student:
              supervisor.name,
            programme:
              supervisor.programme ||
              "N/A",
            organization: "N/A",
            date:
              supervisor.created_at
                ? String(
                    supervisor.created_at
                  ).slice(0, 10)
                : "",
            status:
              supervisor.status,
            role: getStatusLabel(
              supervisor.role
            ),
            evaluations:
              evaluationCount,
          };
        }
      );
    }

    if (
      reportType ===
      "Organization Report"
    ) {
      return filteredOrganizations.map(
        (item) => {
          const activePlacements =
            placements.filter(
              (placement) =>
                Number(
                  placement.organization_id
                ) === Number(item.id) &&
                placement.status ===
                  "ACTIVE"
            );

          return {
            id:
              item.organization_code ||
              item.id,
            studentId: item.id,
            student: item.name,
            programme:
              item.type || "N/A",
            organization:
              item.name,
            date:
              item.created_at
                ? String(
                    item.created_at
                  ).slice(0, 10)
                : "",
            status:
              item.status,
            positions:
              item.positions || 0,
            activeStudents:
              activePlacements.length,
            contact:
              item.contact_person ||
              "N/A",
          };
        }
      );
    }

    if (
      reportType ===
      "Final Assessment Report"
    ) {
      return filteredEvaluations.map(
        (item) => {
          const placement =
            getPlacement(
              item.placement_id
            );

          const application =
            placement
              ? getApplication(
                  placement.application_id
                )
              : null;

          return {
            id: item.id,
            studentId:
              getStudent(
                item.student_id
              )?.institutional_id ||
              item.student_id,
            student:
              getStudentName(
                item.student_id
              ),
            programme:
              getProgramme(
                item.student_id,
                application
              ),
            organization:
              getOrganizationName(
                placement?.organization_id,
                application
              ),
            date:
              item.submitted_at
                ? String(
                    item.submitted_at
                  ).slice(0, 10)
                : "",
            status:
              item.status,
            attendance:
              item.attendance_score ??
              "N/A",
            discipline:
              item.discipline_score ??
              "N/A",
            skills:
              item.skills_score ??
              "N/A",
            teamwork:
              item.teamwork_score ??
              "N/A",
            overall:
              item.overall_score ??
              "N/A",
          };
        }
      );
    }

    if (
      reportType ===
      "Complete Student Report"
    ) {
      return filteredStudents.map(
        (student) => {
          const application =
            applications.find(
              (item) =>
                Number(
                  item.student_id
                ) ===
                Number(student.id)
            );

          const placement =
            placements.find(
              (item) =>
                Number(
                  item.student_id
                ) ===
                  Number(student.id) &&
                item.status ===
                  "ACTIVE"
            );

          const studentLogs =
            dailyLogs.filter(
              (item) =>
                Number(
                  item.student_id
                ) ===
                Number(student.id)
            );

          const studentReports =
            reports.filter(
              (item) =>
                Number(
                  item.student_id
                ) ===
                Number(student.id)
            );

          const evaluation =
            evaluations.find(
              (item) =>
                Number(
                  item.student_id
                ) ===
                Number(student.id)
            );

          return {
            id: student.id,
            studentId:
              student.institutional_id ||
              student.id,
            student: student.name,
            programme:
              student.programme ||
              application?.programme ||
              "N/A",
            organization:
              getOrganizationName(
                placement?.organization_id ||
                  application?.organization_id,
                application
              ),
            date:
              application?.submitted_at
                ? String(
                    application.submitted_at
                  ).slice(0, 10)
                : "",
            status:
              placement?.status ||
              application?.status ||
              student.status,
            logs:
              studentLogs.length,
            reports:
              studentReports.length,
            overall:
              evaluation?.overall_score ??
              "N/A",
          };
        }
      );
    }

    return [];
  }, [
    reportType,
    filteredStudents,
    filteredApplications,
    filteredPlacements,
    filteredDailyLogs,
    filteredSupervisors,
    filteredOrganizations,
    filteredEvaluations,
    filteredReports,
    applications,
    placements,
    dailyLogs,
    reports,
    evaluations,
    users,
    organizations,
  ]);

  const reviewReport = async (
    reportId,
    newStatus
  ) => {
    if (!reportId) {
      alert("Report ID not found.");
      return;
    }

    if (
      newStatus === "REJECTED" &&
      !feedback.trim()
    ) {
      alert(
        "Please enter feedback before rejecting the report."
      );
      return;
    }

    try {
      setReviewLoading(true);

      const storedUser =
        localStorage.getItem(
          "sfpms_user"
        );

      let reviewerId = null;

      if (storedUser) {
        const parsedUser =
          JSON.parse(storedUser);

        reviewerId = parsedUser.id;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/reports/${reportId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status: newStatus,
              feedback:
                feedback.trim(),
              reviewed_by:
                reviewerId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to review report."
        );
      }

      alert(
        newStatus === "APPROVED"
          ? "Report approved successfully."
          : "Report rejected successfully."
      );

      setSelectedReport(null);
      setFeedback("");

      await loadReportData();
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to review report."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const openReportFile = (report) => {
    if (!report) {
      return;
    }

    if (report.attachment_url) {
      window.open(
        report.attachment_url,
        "_blank"
      );
      return;
    }

    if (report.file_path) {
      window.open(
        `${API_BASE_URL}/reports/uploads/${report.file_path}`,
        "_blank"
      );
      return;
    }

    if (report.attachment) {
      window.open(
        `${API_BASE_URL}/reports/uploads/${report.attachment}`,
        "_blank"
      );
      return;
    }

    alert("Report file not found.");
  };

  const generateReport = () => {
    setGenerated(true);
  };

  const printReport = () => {
    if (!generated) {
      alert(
        "Generate the report first."
      );
      return;
    }

    window.print();
  };

  const downloadPDF = async () => {
    const report =
      document.getElementById(
        "report-document"
      );

    if (!report) {
      alert(
        "Generate the report first."
      );
      return;
    }

    try {
      setIsGeneratingPDF(true);

      const canvas =
        await html2canvas(report, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          allowTaint: false,
        });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const usableWidth =
        pageWidth - margin * 2;
      const usableHeight =
        pageHeight - margin * 2;

      const pixelsPerMM =
        canvas.width /
        usableWidth;

      const pageHeightPixels =
        Math.floor(
          usableHeight *
            pixelsPerMM
        );

      let currentY = 0;
      let pageNumber = 0;

      while (
        currentY < canvas.height
      ) {
        const remainingHeight =
          canvas.height -
          currentY;

        const currentPageHeight =
          Math.min(
            pageHeightPixels,
            remainingHeight
          );

        const pageCanvas =
          document.createElement(
            "canvas"
          );

        pageCanvas.width =
          canvas.width;

        pageCanvas.height =
          currentPageHeight;

        const context =
          pageCanvas.getContext(
            "2d"
          );

        if (!context) {
          throw new Error(
            "Could not create PDF canvas."
          );
        }

        context.fillStyle =
          "#ffffff";

        context.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        context.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          currentPageHeight,
          0,
          0,
          canvas.width,
          currentPageHeight
        );

        const pageImage =
          pageCanvas.toDataURL(
            "image/jpeg",
            0.95
          );

        const imageHeight =
          currentPageHeight /
          pixelsPerMM;

        if (pageNumber > 0) {
          pdf.addPage(
            "a4",
            "portrait"
          );
        }

        pdf.addImage(
          pageImage,
          "JPEG",
          margin,
          margin,
          usableWidth,
          imageHeight,
          undefined,
          "FAST"
        );

        currentY +=
          currentPageHeight;

        pageNumber++;
      }

      const safeReportName =
        reportType
          .replace(/\s+/g, "_")
          .toLowerCase();

      const safeYear =
        academicYear.replace(
          /\//g,
          "_"
        );

      pdf.save(
        `${safeReportName}_${safeYear}.pdf`
      );
    } catch (err) {
      console.error(
        "PDF generation failed:",
        err
      );

      alert(
        "Failed to generate PDF. Please try again."
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportCSV = () => {
    if (
      reportRows.length === 0
    ) {
      alert(
        "No data available to export."
      );
      return;
    }

    const headers = [
      "ID",
      "Student ID",
      "Student / Organization",
      "Programme / Type",
      "Organization",
      "Date",
      "Status",
    ];

    const rows =
      reportRows.map(
        (item) => [
          item.id,
          item.studentId,
          item.student,
          item.programme,
          item.organization,
          item.date,
          getStatusLabel(
            item.status
          ),
        ]
      );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${reportType
        .replace(/\s+/g, "_")
        .toLowerCase()}_${academicYear.replace(
        /\//g,
        "_"
      )}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  };

  const total =
    reportRows.length;

  const approved =
    reportRows.filter(
      (item) =>
        String(
          item.status
        ).toUpperCase() ===
        "APPROVED"
    ).length;

  const pending =
    reportRows.filter(
      (item) =>
        String(
          item.status
        ).toUpperCase() ===
        "PENDING"
    ).length;

  const rejected =
    reportRows.filter(
      (item) =>
        String(
          item.status
        ).toUpperCase() ===
        "REJECTED"
    ).length;

  const renderReportTable =
    () => {
      if (
        reportType ===
        "Field Report"
      ) {
        return (
          <>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student ID</th>
                <th>Student</th>
                <th>Programme</th>
                <th>Organization</th>
                <th>Title</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {item.id}
                    </td>

                    <td>
                      {
                        item.studentId
                      }
                    </td>

                    <td>
                      {item.student}
                    </td>

                    <td>
                      {
                        item.programme
                      }
                    </td>

                    <td>
                      {
                        item.organization
                      }
                    </td>

                    <td>
                      {item.title}
                    </td>

                    <td>
                      {item.date}
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(
                          item.status
                        )}
                      </span>
                    </td>

                    <td>
                      <div className="report-table-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            const report =
                              reports.find(
                                (
                                  itemReport
                                ) =>
                                  Number(
                                    itemReport.id
                                  ) ===
                                  Number(
                                    item.id
                                  )
                              );

                            setSelectedReport(
                              report
                            );

                            setFeedback(
                              report?.feedback ||
                                ""
                            );
                          }}
                        >
                          Review
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            const report =
                              reports.find(
                                (
                                  itemReport
                                ) =>
                                  Number(
                                    itemReport.id
                                  ) ===
                                  Number(
                                    item.id
                                  )
                              );

                            openReportFile(
                              report
                            );
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </>
        );
      }

      if (
        reportType ===
        "Placement Report"
      ) {
        return (
          <>
            <thead>
              <tr>
                <th>
                  Placement ID
                </th>
                <th>
                  Student ID
                </th>
                <th>Student</th>
                <th>Programme</th>
                <th>
                  Organization
                </th>
                <th>
                  Start Date
                </th>
                <th>
                  End Date
                </th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {item.id}
                    </td>

                    <td>
                      {
                        item.studentId
                      }
                    </td>

                    <td>
                      {item.student}
                    </td>

                    <td>
                      {
                        item.programme
                      }
                    </td>

                    <td>
                      {
                        item.organization
                      }
                    </td>

                    <td>
                      {
                        item.startDate
                      }
                    </td>

                    <td>
                      {
                        item.endDate
                      }
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(
                          item.status
                        )}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </>
        );
      }

      if (
        reportType ===
          "Attendance Report" ||
        reportType ===
          "Daily Logbook Report"
      ) {
        return (
          <>
            <thead>
              <tr>
                <th>ID</th>
                <th>
                  Student ID
                </th>
                <th>Student</th>
                <th>Programme</th>
                <th>
                  Organization
                </th>
                <th>Date</th>

                {reportType ===
                  "Daily Logbook Report" && (
                  <th>Activity</th>
                )}

                <th>Sign In</th>
                <th>Sign Out</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {item.id}
                    </td>

                    <td>
                      {
                        item.studentId
                      }
                    </td>

                    <td>
                      {item.student}
                    </td>

                    <td>
                      {
                        item.programme
                      }
                    </td>

                    <td>
                      {
                        item.organization
                      }
                    </td>

                    <td>
                      {item.date}
                    </td>

                    {reportType ===
                      "Daily Logbook Report" && (
                      <td>
                        {
                          item.activity
                        }
                      </td>
                    )}

                    <td>
                      {
                        item.signIn
                      }
                    </td>

                    <td>
                      {
                        item.signOut
                      }
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(
                          item.status
                        )}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </>
        );
      }

      if (
        reportType ===
        "Supervisor Report"
      ) {
        return (
          <>
            <thead>
              <tr>
                <th>
                  Supervisor ID
                </th>
                <th>Name</th>
                <th>Role</th>
                <th>Programme</th>
                <th>
                  Evaluations
                </th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {
                        item.studentId
                      }
                    </td>

                    <td>
                      {item.student}
                    </td>

                    <td>
                      {item.role}
                    </td>

                    <td>
                      {
                        item.programme
                      }
                    </td>

                    <td>
                      {
                        item.evaluations
                      }
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(
                          item.status
                        )}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </>
        );
      }

      if (
        reportType ===
        "Organization Report"
      ) {
        return (
          <>
            <thead>
              <tr>
                <th>
                  Organization Code
                </th>
                <th>
                  Organization
                </th>
                <th>Type</th>
                <th>
                  Contact Person
                </th>
                <th>
                  Positions
                </th>
                <th>
                  Active Students
                </th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {item.id}
                    </td>

                    <td>
                      {item.student}
                    </td>

                    <td>
                      {
                        item.programme
                      }
                    </td>

                    <td>
                      {item.contact}
                    </td>

                    <td>
                      {
                        item.positions
                      }
                    </td>

                    <td>
                      {
                        item.activeStudents
                      }
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(
                          item.status
                        )}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </>
        );
      }

      if (
        reportType ===
        "Final Assessment Report"
      ) {
        return (
          <>
            <thead>
              <tr>
                <th>
                  Student ID
                </th>
                <th>Student</th>
                <th>Programme</th>
                <th>
                  Organization
                </th>
                <th>
                  Attendance
                </th>
                <th>
                  Discipline
                </th>
                <th>Skills</th>
                <th>
                  Teamwork
                </th>
                <th>Overall</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {
                        item.studentId
                      }
                    </td>

                    <td>
                      {item.student}
                    </td>

                    <td>
                      {
                        item.programme
                      }
                    </td>

                    <td>
                      {
                        item.organization
                      }
                    </td>

                    <td>
                      {
                        item.attendance
                      }
                    </td>

                    <td>
                      {
                        item.discipline
                      }
                    </td>

                    <td>
                      {item.skills}
                    </td>

                    <td>
                      {
                        item.teamwork
                      }
                    </td>

                    <td>
                      {item.overall}
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(
                          item.status
                        )}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </>
        );
      }

      if (
        reportType ===
        "Complete Student Report"
      ) {
        return (
          <>
            <thead>
              <tr>
                <th>
                  Student ID
                </th>
                <th>Student</th>
                <th>Programme</th>
                <th>
                  Organization
                </th>
                <th>Logs</th>
                <th>Reports</th>
                <th>Overall</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {
                        item.studentId
                      }
                    </td>

                    <td>
                      {item.student}
                    </td>

                    <td>
                      {
                        item.programme
                      }
                    </td>

                    <td>
                      {
                        item.organization
                      }
                    </td>

                    <td>
                      {item.logs}
                    </td>

                    <td>
                      {item.reports}
                    </td>

                    <td>
                      {item.overall}
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(
                          item.status
                        )}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </>
        );
      }

      return (
        <>
          <thead>
            <tr>
              <th>ID</th>
              <th>
                Student ID
              </th>
              <th>
                Student Name
              </th>
              <th>Programme</th>
              <th>
                Organization
              </th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {reportRows.map(
              (item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>

                  <td>
                    {item.studentId}
                  </td>

                  <td>
                    {item.student}
                  </td>

                  <td>
                    {item.programme}
                  </td>

                  <td>
                    {
                      item.organization
                    }
                  </td>

                  <td>
                    {item.date}
                  </td>

                  <td>
                    <span
                      className={`report-status ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(
                        item.status
                      )}
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </>
      );
    };

  return (
    <div className="dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .reports-page {
          background: #f4f7fb;
          min-height: calc(100vh - 80px);
          font-family: Inter, Poppins, Arial, sans-serif;
        }

        .sidebar {
          width: 250px;
          min-height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: #2563eb;
          border-right: 1px solid #e2e8f0;
          box-shadow: 4px 0 18px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .sidebar-header {
          padding: 25px 20px;
          text-align: center;
          border-bottom: 1px solid #eef2f7;
        }

        .dashboard-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 10px;
        }

        .sidebar-header h5 {
          color: #00060f;
          margin-bottom: 3px;
        }

        .sidebar-header small {
          color: #f4f7fa !important;
        }

        .sidebar-menu {
          padding: 18px 12px;
          flex: 1;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #475569;
          padding: 12px 15px;
          margin-bottom: 6px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: #eff6ff;
          color: #2563eb;
          transform: translateX(2px);
        }

        .sidebar-link.active {
          background: #636fce;
          color: #ffffff;
          box-shadow: 0 5px 14px rgba(37, 99, 235, 0.22);
        }

        .sidebar-footer {
          padding: 15px 12px;
          border-top: 1px solid #eef2f7;
        }

        .sidebar-footer .sidebar-link {
          color: #dc2626;
        }

        .sidebar-footer .sidebar-link:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .dashboard-content {
          margin-left: 250px;
          min-height: 100vh;
          background: #f4f7fb;
        }

        .dashboard-navbar {
          min-height: 78px;
          padding: 15px 28px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-shadow: 0 5px 18px rgba(37, 99, 235, 0.18);
        }

        .dashboard-navbar h5 {
          color: #ffffff;
          font-size: 18px;
        }

        .dashboard-navbar small {
          color: rgba(255,255,255,0.78) !important;
        }

        .dashboard-navbar .dashboard-logo {
          width: 40px;
          height: 40px;
          border-radius: 9px;
          background: #ffffff;
          padding: 3px;
        }

        .reports-header {
          margin-bottom: 25px;
        }

        .reports-header h2 {
          color: #0f172a;
          font-size: 28px;
          font-weight: 750;
          margin-bottom: 6px;
        }

        .reports-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
          height: 100%;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.05);
          transition: all 0.25s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
        }

        .stat-card small {
          color: #64748b !important;
          font-size: 13px;
          font-weight: 600;
        }

        .stat-number {
          color: #2563eb;
          font-size: 30px;
          font-weight: 750;
          line-height: 1.1;
        }

        .stat-card p {
          color: #64748b;
          font-size: 13px;
          margin-top: 7px;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.05);
        }

        .report-section-title {
          margin-bottom: 24px;
        }

        .report-section-title h5 {
          color: #0f172a;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .report-section-title p {
          color: #64748b;
          margin: 0;
          font-size: 14px;
        }

        .form-label {
          color: #334155;
          font-size: 13px;
          font-weight: 650;
          margin-bottom: 7px;
        }

        .form-control,
        .form-select {
          min-height: 44px;
          border: 1px solid #dbe3ee;
          border-radius: 10px;
          color: #334155;
          font-size: 14px;
          background-color: #ffffff;
          box-shadow: none;
          transition: all 0.2s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        .report-generate-button {
          margin-top: 24px;
        }

        .btn {
          border-radius: 10px !important;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 17px;
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn-primary {
          background: #2563eb !important;
          border-color: #2563eb !important;
        }

        .btn-primary:hover {
          background: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
        }

        .report-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e2e8f0;
        }

        .report-toolbar h5 {
          color: #0f172a;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 5px;
        }

        .report-toolbar p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .report-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .report-actions .btn-outline-secondary {
          color: #475569;
          border-color: #cbd5e1;
        }

        .report-actions .btn-outline-secondary:hover {
          background: #f1f5f9;
        }

        .report-actions .btn-outline-danger {
          color: #dc2626;
          border-color: #fecaca;
        }

        .report-actions .btn-outline-danger:hover {
          background: #fef2f2;
        }

        .report-actions .btn-outline-primary {
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .report-actions .btn-outline-primary:hover {
          background: #eff6ff;
        }

        .report-document-wrapper {
          background: #eef2f7;
          border-radius: 14px;
          padding: 25px;
          overflow-x: auto;
        }

        .report-document {
          width: 190mm;
          min-height: 277mm;
          margin: 0 auto;
          padding: 10mm;
          background: #ffffff;
          box-sizing: border-box;
          color: #000000;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.10);
        }

        .report-document-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .report-logo {
          width: 90px;
          height: auto;
          object-fit: contain;
          margin-bottom: 10px;
        }

        .report-document-header h1 {
          color: #111827;
          font-size: 22px;
          font-weight: 750;
          line-height: 1.3;
          margin: 5px 0;
        }

        .report-document-header h2 {
          color: #1f2937;
          font-size: 18px;
          font-weight: 700;
          margin: 15px 0 5px;
        }

        .report-document-header p {
          margin: 0;
          font-size: 13px;
          color: #374151;
        }

        .report-info {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 20px;
          font-size: 12px;
          background: #f8fafc;
        }

        .report-info strong {
          color: #111827;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          color: #000000;
        }

        .report-table th,
        .report-table td {
          border: 1px solid #334155 !important;
          padding: 7px !important;
          vertical-align: middle;
        }

        .report-table th {
          background: #e2e8f0 !important;
          color: #111827 !important;
          font-weight: 700;
        }

        .report-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }

        .report-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 700;
        }

        .report-status.approved {
          background: #dcfce7;
          color: #166534;
        }

        .report-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .report-status.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .report-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 25px;
          padding-top: 15px;
          border-top: 2px solid #334155;
        }

        .report-summary > div {
          border: 1px solid #94a3b8;
          border-radius: 5px;
          padding: 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: #f8fafc;
        }

        .report-summary strong {
          color: #334155;
          font-size: 11px;
        }

        .report-summary span {
          color: #111827;
          font-size: 18px;
          font-weight: 750;
        }

        .report-footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #94a3b8;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          font-size: 10px;
          color: #374151;
        }

        .report-footer p {
          margin: 0;
        }

        .reports-error {
          margin-bottom: 20px;
          padding: 12px 15px;
          border-radius: 10px;
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .report-table-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .review-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.58);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 20px;
        }

        .review-modal {
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
        }

        .review-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .review-modal-header h4 {
          margin: 0 0 5px;
          color: #0f172a;
          font-weight: 750;
        }

        .review-modal-header small {
          color: #64748b;
        }

        .review-close {
          border: 0;
          background: transparent;
          font-size: 25px;
          line-height: 1;
          color: #64748b;
          cursor: pointer;
        }

        .review-info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 18px;
        }

        .review-info-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 10px;
          padding: 7px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }

        .review-info-row:last-child {
          border-bottom: 0;
        }

        .review-info-label {
          font-weight: 700;
          color: #334155;
        }

        .review-info-value {
          color: #64748b;
        }

        .review-description {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 18px;
          color: #475569;
          font-size: 14px;
          line-height: 1.6;
        }

        .review-description strong {
          display: block;
          color: #334155;
          margin-bottom: 8px;
        }

        .review-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 1100px) {
          .sidebar {
            width: 220px;
          }

          .dashboard-content {
            margin-left: 220px;
          }

          .dashboard-navbar {
            padding: 15px 20px;
          }
        }

        @media (max-width: 992px) {
          .report-toolbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .report-document-wrapper {
            padding: 15px;
          }

          .report-document {
            width: 100%;
            min-height: auto;
            padding: 25px;
          }

          .report-info {
            grid-template-columns: 1fr;
          }

          .report-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 190px;
          }

          .dashboard-content {
            margin-left: 190px;
          }

          .sidebar-header {
            padding: 20px 10px;
          }

          .sidebar-link {
            font-size: 13px;
            padding: 10px 11px;
          }

          .dashboard-navbar {
            min-height: 70px;
          }

          .dashboard-navbar .dashboard-logo {
            display: none;
          }

          .reports-page {
            padding: 18px !important;
          }

          .dashboard-card {
            padding: 18px;
          }

          .review-info-row {
            grid-template-columns: 1fr;
            gap: 3px;
          }
        }

        @media (max-width: 576px) {
          .sidebar {
            width: 70px;
          }

          .dashboard-content {
            margin-left: 70px;
          }

          .sidebar-header h5,
          .sidebar-header small,
          .sidebar-link {
            font-size: 0;
          }

          .sidebar-link {
            justify-content: center;
            padding: 13px 5px;
          }

          .sidebar-header {
            padding: 18px 5px;
          }

          .dashboard-navbar {
            padding: 12px 15px;
          }

          .dashboard-navbar h5 {
            font-size: 15px;
          }

          .dashboard-navbar small {
            font-size: 10px;
          }

          .reports-header h2 {
            font-size: 24px;
          }

          .report-actions {
            width: 100%;
          }

          .report-actions button {
            width: 100%;
          }

          .report-summary {
            grid-template-columns: 1fr;
          }

          .report-document {
            padding: 18px;
          }

          .report-document-header h1 {
            font-size: 18px;
          }

          .report-document-header h2 {
            font-size: 16px;
          }

          .report-footer {
            flex-direction: column;
          }

          .review-modal {
            padding: 18px;
          }

          .review-modal-footer {
            flex-direction: column;
          }

          .review-modal-footer button {
            width: 100%;
          }

          .report-table-actions {
            flex-direction: column;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          html,
          body {
            width: 210mm;
            margin: 0;
            padding: 0;
            background: #ffffff !important;
          }

          body * {
            visibility: hidden;
          }

          #report-document,
          #report-document * {
            visibility: visible;
          }

          #report-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 190mm;
            min-height: 277mm;
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .report-document-wrapper {
            padding: 0 !important;
            background: #ffffff !important;
          }

          .report-table {
            width: 100%;
          }

          .report-table thead {
            display: table-header-group;
          }

          .report-document-header {
            page-break-after: avoid;
          }

          .report-info {
            page-break-inside: avoid;
          }

          .report-summary {
            page-break-inside: avoid;
          }

          .report-footer {
            page-break-inside: avoid;
          }
        }
      `}</style>

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
            Admin / Coordinator
          </small>
        </div>

        <nav className="sidebar-menu">
          <Link
            to="/admin/dashboard"
            className="sidebar-link"
          >
            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="sidebar-link"
          >
            <span>Users</span>
          </Link>

          <Link
            to="/admin/applications"
            className="sidebar-link"
          >
            <span>
              Applications
            </span>
          </Link>

          <Link
            to="/admin/organizations"
            className="sidebar-link"
          >
            <span>
              Organizations
            </span>
          </Link>

          <Link
            to="/admin/supervisors"
            className="sidebar-link"
          >
            <span>
              Supervisors
            </span>
          </Link>

          <Link
            to="/admin/reports"
            className="sidebar-link active"
          >
            <span>Reports</span>
          </Link>

          <Link
            to="/admin/settings"
            className="sidebar-link"
          >
            <span>
              System Settings
            </span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/login"
            className="sidebar-link text-danger"
          >
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <div className="dashboard-content">
        <div className="dashboard-navbar">
          <div>
            <h5 className="mb-0 fw-bold">
              Reports
            </h5>

            <small className="text-muted">
              Student Field Placement Management System
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <img
              src="/image/egaz-logo.jpg"
              alt="E-GAZ"
              className="dashboard-logo"
            />

            <span className="fw-semibold">
              Welcome, Administrator
            </span>
          </div>
        </div>

        <div className="container-fluid p-4 reports-page">
          <div className="reports-header">
            <h2>
              Reports
            </h2>

            <p>
              Generate and view student field placement reports.
            </p>
          </div>

          {error && (
            <div className="reports-error">
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
                  {students.length}
                </div>

                <p className="mb-0">
                  Registered students
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card h-100">
                <small className="text-muted">
                  Active Placements
                </small>

                <div className="stat-number text-success mt-2">
                  {
                    placements.filter(
                      (item) =>
                        item.status ===
                        "ACTIVE"
                    ).length
                  }
                </div>

                <p className="mb-0">
                  Students on placement
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card h-100">
                <small className="text-muted">
                  Applications
                </small>

                <div className="stat-number mt-2">
                  {
                    applications.length
                  }
                </div>

                <p className="mb-0">
                  Total applications
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card h-100">
                <small className="text-muted">
                  Pending Applications
                </small>

                <div className="stat-number text-warning mt-2">
                  {
                    applications.filter(
                      (item) =>
                        item.status ===
                        "PENDING"
                    ).length
                  }
                </div>

                <p className="mb-0">
                  Waiting for review
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-card mb-4">
            <div className="report-section-title">
              <h5>
                Generate Report
              </h5>

              <p>
                Select the required filters and generate your report.
              </p>
            </div>

            <div className="row g-3">
              <div className="col-lg-4 col-md-6">
                <label className="form-label">
                  Report Type
                </label>

                <select
                  className="form-select"
                  value={reportType}
                  onChange={(e) => {
                    setReportType(
                      e.target.value
                    );
                    setGenerated(
                      false
                    );
                  }}
                >
                  <option>
                    Student Report
                  </option>

                  <option>
                    Application Report
                  </option>

                  <option>
                    Placement Report
                  </option>

                  <option>
                    Attendance Report
                  </option>

                  <option>
                    Daily Logbook Report
                  </option>

                  <option>
                    Field Report
                  </option>

                  <option>
                    Supervisor Report
                  </option>

                  <option>
                    Organization Report
                  </option>

                  <option>
                    Final Assessment Report
                  </option>

                  <option>
                    Complete Student Report
                  </option>
                </select>
              </div>

              <div className="col-lg-4 col-md-6">
                <label className="form-label">
                  Academic Year
                </label>

                <select
                  className="form-select"
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(
                      e.target.value
                    );
                    setGenerated(
                      false
                    );
                  }}
                >
                  <option>
                    2026/2027
                  </option>

                  <option>
                    2025/2026
                  </option>

                  <option>
                    2024/2025
                  </option>
                </select>
              </div>

              <div className="col-lg-4 col-md-6">
                <label className="form-label">
                  Programme
                </label>

                <select
                  className="form-select"
                  value={programme}
                  onChange={(e) => {
                    setProgramme(
                      e.target.value
                    );
                    setGenerated(
                      false
                    );
                  }}
                >
                  <option>
                    All Programmes
                  </option>

                  {[
                    ...new Set(
                      [
                        ...students.map(
                          (student) =>
                            student.programme
                        ),
                        ...applications.map(
                          (application) =>
                            application.programme
                        ),
                      ].filter(Boolean)
                    ),
                  ].map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-4 col-md-6">
                <label className="form-label">
                  Organization
                </label>

                <select
                  className="form-select"
                  value={organization}
                  onChange={(e) => {
                    setOrganization(
                      e.target.value
                    );
                    setGenerated(
                      false
                    );
                  }}
                >
                  <option>
                    All Organizations
                  </option>

                  {organizations.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="col-lg-4 col-md-6">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => {
                    setStatus(
                      e.target.value
                    );
                    setGenerated(
                      false
                    );
                  }}
                >
                  <option>
                    All Status
                  </option>

                  <option>
                    Approved
                  </option>

                  <option>
                    Under Review
                  </option>

                  <option>
                    Pending
                  </option>

                  <option>
                    Rejected
                  </option>

                  <option>
                    Active
                  </option>

                  <option>
                    Inactive
                  </option>

                  <option>
                    Completed
                  </option>
                </select>
              </div>

              <div className="col-lg-2 col-md-6">
                <label className="form-label">
                  From Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(
                      e.target.value
                    );
                    setGenerated(
                      false
                    );
                  }}
                />
              </div>

              <div className="col-lg-2 col-md-6">
                <label className="form-label">
                  To Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(
                      e.target.value
                    );
                    setGenerated(
                      false
                    );
                  }}
                />
              </div>
            </div>

            <div className="report-generate-button">
              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  generateReport
                }
                disabled={loading}
              >
                {loading
                  ? "Loading Data..."
                  : "Generate Report"}
              </button>
            </div>
          </div>

          {generated && (
            <div className="dashboard-card mb-4">
              <div className="report-toolbar">
                <div>
                  <h5>
                    Report Preview
                  </h5>

                  <p>
                    {reportType} —{" "}
                    {academicYear}
                  </p>
                </div>

                <div className="report-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      printReport
                    }
                  >
                    Print
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={
                      downloadPDF
                    }
                    disabled={
                      isGeneratingPDF
                    }
                  >
                    {isGeneratingPDF
                      ? "Generating PDF..."
                      : "Download PDF"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={
                      exportCSV
                    }
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="report-document-wrapper">
                <div
                  id="report-document"
                  className="report-document"
                >
                  <div className="report-document-header">
                    <img
                      src="/image/egaz-logo.jpg"
                      alt="E-GAZ"
                      className="report-logo"
                    />

                    <h1>
                      STUDENT FIELD PLACEMENT
                      <br />
                      MANAGEMENT SYSTEM
                    </h1>

                    <h2>
                      {reportType}
                    </h2>

                    <p>
                      Academic Year:{" "}
                      {
                        academicYear
                      }
                    </p>
                  </div>

                  <div className="report-info">
                    <div>
                      <strong>
                        Programme:
                      </strong>{" "}
                      {programme}
                    </div>

                    <div>
                      <strong>
                        Organization:
                      </strong>{" "}
                      {
                        organization
                      }
                    </div>

                    <div>
                      <strong>
                        Status:
                      </strong>{" "}
                      {status}
                    </div>

                    <div>
                      <strong>
                        Date Range:
                      </strong>{" "}
                      {fromDate ||
                        "All"}{" "}
                      -{" "}
                      {toDate ||
                        "All"}
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table report-table">
                      {reportRows.length >
                      0 ? (
                        renderReportTable()
                      ) : (
                        <>
                          <thead>
                            <tr>
                              <th>
                                Report Data
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr>
                              <td className="text-center">
                                No records found.
                              </td>
                            </tr>
                          </tbody>
                        </>
                      )}
                    </table>
                  </div>

                  <div className="report-summary">
                    <div>
                      <strong>
                        Total
                      </strong>

                      <span>
                        {total}
                      </span>
                    </div>

                    <div>
                      <strong>
                        Approved
                      </strong>

                      <span>
                        {approved}
                      </span>
                    </div>

                    <div>
                      <strong>
                        Pending
                      </strong>

                      <span>
                        {pending}
                      </span>
                    </div>

                    <div>
                      <strong>
                        Rejected
                      </strong>

                      <span>
                        {rejected}
                      </span>
                    </div>
                  </div>

                  <div className="report-footer">
                    <p>
                      Generated by SFPMS Administrator
                    </p>

                    <p>
                      Generated Date:{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="review-overlay">
          <div className="review-modal">
            <div className="review-modal-header">
              <div>
                <h4>
                  Review Report
                </h4>

                <small>
                  {
                    selectedReport.title
                  }
                </small>
              </div>

              <button
                type="button"
                className="review-close"
                onClick={() => {
                  setSelectedReport(
                    null
                  );
                  setFeedback("");
                }}
              >
                ×
              </button>
            </div>

            <div className="review-info-card">
              <div className="review-info-row">
                <div className="review-info-label">
                  Student
                </div>

                <div className="review-info-value">
                  {getStudentName(
                    selectedReport.student_id
                  )}
                </div>
              </div>

              <div className="review-info-row">
                <div className="review-info-label">
                  Student ID
                </div>

                <div className="review-info-value">
                  {getStudent(
                    selectedReport.student_id
                  )?.institutional_id ||
                    selectedReport.student_id}
                </div>
              </div>

              <div className="review-info-row">
                <div className="review-info-label">
                  Programme
                </div>

                <div className="review-info-value">
                  {(() => {
                    const placement =
                      getPlacement(
                        selectedReport.placement_id
                      );

                    const application =
                      placement
                        ? getApplication(
                            placement.application_id
                          )
                        : null;

                    return getProgramme(
                      selectedReport.student_id,
                      application
                    );
                  })()}
                </div>
              </div>

              <div className="review-info-row">
                <div className="review-info-label">
                  Status
                </div>

                <div className="review-info-value">
                  <span
                    className={`report-status ${getStatusClass(
                      selectedReport.status
                    )}`}
                  >
                    {getStatusLabel(
                      selectedReport.status
                    )}
                  </span>
                </div>
              </div>

              <div className="review-info-row">
                <div className="review-info-label">
                  Submitted
                </div>

                <div className="review-info-value">
                  {selectedReport.submitted_at
                    ? String(
                        selectedReport.submitted_at
                      ).slice(0, 10)
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="review-description">
              <strong>
                Description
              </strong>

              {selectedReport.description ||
                "No description provided."}
            </div>

            <div className="mb-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() =>
                  openReportFile(
                    selectedReport
                  )
                }
              >
                View Report File
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Feedback
              </label>

              <textarea
                className="form-control"
                rows="5"
                value={feedback}
                onChange={(e) =>
                  setFeedback(
                    e.target.value
                  )
                }
                placeholder="Enter feedback for the student..."
              />
            </div>

            <div className="review-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={
                  reviewLoading
                }
                onClick={() => {
                  setSelectedReport(
                    null
                  );
                  setFeedback("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-danger"
                disabled={
                  reviewLoading
                }
                onClick={() =>
                  reviewReport(
                    selectedReport.id,
                    "REJECTED"
                  )
                }
              >
                {reviewLoading
                  ? "Processing..."
                  : "Reject"}
              </button>

              <button
                type="button"
                className="btn btn-success"
                disabled={
                  reviewLoading
                }
                onClick={() =>
                  reviewReport(
                    selectedReport.id,
                    "APPROVED"
                  )
                }
              >
                {reviewLoading
                  ? "Processing..."
                  : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;


