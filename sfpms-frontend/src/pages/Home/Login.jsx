import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import fieldLogo from "../../assets/field-logo-transparent.png";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const identifier = formData.identifier.trim();
    const password = formData.password;

    if (!identifier || !password) {
      alert("Please enter your Email/Batch Number and password.");
      return;
    }

    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        identifier,
        password,
      });

      const user = response.user;

      if (!user || !user.id || !user.role) {
        throw new Error(
          "Invalid user information returned from server."
        );
      }

      const loginType = response.login_type || "";

      const accessLevel = response.access_level || "";

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        institutional_id: user.institutional_id,
        batch_number: user.batch_number || "",
        programme: user.programme,
        role: user.role,
        status: user.status,

        login_type: loginType,

        access_level: accessLevel,

        is_batch_login:
          loginType === "BATCH",

        full_student_access:
          loginType === "BATCH" &&
          accessLevel === "FULL_STUDENT",

        application_access:
          loginType === "EMAIL" &&
          accessLevel === "APPLICATION",

        rememberMe,

        loginTime: new Date().toISOString(),
      };

      localStorage.setItem(
        "sfpms_user",
        JSON.stringify(userData)
      );

      localStorage.removeItem("sfpms_admin");
      localStorage.removeItem("sfpms_student");
      localStorage.removeItem("sfpms_student_logged_in");

      if (user.role === "ADMIN") {
        localStorage.setItem(
          "sfpms_admin",
          "true"
        );

        navigate("/admin/dashboard");

        return;
      }

      if (user.role === "ACADEMIC_SUPERVISOR") {
        navigate(
          "/academic-supervisor/dashboard"
        );

        return;
      }

      if (user.role === "FIELD_SUPERVISOR") {
        navigate(
          "/field-supervisor/dashboard"
        );

        return;
      }

      if (user.role === "COORDINATOR") {
        navigate(
          "/admin/dashboard"
        );

        return;
      }

      if (user.role === "STUDENT") {
        localStorage.setItem(
          "sfpms_student",
          JSON.stringify(userData)
        );

        localStorage.setItem(
          "sfpms_student_logged_in",
          "true"
        );

        if (
          loginType === "BATCH" &&
          accessLevel === "FULL_STUDENT"
        ) {
          navigate("/student/dashboard");

          return;
        }

        if (
          loginType === "EMAIL" &&
          accessLevel === "APPLICATION"
        ) {
          navigate("/student/dashboard");

          return;
        }

        navigate("/student/dashboard");

        return;
      }

      alert(
        "Your account role is not supported."
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          overflow: hidden;
          font-family: 'Poppins', 'Inter', Arial, sans-serif;
          background: #eef1f3;
        }

        .login-brand-side {
          width: 50%;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              rgba(7, 26, 51, 0.9),
              rgba(18, 59, 104, 0.9)
            ),
            var(--login-field-logo);
          background-size: cover, 430px;
          background-position: center, center;
          background-repeat: no-repeat;
        }

        .login-brand-side::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          top: -180px;
          left: -150px;
        }

        .login-brand-side::after {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(245,210,26,0.08);
          bottom: -250px;
          right: -200px;
        }

        .login-brand-content {
          width: 80%;
          max-width: 550px;
          text-align: center;
          color: white;
          position: relative;
          z-index: 2;
        }

        .login-logo {
          width: 145px;
          height: 145px;
          object-fit: contain;
          border-radius: 18px;
          background: white;
          padding: 10px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.30);
        }

        .login-title {
          font-size: 38px;
          line-height: 1.25;
          font-weight: 800;
          margin: 30px 0 20px;
          letter-spacing: -0.5px;
        }

        .login-description {
          font-size: 16px;
          line-height: 1.8;
          color: #dbeafe;
          max-width: 500px;
          margin: auto;
        }

        .login-brand-line {
          width: 80px;
          height: 4px;
          background: #f5d21a;
          border-radius: 20px;
          margin: 30px auto 20px;
        }

        .login-brand-footer {
          color: #f5d21a;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 4px;
        }

        .login-form-side {
          width: 50%;
          min-height: 100vh;
          padding: 40px 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          overflow-y: auto;
        }

        .login-card {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 20px;
          padding: 42px;
          border: 1px solid #e5e7eb;
          box-shadow:
            0 25px 70px rgba(15,23,42,0.10);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h2 {
          margin: 0 0 8px;
          color: #0b1f3a;
          font-size: 32px;
          font-weight: 800;
        }

        .login-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .login-form-group {
          margin-bottom: 20px;
        }

        .login-label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-size: 14px;
          font-weight: 600;
        }

        .login-input {
          width: 100%;
          height: 52px;
          padding: 0 15px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          font-size: 14px;
          color: #0f172a;
          background: white;
          transition: all 0.25s ease;
        }

        .login-input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 4px rgba(37,99,235,0.08);
        }

        .login-password-wrapper {
          position: relative;
        }

        .login-password-wrapper .login-input {
          padding-right: 60px;
        }

        .login-show-password {
          position: absolute;
          right: 5px;
          top: 5px;
          width: 48px;
          height: 42px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #2563eb;
        }

        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          gap: 10px;
        }

        .login-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-size: 13px;
          cursor: pointer;
        }

        .login-forgot {
          border: none;
          background: transparent;
          color: #2563eb;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
        }

        .login-submit {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #0b1f3a,
              #123b68
            );
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 10px 25px rgba(11,31,58,0.20);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-register {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          margin-top: 25px;
          color: #64748b;
          font-size: 13px;
          flex-wrap: wrap;
        }

        .login-register a {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }

        .login-home {
          text-align: center;
          margin-top: 20px;
        }

        .login-home a {
          color: #475569;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
            overflow: auto;
          }

          .login-brand-side,
          .login-form-side {
            width: 100%;
            min-height: auto;
          }

          .login-brand-side {
            min-height: 380px;
            order: 2;
            padding: 50px 20px;
          }

          .login-form-side {
            order: 1;
            padding: 30px 20px;
          }

          .login-title {
            font-size: 30px;
          }
        }

        @media (max-width: 600px) {
          .login-card {
            padding: 28px 20px;
            border-radius: 18px;
          }

          .login-header h2 {
            font-size: 27px;
          }

          .login-options {
            flex-direction: column;
            align-items: flex-start;
          }

          .login-brand-side {
            min-height: 320px;
          }

          .login-logo {
            width: 105px;
            height: 105px;
          }

          .login-title {
            font-size: 25px;
            margin-top: 20px;
          }

          .login-description {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="login-page">

        <motion.div
          className="login-brand-side"
          style={{
            "--login-field-logo":
              "url('/image/egaz-logo.jpg')",
          }}
          initial={{
            x: -80,
            opacity: 0
          }}
          animate={{
            x: 0,
            opacity: 1
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <motion.div
            className="login-brand-content"
            initial={{
              opacity: 0,
              scale: 0.88,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
              duration: 0.7,
            }}
          >

            <motion.img
              className="login-logo"
              src={fieldLogo}
              alt="Field Placement logo"
              initial={{
                opacity: 0,
                scale: 0.5,
                rotate: -8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                type: "spring",
                stiffness: 120,
              }}
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />

            <motion.h1
              className="login-title"
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.6,
              }}
            >
              Student Field Placement
              <br />
              Management System
            </motion.h1>

            <motion.p
              className="login-description"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.5,
                duration: 0.6,
              }}
            >
              Manage your field placement,
              applications, attendance,
              reports and academic
              supervision in one platform.
            </motion.p>

            <motion.div
              className="login-brand-line"
              initial={{
                width: 0
              }}
              animate={{
                width: 80
              }}
              transition={{
                delay: 0.7,
                duration: 0.5,
              }}
            />

            <motion.p
              className="login-brand-footer"
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              transition={{
                delay: 0.8
              }}
            >
              SFPMS
            </motion.p>

          </motion.div>

        </motion.div>

        <motion.div
          className="login-form-side"
          initial={{
            x: 80,
            opacity: 0
          }}
          animate={{
            x: 0,
            opacity: 1
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <motion.div
            className="login-card"
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.15,
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >

            <div className="login-header">

              <h2>
                Welcome Back
              </h2>

              <p>
                Sign in using your Email or Batch Number
              </p>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="login-form-group">

                <label className="login-label">
                  Email / Batch Number
                </label>

                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Email or Batch Number"
                  className="login-input"
                  autoComplete="username"
                  disabled={loading}
                  required
                />

              </div>

              <div className="login-form-group">

                <label className="login-label">
                  Password
                </label>

                <div className="login-password-wrapper">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="login-input"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="login-show-password"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              <div className="login-options">

                <label className="login-remember">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                    disabled={loading}
                  />

                  Remember me

                </label>

                <button
                  type="button"
                  className="login-forgot"
                  onClick={() =>
                    alert(
                      "Please contact the system administrator to reset your password."
                    )
                  }
                  disabled={loading}
                >
                  Forgot Password?
                </button>

              </div>

              <motion.button
                type="submit"
                className="login-submit"
                whileHover={{
                  scale: loading ? 1 : 1.02,
                  y: loading ? 0 : -2,
                }}
                whileTap={{
                  scale: loading ? 1 : 0.98,
                }}
                disabled={loading}
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </motion.button>

            </form>

            <div className="login-register">

              <span>
                Don't have an account?
              </span>

              <motion.div
                whileHover={{
                  x: 4
                }}
              >
                <Link to="/register">
                  Create Student Account
                </Link>
              </motion.div>

            </div>

            <div className="login-home">

              <Link to="/">
                Back to Home
              </Link>

            </div>

          </motion.div>

        </motion.div>

      </div>
    </>
  );
}

export default Login;