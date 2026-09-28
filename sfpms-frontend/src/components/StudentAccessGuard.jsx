import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../services/api";

function StudentAccessGuard({ children, allowedBeforeApproval = false }) {
  const location = useLocation();

  const storedUser = JSON.parse(
    localStorage.getItem("sfpms_user") || "null"
  );

  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!storedUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const applications = await api.get(
          `/applications/?student_id=${storedUser.id}`
        );

        if (Array.isArray(applications) && applications.length > 0) {
          const latestApplication = [...applications].sort(
            (a, b) =>
              new Date(b.created_at || b.submitted_at || 0) -
              new Date(a.created_at || a.submitted_at || 0)
          )[0];

          const status = String(
            latestApplication?.status || ""
          )
            .trim()
            .toUpperCase();

          setApproved(
            status === "APPROVED" &&
              Boolean(storedUser.batch_number || latestApplication.batch_number)
          );
        } else {
          setApproved(false);
        }
      } catch (error) {
        setApproved(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [storedUser?.id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!storedUser?.id) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedBeforeApproval && !approved) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

export default StudentAccessGuard;