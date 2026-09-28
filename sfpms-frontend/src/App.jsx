import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";
import MainLayout from "./components/MainLayout";
import { SidebarProvider } from "./components/SidebarContext";

// ==================================================
// HOME & AUTHENTICATION
// ==================================================
import Home from "./pages/Home/Home";
import Login from "./pages/Home/Login";
import Register from "./pages/Student/Register";

// ==================================================
// STUDENT PAGES
// ==================================================
import Dashboard from "./pages/Student/Dashboard";
import DailyLogbook from "./pages/Student/DailyLogbook";
import Placement from "./pages/Student/Placement";
import Application from "./pages/Student/Application";
import Report from "./pages/Student/Report";

// ==================================================
// NOTIFICATION PAGES
// ==================================================

// ==================================================
// ADMIN PAGES
// ==================================================
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Users from "./pages/Admin/Users";
import Applications from "./pages/Admin/Applications";
import Organizations from "./pages/Admin/Organizations";
import Supervisors from "./pages/Admin/Supervisors";
import Reports from "./pages/Admin/Reports";
import SystemSettings from "./pages/Admin/SystemSettings";

// ==================================================
// LEARN MORE PAGES
// ==================================================
import DailyLearnMore from "./pages/LearnMore/Daily";
import AttendanceLearnMore from "./pages/LearnMore/Attendance";
import ReportsLearnMore from "./pages/LearnMore/Reports";
import ApplicationsLearnMore from "./pages/LearnMore/Applications";
import OrganizationsLearnMore from "./pages/LearnMore/Organizations";
import SupervisorsLearnMore from "./pages/LearnMore/Supervisors";

// ==================================================
// ACADEMIC SUPERVISOR PAGES
// ==================================================
import AcademicSupervisorDashboard from "./pages/AcademicSupervisor/Dashboard";
import AssignedStudents from "./pages/AcademicSupervisor/AssignedStudents";
import AcademicSupervisorLogs from "./pages/AcademicSupervisor/Logs";
import AcademicRemarks from "./pages/AcademicSupervisor/AcademicRemarks";

// ==================================================
// FIELD SUPERVISOR PAGES
// ==================================================
import FieldSupervisorDashboard from "./pages/Field-Supervisor/Dashboard";
import FieldSupervisorAssignedStudents from "./pages/Field-Supervisor/AssignedStudents";
import FieldSupervisorLogs from "./pages/Field-Supervisor/DailyLogs";
import FieldEvaluation from "./pages/Field-Supervisor/FieldEvaluation";

// ==================================================
// ANIMATED ROUTES
// ==================================================
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes
          location={location}
          key={location.pathname}
        >
          {/* =========================================
              HOME & AUTHENTICATION
          ========================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/student/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/student/register"
            element={<Register />}
          />

          {/* =========================================
              STUDENT
          ========================================= */}

          <Route
            path="/student/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/student/application"
            element={<Application />}
          />

          <Route
            path="/student/placement"
            element={<Placement />}
          />

          <Route
            path="/student/daily-logbook"
            element={<DailyLogbook />}
          />

          <Route
            path="/student/report"
            element={<Report />}
          />

          {/* =========================================
              ADMIN
          ========================================= */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<Users />}
          />

          <Route
            path="/admin/applications"
            element={<Applications />}
          />

          <Route
            path="/admin/organizations"
            element={<Organizations />}
          />

          <Route
            path="/admin/supervisors"
            element={<Supervisors />}
          />

          <Route
            path="/admin/reports"
            element={<Reports />}
          />

          <Route
            path="/admin/settings"
            element={<SystemSettings />}
          />

          {/* =========================================
              ACADEMIC SUPERVISOR
          ========================================= */}

          <Route
            path="/academic-supervisor/dashboard"
            element={<AcademicSupervisorDashboard />}
          />

          <Route
            path="/academic-supervisor/students"
            element={<AssignedStudents />}
          />

          <Route
            path="/academic-supervisor/logs"
            element={<AcademicSupervisorLogs />}
          />

          <Route
            path="/academic-supervisor/remarks"
            element={<AcademicRemarks />}
          />

          {/* =========================================
              FIELD SUPERVISOR
          ========================================= */}

          <Route
            path="/field-supervisor/dashboard"
            element={<FieldSupervisorDashboard />}
          />

          <Route
            path="/field-supervisor/students"
            element={<FieldSupervisorAssignedStudents />}
          />

          <Route
            path="/field-supervisor/logs"
            element={<FieldSupervisorLogs />}
          />

          <Route
            path="/field-supervisor/evaluation"
            element={<FieldEvaluation />}
          />

          {/* =========================================
              LEARN MORE
          ========================================= */}

          <Route
            path="/learn-more/daily"
            element={<DailyLearnMore />}
          />

          <Route
            path="/learn-more/attendance"
            element={<AttendanceLearnMore />}
          />

          <Route
            path="/learn-more/reports"
            element={<ReportsLearnMore />}
          />

          <Route
            path="/learn-more/applications"
            element={<ApplicationsLearnMore />}
          />

          <Route
            path="/learn-more/organizations"
            element={<OrganizationsLearnMore />}
          />

          <Route
            path="/learn-more/supervisors"
            element={<SupervisorsLearnMore />}
          />

        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

// ==================================================
// MAIN APP
// ==================================================
function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AnimatedRoutes />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;


