import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import fieldLogo from "../../assets/field-logo-transparent.png";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    institutional_id: "",
    PhoneNumber: "",
    fullName: "",
    email: "",
    programme: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (
      !/[A-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password) ||
      !/[!@#$%^&*(),.?":{}|<>_\-\\[\]/';`~+=]/.test(
        formData.password
      )
    ) {
      alert(
        "Password must contain at least one capital letter, one number, and one symbol."
      );
      return;
    }

    if (
      !formData.institutional_id.trim() ||
      !formData.PhoneNumber.trim() ||
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.programme.trim()
    ) {
      alert("Please complete all student registration fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            institutional_id: formData.institutional_id.trim(),
            name: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.PhoneNumber.trim(),
            programme: formData.programme.trim(),
            password: formData.password,
            role: "STUDENT",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Registration failed. Please try again."
        );
        return;
      }

      alert(
        data.message ||
          "Student registered successfully."
      );

      setFormData({
        institutional_id: "",
        PhoneNumber: "",
        fullName: "",
        email: "",
        programme: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/login");
    } catch (error) {
      alert(
        "Unable to connect to the backend. Make sure the Flask server is running."
      );
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

        .register-page {
          min-height: 100vh;
          display: flex;
          overflow: hidden;
          font-family: 'Poppins', 'Inter', Arial, sans-serif;
          background: #f8fafc;
        }

        .register-form-side {
          width: 50%;
          min-height: 100vh;
          padding: 35px 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          overflow-y: auto;
        }

        .register-card {
          width: 100%;
          max-width: 650px;
          background: white;
          border-radius: 22px;
          padding: 38px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 25px 70px rgba(15,23,42,0.10);
        }

        .register-header {
          margin-bottom: 25px;
        }

        .register-small-title {
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .register-title {
          margin: 7px 0;
          color: #0b1f3a;
          font-size: 30px;
          font-weight: 800;
        }

        .register-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .register-student-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          margin-bottom: 22px;
          border-radius: 11px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
        }

        .register-student-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .register-student-title {
          display: block;
          color: #1e3a8a;
          font-size: 12px;
        }

        .register-student-text {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .register-form-group {
          margin-bottom: 17px;
        }

        .register-label {
          display: block;
          margin-bottom: 7px;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
        }

        .register-input-wrapper {
          position: relative;
          width: 100%;
        }

        .register-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          font-size: 14px;
        }

        .register-input {
          width: 100%;
          height: 49px;
          padding: 0 13px 0 40px;
          border: 1px solid #dfe4ec;
          border-radius: 10px;
          outline: none;
          background: white;
          color: #0f172a;
          font-size: 12px;
          transition: all 0.25s ease;
        }

        .register-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.08);
        }

        .register-password-button {
          position: absolute;
          right: 8px;
          top: 7px;
          width: 35px;
          height: 35px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
        }

        .register-password-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .register-terms {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
          margin-bottom: 20px;
          cursor: pointer;
        }

        .register-terms input {
          margin-top: 2px;
          accent-color: #2563eb;
        }

        .register-terms a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }

        .register-submit {
          width: 100%;
          min-height: 52px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #0b1f3a, #123b68);
          color: white;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(11,31,58,0.18);
        }

        .register-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .register-arrow {
          font-size: 19px;
        }

        .register-login-section {
          margin-top: 22px;
          text-align: center;
          font-size: 12px;
        }

        .register-login-text {
          color: #64748b;
        }

        .register-login-link {
          display: block;
          margin-top: 5px;
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }

        .register-back-home {
          text-align: center;
          margin-top: 18px;
        }

        .register-back-home a {
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
        }

        .register-brand-side {
          width: 50%;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background:
            linear-gradient(
              rgba(7, 26, 51, 0.9),
              rgba(18, 59, 104, 0.9)
            ),
            var(--register-field-logo);
          background-size: cover, 430px;
          background-position: center, center;
          background-repeat: no-repeat;
        }

        .register-brand-side::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          top: -180px;
          right: -150px;
        }

        .register-brand-side::after {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(245,210,26,0.08);
          bottom: -250px;
          left: -200px;
        }

        .register-brand-content {
          width: 80%;
          max-width: 550px;
          color: white;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .register-logo {
          width: 145px;
          height: 145px;
          object-fit: contain;
          border-radius: 18px;
          background: white;
          padding: 10px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.30);
        }

        .register-brand-title {
          font-size: 38px;
          line-height: 1.25;
          font-weight: 800;
          margin: 30px 0 20px;
        }

        .register-brand-text {
          font-size: 15px;
          line-height: 1.8;
          color: #dbeafe;
          margin: auto;
          max-width: 500px;
        }

        .register-brand-line {
          width: 80px;
          height: 4px;
          background: #f5d21a;
          border-radius: 20px;
          margin: 28px auto;
        }

        .register-benefits {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: left;
          margin-top: 25px;
        }

        .register-benefit {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .register-benefit-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: rgba(255,255,255,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .register-benefit-title {
          display: block;
          color: white;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .register-benefit-text {
          margin: 0;
          color: rgba(255,255,255,0.58);
          font-size: 11px;
          line-height: 1.5;
        }

        .register-brand-footer {
          margin: 30px 0 5px;
          color: #f5d21a;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 4px;
        }

        .register-copyright {
          margin: 0;
          color: rgba(255,255,255,0.35);
          font-size: 10px;
        }

        @media (max-width: 900px) {
          .register-page {
            flex-direction: column;
            overflow: auto;
          }

          .register-form-side {
            width: 100%;
            min-height: auto;
            padding: 30px 20px;
            order: 1;
          }

          .register-brand-side {
            width: 100%;
            min-height: 420px;
            padding: 50px 20px;
            order: 2;
          }

          .register-brand-title {
            font-size: 30px;
          }
        }

        @media (max-width: 600px) {
          .register-card {
            padding: 25px 18px;
            border-radius: 18px;
          }

          .register-password-grid {
            grid-template-columns: 1fr;
          }

          .register-title {
            font-size: 26px;
          }

          .register-brand-side {
            min-height: 350px;
          }

          .register-logo {
            width: 105px;
            height: 105px;
          }

          .register-brand-title {
            font-size: 25px;
          }

          .register-brand-text {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="register-page">
        <motion.div
          className="register-form-side"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            className="register-card"
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
            <div className="register-header">
              <span className="register-small-title">
                GET STARTED
              </span>

              <h1 className="register-title">
                Create your account
              </h1>

              <p className="register-subtitle">
                Register as a student to access the SFPMS platform.
              </p>
            </div>

            <div className="register-student-info">
              <div className="register-student-icon">
                
              </div>

              <div>
                <strong className="register-student-title">
                  Student Registration
                </strong>

                <p className="register-student-text">
                  Create your student account to apply for field placement.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{ duration: 0.35 }}
              >
                <RegisterInput
                  label="Student ID"
                  type="text"
                  name="institutional_id"
                  value={formData.institutional_id}
                  onChange={handleChange}
                  placeholder="Enter Student ID"
                />

                <RegisterInput
                  label="Phone Number"
                  type="tel"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

                <RegisterInput
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />

                <RegisterInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                />

                <RegisterInput
                  label="Programme"
                  type="text"
                  name="programme"
                  value={formData.programme}
                  onChange={handleChange}
                  placeholder="e.g. BSc Information Technology"
                />
              </motion.div>

              <div className="register-password-grid">
                <div className="register-form-group">
                  <label className="register-label">
                    Password
                  </label>

                  <div className="register-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      className="register-input"
                      style={{
                        paddingRight: "60px",
                      }}
                      required
                    />

                    <button
                      type="button"
                      className="register-password-button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="register-form-group">
                  <label className="register-label">
                    Confirm Password
                  </label>

                  <div className="register-input-wrapper">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="register-input"
                      style={{
                        paddingRight: "60px",
                      }}
                      required
                    />

                    <button
                      type="button"
                      className="register-password-button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <label className="register-terms">
                <input
                  type="checkbox"
                  required
                />

                <span>
                  I agree to the SFPMS{" "}
                  <a href="#terms">
                    Terms & Conditions
                  </a>{" "}
                  and Privacy Policy.
                </span>
              </label>

              <motion.button
                type="submit"
                className="register-submit"
                disabled={loading}
                whileHover={
                  loading
                    ? {}
                    : {
                        scale: 1.02,
                        y: -2,
                      }
                }
                whileTap={
                  loading
                    ? {}
                    : {
                        scale: 0.98,
                      }
                }
              >
                <span>
                  {loading
                    ? "Creating Account..."
                    : "Create Student Account"}
                </span>

                {!loading && (
                  <span className="register-arrow">
                    →
                  </span>
                )}
              </motion.button>
            </form>

            <div className="register-login-section">
              <span className="register-login-text">
                Already have an account?
              </span>

              <motion.div whileHover={{ x: -4 }}>
                <Link
                  to="/login"
                  className="register-login-link"
                >
                  Login to SFPMS
                </Link>
              </motion.div>
            </div>

            <div className="register-back-home">
              <Link to="/">
                Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="register-brand-side"
          style={{
            "--register-field-logo":
              "url('/image/egaz-logo.jpg')",
          }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            className="register-brand-content"
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
              src={fieldLogo}
              alt="Field Placement logo"
              className="register-logo"
              initial={{
                opacity: 0,
                scale: 0.5,
                rotate: 8,
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
                e.currentTarget.style.display = "none";
              }}
            />

            <motion.h1
              className="register-brand-title"
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
              className="register-brand-text"
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
              Create your student account and access
              the centralized field placement management
              platform.
            </motion.p>

            <motion.div
              className="register-brand-line"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{
                delay: 0.7,
                duration: 0.5,
              }}
            />

            <div className="register-benefits">
              <Benefit
                icon=""
                title="Student Account"
                text="Create your account and manage your field placement journey."
                delay={0.7}
              />

              <Benefit
                icon=""
                title="Placement Application"
                text="Submit and track your field placement application."
                delay={0.8}
              />

              <Benefit
                icon=""
                title="Centralized Management"
                text="Manage field placement information in one platform."
                delay={0.9}
              />
            </div>

            <motion.p
              className="register-brand-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              SFPMS
            </motion.p>

            <motion.p
              className="register-copyright"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              © 2026 SFPMS. All rights reserved.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

function RegisterInput({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="register-form-group">
      <label className="register-label">
        {label}
      </label>

      <div className="register-input-wrapper">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="register-input"
          required
        />
      </div>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
  delay,
}) {
  return (
    <motion.div
      className="register-benefit"
      initial={{
        opacity: 0,
        x: 25,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay,
        duration: 0.5,
      }}
    >
      <div className="register-benefit-icon">
        {icon}
      </div>

      <div>
        <strong className="register-benefit-title">
          {title}
        </strong>

        <p className="register-benefit-text">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export default Register;