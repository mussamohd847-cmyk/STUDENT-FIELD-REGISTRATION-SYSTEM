import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useSidebar } from "../../components/useSidebar";

const API_URL = "http://localhost:5000/api";

const TABS = [
  "ATTENDANCE",
  "DAILY LOGBOOK",
  "WEEKLY SUMMARY",
  "FINAL REPORT",
  "EVALUATION REPORT",
];

function getLocalDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getCurrentTime() {
  const now = new Date();

  return [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join(":");
}

function isAfterSixPM() {
  return new Date().getHours() >= 18;
}

function getSubmissionDate() {
  const now = new Date();

  if (now.getHours() >= 18) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDate(tomorrow);
  }

  return getLocalDate(now);
}

function getSecondsUntilSixPM() {
  const now = new Date();

  if (now.getHours() >= 18) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);

    return Math.max(
      0,
      Math.floor(
        (tomorrow.getTime() - now.getTime()) / 1000
      )
    );
  }

  const target = new Date(now);
  target.setHours(18, 0, 0, 0);

  return Math.max(
    0,
    Math.floor(
      (target.getTime() - now.getTime()) / 1000
    )
  );
}

function formatCountdown(seconds) {
  if (!seconds || seconds <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(remainingSeconds).padStart(
    2,
    "0"
  )}`;
}

function getWeekStart(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  current.setDate(current.getDate() + difference);

  return getLocalDate(current);
}

function normalizeLogs(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.logs)) {
    return data.logs;
  }

  if (data?.log) {
    return [data.log];
  }

  if (data?.daily_log) {
    return [data.daily_log];
  }

  return [];
}

function DailyLogbook() {
  const { toggleSidebar } = useSidebar();

  const [user, setUser] = useState(null);
  const [placement, setPlacement] = useState(null);

  const [dailyLog, setDailyLog] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [openAttendanceLog, setOpenAttendanceLog] = useState(null);

  const [signInTime, setSignInTime] = useState("");
  const [signOutTime, setSignOutTime] = useState("");
  const [activity, setActivity] = useState("");

  const [weeklySummary, setWeeklySummary] = useState("");
  const [weeklySummaryLocked, setWeeklySummaryLocked] =
    useState(false);

  const [attendanceLocked, setAttendanceLocked] =
    useState(false);
  const [activityLocked, setActivityLocked] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("ATTENDANCE");
  const [showActivityForm, setShowActivityForm] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [savingActivity, setSavingActivity] =
    useState(false);
  const [savingWeeklySummary, setSavingWeeklySummary] =
    useState(false);

  const [secondsUntilSixPM, setSecondsUntilSixPM] =
    useState(getSecondsUntilSixPM());

  const [timeReady, setTimeReady] =
    useState(isAfterSixPM());

  useEffect(() => {
    const timer = setInterval(() => {
      const nextTimeReady = isAfterSixPM();

      setSecondsUntilSixPM(
        getSecondsUntilSixPM()
      );

      setTimeReady(nextTimeReady);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("sfpms_user");

    const storedStudent =
      localStorage.getItem("sfpms_student");

    try {
      const currentUser = storedUser
        ? JSON.parse(storedUser)
        : storedStudent
        ? JSON.parse(storedStudent)
        : null;

      setUser(currentUser);

      if (currentUser?.id) {
        loadPlacement(currentUser.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  const loadPlacement = async (studentId) => {
    try {
      const response = await fetch(
        `${API_URL}/placements/?student_id=${studentId}&status=ACTIVE`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load placement"
        );
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const activePlacement = data[0];

        setPlacement(activePlacement);

        await Promise.all([
          loadDailyLogs(
            studentId,
            activePlacement.id
          ),
          loadWeeklySummary(
            studentId,
            activePlacement.id
          ),
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyLogs = async (
    studentId,
    placementId
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/daily-logs/?student_id=${studentId}&placement_id=${placementId}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const logs = normalizeLogs(data);

      const uniqueLogs = Array.from(
        new Map(
          logs
            .filter((log) => log?.id)
            .map((log) => [log.id, log])
        ).values()
      );

      setDailyLogs(uniqueLogs);

      const submissionDate =
        getSubmissionDate();

      const currentCycleLog =
        uniqueLogs
          .filter(
            (log) =>
              log.log_date ===
              submissionDate
          )
          .sort(
            (a, b) =>
              Number(b.id || 0) -
              Number(a.id || 0)
          )[0] || null;

      const openLog =
        [...uniqueLogs]
          .filter(
            (log) =>
              log?.sign_in_time &&
              !log?.sign_out_time
          )
          .sort(
            (a, b) =>
              Number(b.id || 0) -
              Number(a.id || 0)
          )[0] || null;

      setDailyLog(currentCycleLog);
      setOpenAttendanceLog(openLog);

      if (currentCycleLog) {
        setSignInTime(
          currentCycleLog.sign_in_time || ""
        );

        setSignOutTime(
          currentCycleLog.sign_out_time || ""
        );

        setActivity(
          currentCycleLog.activity || ""
        );

        const hasActivity = Boolean(
          currentCycleLog.activity &&
            String(
              currentCycleLog.activity
            ).trim()
        );

        setActivityLocked(hasActivity);

        setShowActivityForm(
          Boolean(
            currentCycleLog.sign_in_time &&
              !hasActivity
          )
        );

        setAttendanceLocked(
          Boolean(
            currentCycleLog.sign_in_time &&
              currentCycleLog.sign_out_time
          )
        );
      } else {
        setSignInTime("");
        setSignOutTime("");
        setActivity("");

        setActivityLocked(false);
        setShowActivityForm(false);
        setAttendanceLocked(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadWeeklySummary = async (
    studentId,
    placementId
  ) => {
    try {
      const weekStart = getWeekStart();

      const response = await fetch(
        `${API_URL}/daily-logs/weekly-summary?student_id=${studentId}&placement_id=${placementId}&week_start=${weekStart}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data?.summary) {
        setWeeklySummary(
          data.summary.summary || ""
        );

        setWeeklySummaryLocked(
          Boolean(data.locked)
        );
      } else {
        setWeeklySummary("");
        setWeeklySummaryLocked(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user?.id || !placement?.id) {
      return;
    }

    loadDailyLogs(
      user.id,
      placement.id
    );

    loadWeeklySummary(
      user.id,
      placement.id
    );
  }, [timeReady]);

  const handleSignIn = async () => {
    if (openAttendanceLog) {
      alert(
        "You already have an active attendance record. Please Sign Out first."
      );
      return;
    }

    if (signInTime) {
      return;
    }

    if (!user?.id) {
      alert("Student account not found.");
      return;
    }

    if (!placement?.id) {
      alert("Active placement not found.");
      return;
    }

    try {
      setSigningIn(true);

      const time = getCurrentTime();
      const submissionDate =
        getSubmissionDate();

      const formData = new FormData();

      formData.append(
        "student_id",
        String(user.id)
      );

      formData.append(
        "placement_id",
        String(placement.id)
      );

      formData.append(
        "log_date",
        submissionDate
      );

      formData.append(
        "sign_in_time",
        time
      );

      const response = await fetch(
        `${API_URL}/daily-logs/`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to sign in."
        );
      }

      const savedLog =
        data.log ||
        data.daily_log ||
        data;

      setDailyLog(savedLog);
      setOpenAttendanceLog(savedLog);

      setSignInTime(
        savedLog.sign_in_time ||
          time
      );

      setSignOutTime(
        savedLog.sign_out_time ||
          ""
      );

      setActivity(
        savedLog.activity ||
          ""
      );

      setAttendanceLocked(false);

      setActivityLocked(
        Boolean(
          savedLog.activity &&
            String(
              savedLog.activity
            ).trim()
        )
      );

      setShowActivityForm(
        !savedLog.activity
      );

      await loadDailyLogs(
        user.id,
        placement.id
      );

      alert(
        `Signed in successfully for ${submissionDate}.`
      );
    } catch (error) {
      alert(
        error.message ||
          "Failed to sign in."
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    const targetLog =
      openAttendanceLog ||
      dailyLog;

    if (!targetLog?.id) {
      alert(
        "Active attendance record was not found."
      );
      return;
    }

    if (!targetLog.sign_in_time) {
      alert(
        "Please Sign In first."
      );
      return;
    }

    if (targetLog.sign_out_time) {
      return;
    }

    try {
      setSigningOut(true);

      const time = getCurrentTime();

      const response = await fetch(
        `${API_URL}/daily-logs/${targetLog.id}/sign-out`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sign_out_time: time,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to sign out."
        );
      }

      const savedLog =
        data.log ||
        data.daily_log ||
        data;

      setOpenAttendanceLog(null);

      if (
        savedLog.log_date ===
        getSubmissionDate()
      ) {
        setDailyLog(savedLog);

        setSignInTime(
          savedLog.sign_in_time ||
            ""
        );

        setSignOutTime(
          savedLog.sign_out_time ||
            time
        );
      }

      await loadDailyLogs(
        user.id,
        placement.id
      );

      alert(
        "Signed out successfully."
      );
    } catch (error) {
      alert(
        error.message ||
          "Failed to sign out."
      );
    } finally {
      setSigningOut(false);
    }
  };

  const saveActivity = async () => {
    if (!signInTime) {
      alert("Please Sign In first.");
      return;
    }

    if (!dailyLog?.id) {
      alert(
        "Current attendance record was not found."
      );
      return;
    }

    if (activityLocked) {
      alert(
        "Activity has already been submitted for this cycle and cannot be edited."
      );
      return;
    }

    if (!activity.trim()) {
      alert(
        "Please enter today's activity."
      );
      return;
    }

    try {
      setSavingActivity(true);

      const response = await fetch(
        `${API_URL}/daily-logs/${dailyLog.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            activity:
              activity.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save activity."
        );
      }

      const savedLog =
        data.log ||
        data.daily_log ||
        data;

      setDailyLog(savedLog);

      setActivity(
        savedLog.activity ||
          activity.trim()
      );

      setActivityLocked(true);
      setShowActivityForm(false);

      await loadDailyLogs(
        user.id,
        placement.id
      );

      alert(
        "Daily activity submitted successfully. It cannot be edited again during this cycle."
      );
    } catch (error) {
      alert(
        error.message ||
          "Failed to save activity."
      );
    } finally {
      setSavingActivity(false);
    }
  };

  const saveWeeklySummary = async () => {
    if (!user?.id) {
      alert(
        "Student account not found."
      );
      return;
    }

    if (!placement?.id) {
      alert(
        "Active placement not found."
      );
      return;
    }

    if (weeklySummaryLocked) {
      alert(
        "Weekly Summary has already been submitted for this cycle."
      );
      return;
    }

    if (!weeklySummary.trim()) {
      alert(
        "Please enter your weekly summary."
      );
      return;
    }

    try {
      setSavingWeeklySummary(true);

      const response = await fetch(
        `${API_URL}/daily-logs/weekly-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            student_id: user.id,
            placement_id:
              placement.id,
            week_start:
              getWeekStart(),
            summary:
              weeklySummary.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save weekly summary."
        );
      }

      setWeeklySummary(
        data.summary?.summary ||
          weeklySummary.trim()
      );

      setWeeklySummaryLocked(true);

      alert(
        data.message ||
          "Weekly summary submitted successfully. It cannot be submitted again during this cycle."
      );
    } catch (error) {
      alert(
        error.message ||
          "Failed to save weekly summary."
      );
    } finally {
      setSavingWeeklySummary(false);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatShortDate = (value) => {
    if (!value) {
      return "--";
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  const parseTime = (value) => {
    if (!value) {
      return null;
    }

    const match = String(value)
      .trim()
      .match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
      );

    if (!match) {
      return null;
    }

    return (
      Number(match[1]) * 3600 +
      Number(match[2]) * 60 +
      Number(match[3] || 0)
    );
  };

  const calculateDuration = (
    start,
    end
  ) => {
    const first = parseTime(start);
    const second = parseTime(end);

    if (
      first === null ||
      second === null
    ) {
      return "--";
    }

    let difference =
      second - first;

    if (difference < 0) {
      difference += 86400;
    }

    const hours = Math.floor(
      difference / 3600
    );

    const minutes = Math.floor(
      (difference % 3600) / 60
    );

    return `${hours}h ${minutes}m`;
  };

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return "--";
  };

  const organization = useMemo(() => {
    return {
      name: "eGAZ",
      address:
        "P.O. Box 800 Zanzibar, Tanzania",
      email: "info@egaz.go.tz",
      phone:
        "+255 (0) 24 22 35688 / +255 (0) 24 22 35689",
      location:
        "Zanzibar, Tanzania",
      website:
        "www.egaz.go.tz",
    };
  }, []);

  const supervisor = useMemo(() => {
    const supervisorObject =
      placement?.field_supervisor ||
      placement?.fieldSupervisor ||
      placement?.supervisor ||
      null;

    return {
      name: getValue(
        supervisorObject?.name,
        supervisorObject?.full_name,
        supervisorObject?.fullName,
        placement?.field_supervisor_name,
        placement?.fieldSupervisorName,
        placement?.supervisor_name
      ),
    };
  }, [placement]);

  const historyLogs = useMemo(() => {
    return [...dailyLogs].sort(
      (a, b) =>
        new Date(
          `${b.log_date}T00:00:00`
        ) -
          new Date(
            `${a.log_date}T00:00:00`
          ) ||
        Number(b.id || 0) -
          Number(a.id || 0)
    );
  }, [dailyLogs]);

  const submissionDate =
    getSubmissionDate();

  const submissionDateLabel =
    formatDate(submissionDate);

  const attendanceDisplayLog =
    openAttendanceLog ||
    dailyLog;

  const attendanceDisplaySignIn =
    attendanceDisplayLog?.sign_in_time ||
    signInTime;

  const attendanceDisplaySignOut =
    attendanceDisplayLog?.sign_out_time ||
    (!openAttendanceLog
      ? signOutTime
      : "");

  const generateReport = () => {
    const reportWindow =
      window.open("", "_blank");

    if (!reportWindow) {
      alert(
        "Please allow popups to generate the report."
      );
      return;
    }

    const rows = historyLogs
      .map(
        (log) => `
          <tr>
            <td>${log.log_date || "--"}</td>
            <td>${log.sign_in_time || "--"}</td>
            <td>${log.sign_out_time || "--"}</td>
            <td>${calculateDuration(
              log.sign_in_time,
              log.sign_out_time
            )}</td>
            <td>${(
              log.activity || "--"
            ).replace(
              /</g,
              "&lt;"
            )}</td>
          </tr>
        `
      )
      .join("");

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>eGAZ Student Field Training Report</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #172033;
          }

          .organization-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2563eb;
          }

          .organization-header strong {
            display: block;
            font-size: 24px;
            color: #2563eb;
            margin-bottom: 8px;
          }

          .organization-header span {
            display: block;
            font-size: 12px;
            margin-top: 4px;
            color: #475569;
          }

          h1 {
            text-align: center;
            color: #2563eb;
            margin-bottom: 25px;
          }

          h2 {
            margin-top: 25px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 20px 0;
          }

          .box {
            border: 1px solid #ddd;
            padding: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          th,
          td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f1f5f9;
          }

          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>

      <body>

        <div class="organization-header">
          <strong>eGAZ</strong>
          <span>P.O. Box 800 Zanzibar, Tanzania</span>
          <span>
            Tel: +255 (0) 24 22 35688 / +255 (0) 24 22 35689
          </span>
          <span>
            Email: info@egaz.go.tz
          </span>
          <span>
            Website: www.egaz.go.tz
          </span>
        </div>

        <h1>Student Field Training Report</h1>

        <div class="summary">

          <div class="box">
            <strong>Student</strong><br>
            ${getValue(
              user?.name,
              user?.full_name
            )}
          </div>

          <div class="box">
            <strong>Institutional ID</strong><br>
            ${getValue(
              user?.institutional_id
            )}
          </div>

          <div class="box">
            <strong>Organization</strong><br>
            eGAZ
          </div>

          <div class="box">
            <strong>Address</strong><br>
            P.O. Box 800 Zanzibar, Tanzania
          </div>

          <div class="box">
            <strong>Telephone</strong><br>
            +255 (0) 24 22 35688 / +255 (0) 24 22 35689
          </div>

          <div class="box">
            <strong>Email</strong><br>
            info@egaz.go.tz
          </div>

          <div class="box">
            <strong>Website</strong><br>
            www.egaz.go.tz
          </div>

          <div class="box">
            <strong>Field Supervisor</strong><br>
            ${supervisor.name}
          </div>

        </div>

        <h2>Attendance & Daily Logbook</h2>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Sign In</th>
              <th>Sign Out</th>
              <th>Duration</th>
              <th>Activity</th>
            </tr>
          </thead>

          <tbody>
            ${
              rows ||
              `
              <tr>
                <td colspan="5">
                  No daily records available.
                </td>
              </tr>
              `
            }
          </tbody>
        </table>

        <h2>Weekly Summary</h2>

        <p>
          ${
            weeklySummary ||
            "No weekly summary entered."
          }
        </p>

        <h2>Final Report</h2>

        <p>
          Final report section will contain
          the student's final field training report.
        </p>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>

      </body>
      </html>
    `);

    reportWindow.document.close();
  };

  const renderAttendance = () => (
    <>
      <section className="attendance-card">
        <div className="section-title">
          <span>ATTENDANCE</span>

          <h2>
            Today's Attendance
          </h2>
        </div>

        {attendanceDisplayLog?.log_date &&
          attendanceDisplayLog.log_date !==
            submissionDate && (
            <div className="lock-box">
              <strong>
                Previous Cycle Attendance
              </strong>

              <span>
                This attendance belongs to the
                previous cycle. You can still
                Sign Out before starting the
                new attendance cycle.
              </span>

              <b>
                {formatDate(
                  attendanceDisplayLog.log_date
                )}
              </b>
            </div>
          )}

        {dailyLog &&
          dailyLog.log_date ===
            submissionDate &&
          dailyLog.sign_in_time &&
          dailyLog.sign_out_time && (
            <div className="lock-box">
              <strong>
                Attendance Completed
              </strong>

              <span>
                Sign-out is complete for the
                current submission cycle.
              </span>

              <b>
                New cycle starts at 6:00 PM.
              </b>
            </div>
          )}

        <div className="attendance-grid">
          <div className="attendance-item">
            <div className="attendance-item-head">
              <span className="green-dot" />

              <span>
                Sign In
              </span>
            </div>

            <strong>
              {attendanceDisplaySignIn ||
                "Not recorded"}
            </strong>
          </div>

          <div className="attendance-item">
            <div className="attendance-item-head">
              <span className="red-dot" />

              <span>
                Sign Out
              </span>
            </div>

            <strong>
              {attendanceDisplaySignOut ||
                "Not recorded"}
            </strong>
          </div>

          <div className="attendance-duration">
            <span>
              WORKING TIME
            </span>

            <strong>
              {calculateDuration(
                attendanceDisplaySignIn,
                attendanceDisplaySignOut
              )}
            </strong>
          </div>
        </div>

        <div className="attendance-actions">
          <button
            type="button"
            className="btn-sign-in"
            onClick={handleSignIn}
            disabled={
              Boolean(
                dailyLog?.sign_in_time
              ) ||
              Boolean(openAttendanceLog) ||
              signingIn
            }
          >
            {signingIn
              ? "Signing In..."
              : dailyLog?.sign_in_time
              ? "Signed In"
              : openAttendanceLog
              ? "Sign Out First"
              : "Sign In"}
          </button>

          <button
            type="button"
            className="btn-sign-out"
            onClick={handleSignOut}
            disabled={
              !openAttendanceLog?.sign_in_time ||
              Boolean(
                openAttendanceLog?.sign_out_time
              ) ||
              signingOut
            }
          >
            {signingOut
              ? "Signing Out..."
              : openAttendanceLog?.sign_out_time
              ? "Signed Out"
              : "Sign Out"}
          </button>
        </div>
      </section>

      {!dailyLog?.sign_in_time &&
        !openAttendanceLog && (
          <div className="warning-box">
            <strong>
              Attendance required
            </strong>

            <span>
              Sign in for{" "}
              {submissionDateLabel}.
            </span>
          </div>
        )}

      {dailyLog?.sign_in_time &&
        !dailyLog?.sign_out_time && (
          <div className="warning-box">
            <strong>
              Attendance in progress
            </strong>

            <span>
              Please Sign Out when your
              attendance period is complete.
            </span>
          </div>
        )}
    </>
  );

  const renderDailyLogbook = () => (
    <section className="content-card">
      <div className="content-header">
        <div>
          <span>
            FIELD TRAINING
          </span>

          <h2>
            Daily Logbook
          </h2>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setShowActivityForm(true)
          }
          disabled={
            !signInTime ||
            activityLocked
          }
        >
          {activityLocked
            ? "Activity Submitted"
            : "+ New Activity"}
        </button>
      </div>

      {activityLocked && (
        <div className="lock-box">
          <strong>
            Activity Submitted
          </strong>

          <span>
            Your activity has already been
            submitted for this cycle.
          </span>

          <b>
            It cannot be edited again until
            the next cycle.
          </b>
        </div>
      )}

      {!signInTime && (
        <div className="warning-box">
          <strong>
            Sign In Required
          </strong>

          <span>
            Please complete attendance Sign In
            before submitting your activity.
          </span>
        </div>
      )}

      {showActivityForm &&
        !activityLocked && (
          <div className="activity-form">
            <div className="form-heading">
              <div>
                <strong>
                  Today's Activity
                </strong>

                <span>
                  {submissionDateLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowActivityForm(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <label htmlFor="activity">
              Activity Description
            </label>

            <textarea
              id="activity"
              value={activity}
              onChange={(event) =>
                setActivity(
                  event.target.value
                )
              }
              placeholder="Describe the activities you performed..."
              rows={6}
              disabled={
                !signInTime ||
                savingActivity
              }
            />

            <div className="form-bottom">
              <span>
                Submit once. Activity cannot
                be edited again during this
                cycle.
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={
                  saveActivity
                }
                disabled={
                  !signInTime ||
                  savingActivity
                }
              >
                {savingActivity
                  ? "Submitting..."
                  : "Submit Activity"}
              </button>
            </div>
          </div>
        )}

      <div className="history-title">
        <strong>
          Logbook History
        </strong>

        <span>
          {historyLogs.length} entries
        </span>
      </div>

      {historyLogs.length === 0 ? (
        <div className="empty-state">
          <strong>
            No daily activities yet
          </strong>

          <span>
            Your saved activities will
            appear here.
          </span>
        </div>
      ) : (
        <div className="history-list">
          {historyLogs.map(
            (log) => (
              <article
                className="history-item"
                key={log.id}
              >
                <div className="history-date">
                  <strong>
                    {formatShortDate(
                      log.log_date
                    )}
                  </strong>

                  {log.log_date ===
                    submissionDate && (
                    <span>
                      Current Cycle
                    </span>
                  )}
                </div>

                <div className="history-content">
                  <div className="history-top">
                    <strong>
                      Field Training Activity
                    </strong>

                    <span>
                      {log.sign_in_time ||
                        "--"}{" "}
                      -{" "}
                      {log.sign_out_time ||
                        "--"}
                    </span>
                  </div>

                  <p>
                    {log.activity ||
                      "No activity recorded."}
                  </p>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );

  const renderWeeklySummary = () => (
    <section className="content-card">
      <div className="content-header">
        <div>
          <span>
            WEEKLY RECORD
          </span>

          <h2>
            Weekly Summary
          </h2>
        </div>
      </div>

      {weeklySummaryLocked && (
        <div className="lock-box">
          <strong>
            Weekly Summary Submitted
          </strong>

          <span>
            Your Weekly Summary has already
            been submitted for this cycle.
          </span>

          <b>
            It cannot be submitted again until
            the next cycle.
          </b>
        </div>
      )}

      <div className="summary-info">
        Enter a summary of the work,
        experience and activities completed
        during the week.
      </div>

      <textarea
        className="weekly-textarea"
        value={weeklySummary}
        onChange={(event) =>
          setWeeklySummary(
            event.target.value
          )
        }
        placeholder="Write your weekly summary here..."
        rows={12}
        disabled={
          weeklySummaryLocked ||
          savingWeeklySummary
        }
      />

      <button
        type="button"
        className="primary-button summary-save"
        onClick={
          saveWeeklySummary
        }
        disabled={
          savingWeeklySummary ||
          weeklySummaryLocked
        }
      >
        {savingWeeklySummary
          ? "Submitting..."
          : weeklySummaryLocked
          ? "Summary Submitted"
          : "Submit Weekly Summary"}
      </button>
    </section>
  );

  const renderFinalReport = () => (
    <section className="content-card">
      <div className="content-header">
        <div>
          <span>
            FINAL SUBMISSION
          </span>

          <h2>
            Final Report
          </h2>
        </div>
      </div>

      <div className="final-report-box">
        <div className="final-icon">
          ✓
        </div>

        <strong>
          Final Report
        </strong>

        <p>
          This section is reserved for the
          student's final field training report.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            alert(
              "Final Report section is ready."
            )
          }
        >
          Open Final Report
        </button>
      </div>
    </section>
  );

  const renderEvaluationReport = () => (
    <section className="content-card">
      <div className="content-header">
        <div>
          <span>
            COMPLETE RECORD
          </span>

          <h2>
            Evaluation Report
          </h2>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={
            generateReport
          }
        >
          Generate PDF
        </button>
      </div>

      <div className="evaluation-grid">
        <div>
          <span>
            Student
          </span>

          <strong>
            {getValue(
              user?.name,
              user?.full_name
            )}
          </strong>
        </div>

        <div>
          <span>
            Organization
          </span>

          <strong>
            {organization.name}
          </strong>
        </div>

        <div>
          <span>
            Supervisor
          </span>

          <strong>
            {supervisor.name}
          </strong>
        </div>

        <div>
          <span>
            Total Activities
          </span>

          <strong>
            {historyLogs.length}
          </strong>
        </div>
      </div>

      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sign In</th>
              <th>Sign Out</th>
              <th>Hours</th>
              <th>Activity</th>
            </tr>
          </thead>

          <tbody>
            {historyLogs.length ===
            0 ? (
              <tr>
                <td colSpan="5">
                  No records available.
                </td>
              </tr>
            ) : (
              historyLogs.map(
                (log) => (
                  <tr
                    key={log.id}
                  >
                    <td>
                      {log.log_date}
                    </td>

                    <td>
                      {log.sign_in_time ||
                        "--"}
                    </td>

                    <td>
                      {log.sign_out_time ||
                        "--"}
                    </td>

                    <td>
                      {calculateDuration(
                        log.sign_in_time,
                        log.sign_out_time
                      )}
                    </td>

                    <td>
                      {log.activity ||
                        "--"}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="weekly-preview">
        <span>
          WEEKLY SUMMARY
        </span>

        <p>
          {weeklySummary ||
            "No weekly summary entered."}
        </p>
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="daily-page">
        <Sidebar />

        <main className="daily-main">
          <div className="loading-screen">
            <div className="spinner" />
            Loading...
          </div>
        </main>

        <style>
          {styles}
        </style>
      </div>
    );
  }

  return (
    <div className="daily-page">
      <Sidebar />

      <main className="daily-main">
        <header className="daily-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              aria-expanded="true"
            >
              <span />
              <span />
              <span />
            </button>

            <div className="portal-title">
              <strong>
                Field Training
              </strong>

              <span>
                Student Portal
              </span>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">
              {String(
                user?.name ||
                  user?.full_name ||
                  "S"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-text">
              <strong>
                {getValue(
                  user?.name,
                  user?.full_name,
                  "Student"
                )}
              </strong>

              <span>
                Student
              </span>
            </div>
          </div>
        </header>

        <div className="daily-container">
          <div className="page-heading">
            <span>
              Student / Field Training
            </span>

            <h1>
              Daily Logbook
            </h1>

            <p>
              Manage your field training
              attendance and activities.
            </p>
          </div>

          <section className="placement-card">
            <div className="placement-heading">
              <div>
                <span>
                  PLACEMENT
                </span>

                <h2>
                  {organization.name}
                </h2>
              </div>

              <span className="active-badge">
                Active Placement
              </span>
            </div>

            <div className="placement-grid">
              <InfoItem
                label="Address"
                value={
                  organization.address
                }
              />

              <InfoItem
                label="Email"
                value={
                  organization.email
                }
              />

              <InfoItem
                label="Phone"
                value={
                  organization.phone
                }
              />

              <InfoItem
                label="Location"
                value={
                  organization.location
                }
              />

              <InfoItem
                label="Website"
                value={
                  organization.website
                }
              />

              <InfoItem
                label="Supervisor"
                value={
                  supervisor.name
                }
              />
            </div>
          </section>

          <nav className="tabs-wrapper">
            <div className="tabs">
              {TABS.map(
                (tab) => (
                  <button
                    type="button"
                    key={tab}
                    className={
                      activeTab ===
                      tab
                        ? "tab active"
                        : "tab"
                    }
                    onClick={() =>
                      setActiveTab(
                        tab
                      )
                    }
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </nav>

          <div className="tab-content">
            {activeTab ===
              "ATTENDANCE" &&
              renderAttendance()}

            {activeTab ===
              "DAILY LOGBOOK" &&
              renderDailyLogbook()}

            {activeTab ===
              "WEEKLY SUMMARY" &&
              renderWeeklySummary()}

            {activeTab ===
              "FINAL REPORT" &&
              renderFinalReport()}

            {activeTab ===
              "EVALUATION REPORT" &&
              renderEvaluationReport()}
          </div>
        </div>
      </main>

      <style>
        {styles}
      </style>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>
        {label}
      </span>

      <strong>
        {value || "--"}
      </strong>
    </div>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

.daily-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background: #f4f7fb;
  color: #172033;
  font-family: Inter, Arial, sans-serif;
}

.daily-main {
  flex: 1;
  min-width: 0;
  width: calc(100% - 240px);
  margin-left: 240px;
  transition: margin-left 0.25s ease, width 0.25s ease;
}

body.sfpms-sidebar-collapsed .daily-main {
  width: 100%;
  margin-left: 0;
}

.daily-topbar {
  height: 64px;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.sidebar-toggle {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  padding: 8px;
  margin: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.sidebar-toggle:hover {
  background: #f1f5f9;
}

.sidebar-toggle:active {
  background: #e2e8f0;
}

.sidebar-toggle span {
  display: block;
  width: 21px;
  height: 2px;
  border-radius: 2px;
  background: #2563eb;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.portal-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.portal-title strong {
  color: #2563eb;
  font-size: 14px;
}

.portal-title span {
  color: #7b879a;
  font-size: 10px;
  margin-top: 2px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.profile-text {
  display: flex;
  flex-direction: column;
}

.profile-text strong {
  font-size: 12px;
}

.profile-text span {
  color: #7b879a;
  font-size: 10px;
  margin-top: 2px;
}

.daily-container {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px 28px 60px;
}

.page-heading {
  margin-bottom: 18px;
}

.page-heading > span {
  color: #7b879a;
  font-size: 11px;
}

.page-heading h1 {
  margin: 5px 0 3px;
  color: #2563eb;
  font-size: 22px;
}

.page-heading p {
  margin: 0;
  color: #7b879a;
  font-size: 12px;
}

.placement-card,
.attendance-card,
.content-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e1e6ef;
  border-radius: 8px;
}

.placement-card {
  padding: 18px;
  margin-bottom: 14px;
}

.placement-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.placement-heading > div {
  min-width: 0;
}

.placement-heading span:first-child,
.section-title span,
.content-header span {
  display: block;
  color: #20a99d;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
  margin-bottom: 4px;
}

.placement-heading h2,
.section-title h2,
.content-header h2 {
  margin: 0;
  color: #2563eb;
  font-size: 15px;
}

.active-badge {
  flex-shrink: 0;
  padding: 6px 9px;
  border-radius: 20px;
  background: #ecfdf5;
  color: #15803d;
  font-size: 10px;
  font-weight: 700;
}

.placement-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border-top: 1px solid #e5e7eb;
  margin-top: 15px;
}

.info-item {
  min-width: 0;
  padding: 12px 12px 4px 0;
}

.info-item span {
  display: block;
  color: #7b879a;
  font-size: 10px;
  margin-bottom: 4px;
}

.info-item strong {
  display: block;
  color: #25334d;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.tabs-wrapper {
  width: 100%;
  overflow: hidden;
  margin-bottom: 14px;
}

.tabs {
  width: 100%;
  display: flex;
  overflow-x: auto;
  background: #ffffff;
  border: 1px solid #e1e6ef;
  border-radius: 8px;
  scrollbar-width: thin;
}

.tab {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 0 18px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: #ffffff;
  color: #71809b;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

.tab:hover {
  color: #2563eb;
  background: #f8faff;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-content {
  width: 100%;
}

.attendance-card {
  padding: 18px;
}

.attendance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 180px;
  gap: 15px;
  margin-top: 16px;
}

.attendance-item,
.attendance-duration {
  min-width: 0;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fbfcfe;
}

.attendance-item-head {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #7b879a;
  font-size: 11px;
  margin-bottom: 8px;
}

.green-dot,
.red-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.green-dot {
  background: #16a34a;
}

.red-dot {
  background: #ef4444;
}

.attendance-item strong,
.attendance-duration strong {
  display: block;
  color: #25334d;
  font-size: 16px;
}

.attendance-duration span {
  color: #7b879a;
  font-size: 9px;
  font-weight: 700;
}

.attendance-actions {
  display: flex;
  gap: 9px;
  margin-top: 15px;
}

.btn-sign-in,
.btn-sign-out,
.primary-button {
  min-height: 36px;
  border-radius: 6px;
  padding: 0 15px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.btn-sign-in {
  border: 1px solid #16a34a;
  background: #16a34a;
  color: #ffffff;
}

.btn-sign-out {
  border: 1px solid #ef4444;
  background: #ffffff;
  color: #ef4444;
}

.btn-sign-in:disabled,
.btn-sign-out:disabled,
.primary-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.warning-box {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 12px;
  padding: 12px 14px;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  background: #fff8e8;
}

.warning-box strong {
  color: #855d18;
  font-size: 11px;
}

.warning-box span {
  color: #916f37;
  font-size: 10px;
}

.lock-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
  padding: 14px;
  border-left: 4px solid #2563eb;
  border-radius: 6px;
  background: #eff6ff;
}

.lock-box strong {
  color: #1e40af;
  font-size: 12px;
}

.lock-box span {
  color: #475569;
  font-size: 10px;
}

.lock-box b {
  color: #2563eb;
  font-size: 12px;
  margin-top: 3px;
}

.lock-box small {
  color: #64748b;
  font-size: 10px;
}

.content-card {
  padding: 18px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.primary-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.activity-form {
  border: 1px solid #dfe5ef;
  border-top: 3px solid #20a99d;
  border-radius: 7px;
  padding: 16px;
  margin-bottom: 18px;
  background: #fbfcfe;
}

.form-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
}

.form-heading strong {
  display: block;
  font-size: 13px;
}

.form-heading span {
  display: block;
  color: #7b879a;
  font-size: 10px;
  margin-top: 3px;
}

.form-heading button {
  border: 0;
  background: transparent;
  font-size: 22px;
  color: #7b879a;
  cursor: pointer;
}

.activity-form label {
  display: block;
  margin-bottom: 6px;
  color: #25334d;
  font-size: 11px;
  font-weight: 700;
}

.activity-form textarea,
.weekly-textarea {
  width: 100%;
  border: 1px solid #dfe5ef;
  border-radius: 6px;
  padding: 11px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  font-size: 12px;
  color: #25334d;
  background: #ffffff;
}

.activity-form textarea:focus,
.weekly-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px #eff6ff;
}

.activity-form textarea:disabled,
.weekly-textarea:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.form-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 12px;
}

.form-bottom span {
  color: #7b879a;
  font-size: 10px;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 9px;
}

.history-title strong {
  font-size: 12px;
}

.history-title span {
  color: #7b879a;
  font-size: 10px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: grid;
  grid-template-columns: 105px minmax(0, 1fr);
  border: 1px solid #e1e6ef;
  border-radius: 7px;
  overflow: hidden;
}

.history-date {
  padding: 15px;
  background: #f5f7fb;
  border-right: 1px solid #e1e6ef;
}

.history-date strong {
  display: block;
  color: #2563eb;
  font-size: 11px;
}

.history-date span {
  display: inline-block;
  color: #16a34a;
  font-size: 8px;
  font-weight: 800;
  margin-top: 5px;
}

.history-content {
  min-width: 0;
  padding: 14px;
}

.history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.history-top strong {
  color: #2563eb;
  font-size: 12px;
}

.history-top span {
  flex-shrink: 0;
  color: #7b879a;
  font-size: 9px;
}

.history-content p {
  margin: 9px 0 0;
  color: #5e6d85;
  font-size: 11px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.empty-state {
  min-height: 150px;
  border: 1px dashed #cfd8e8;
  border-radius: 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-align: center;
}

.empty-state strong {
  font-size: 12px;
}

.empty-state span {
  color: #7b879a;
  font-size: 10px;
}

.summary-info {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 6px;
  background: #eff6ff;
  color: #475569;
  font-size: 11px;
  line-height: 1.6;
}

.weekly-textarea {
  min-height: 220px;
}

.summary-save {
  margin-top: 12px;
}

.final-report-box {
  min-height: 280px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 25px;
}

.final-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  margin-bottom: 12px;
}

.final-report-box strong {
  font-size: 15px;
}

.final-report-box p {
  max-width: 500px;
  color: #7b879a;
  font-size: 11px;
  line-height: 1.7;
}

.evaluation-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.evaluation-grid > div {
  min-width: 0;
  padding: 13px;
  border: 1px solid #e1e6ef;
  border-radius: 7px;
  background: #fbfcfe;
}

.evaluation-grid span {
  display: block;
  color: #7b879a;
  font-size: 9px;
  margin-bottom: 5px;
}

.evaluation-grid strong {
  display: block;
  color: #25334d;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.report-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e1e6ef;
  border-radius: 7px;
}

.report-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
}

.report-table th,
.report-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 10px;
  vertical-align: top;
}

.report-table th {
  background: #f8fafc;
  color: #475569;
}

.report-table td {
  color: #5e6d85;
  line-height: 1.5;
}

.weekly-preview {
  margin-top: 18px;
  padding: 15px;
  border-radius: 7px;
  background: #f8fafc;
  border: 1px solid #e1e6ef;
}

.weekly-preview span {
  color: #20a99d;
  font-size: 9px;
  font-weight: 800;
}

.weekly-preview p {
  color: #5e6d85;
  font-size: 11px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #2563eb;
  font-size: 13px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .daily-main {
    width: calc(100% - 240px);
    margin-left: 240px;
  }

  body.sfpms-sidebar-collapsed .daily-main {
    width: 100%;
    margin-left: 0;
  }

  .placement-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .attendance-grid {
    grid-template-columns: 1fr 1fr;
  }

  .attendance-duration {
    grid-column: 1 / -1;
  }

  .evaluation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .daily-main {
    width: 100%;
    margin-left: 0;
  }

  body.sfpms-sidebar-open .daily-main,
  body.sfpms-sidebar-collapsed .daily-main {
    width: 100%;
    margin-left: 0;
  }

  .daily-container {
    padding: 18px 15px 40px;
  }

  .daily-topbar {
    padding: 0 15px;
  }

  .placement-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .attendance-grid {
    grid-template-columns: 1fr;
  }

  .attendance-duration {
    grid-column: auto;
  }

  .content-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .content-header .primary-button {
    width: 100%;
  }

  .form-bottom {
    align-items: stretch;
    flex-direction: column;
  }

  .form-bottom .primary-button {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .daily-topbar {
    height: 58px;
  }

  .sidebar-toggle {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }

  .sidebar-toggle span {
    width: 20px;
  }

  .portal-title,
  .profile-text {
    display: none;
  }

  .daily-container {
    padding: 15px 10px 30px;
  }

  .page-heading h1 {
    font-size: 19px;
  }

  .placement-card,
  .attendance-card,
  .content-card {
    padding: 13px;
  }

  .placement-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .placement-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    padding: 9px 0;
    border-top: 1px solid #e5e7eb;
  }

  .info-item:first-child {
    border-top: 0;
  }

  .tabs {
    border-radius: 6px;
  }

  .tab {
    padding: 0 14px;
    min-height: 43px;
  }

  .attendance-actions {
    flex-direction: column;
  }

  .btn-sign-in,
  .btn-sign-out {
    width: 100%;
  }

  .history-item {
    grid-template-columns: 1fr;
  }

  .history-date {
    border-right: 0;
    border-bottom: 1px solid #e1e6ef;
  }

  .history-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-top span {
    white-space: normal;
  }

  .evaluation-grid {
    grid-template-columns: 1fr;
  }

  .final-report-box {
    min-height: 220px;
  }
}
`;

export default DailyLogbook;