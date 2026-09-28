import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import egazLogo from "../../assets/egaz1.png";
import "./Home.css";


function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    const elements = document.querySelectorAll(".scroll-animate");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [loading]);

  
  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-content">

          <img
            src={egazLogo}
            alt="eGAZ Logo"
            className="loader-logo-image"
          />

          <h4>SFPMS</h4>

          <p>
            Student Field Placement
            <br /> <br />
            Management System
          </p>

          <div className="loader-spinner"></div>

        </div>
      </div>
    );
  }

  return (
    <div className="home-page">

      
      <Navbar />


      <section className="home-hero">

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-home-wrapper">


          <div className="hero-left">

            <div className="egaz-brand">

              <img
                src={egazLogo}
                alt="eGAZ Logo"
                className="egaz-logo"
              />

              <div className="egaz-name">

                <h3>
                  eGAZ
                </h3>

                <span>
                  eGovernment Authority
                </span>

              </div>

            </div>


            <div className="hero-badge">

              <span className="status-dot"></span>

              Student Field Placement Platform

            </div>


            <h1 className="hero-title">

              Manage Your Field Placement

              With Confidence

            </h1>


            <p className="hero-description">

              SFPMS helps students manage applications,
              placements, attendance, daily logbooks,
              reports and field activities from one
              simple and modern platform.

            </p>


            <div className="hero-buttons">

              <Link
                to="/student/register"
                className="btn btn-primary hero-btn"
              >

                Get Started

                <span className="btn-arrow">
                  
                </span>

              </Link>


              <Link
                to="/student/login"
                className="btn btn-outline-primary hero-btn-outline"
              >

                Student Login

              </Link>

            </div>


            <div className="hero-trust">


              <div>

                <strong>
                  Student Friendly
                </strong>

                <small>
                  Everything you need for field placement
                </small>

              </div>

            </div>

          </div>

        </div>


        <div className="scroll-indicator">

          <span></span>

          Scroll to explore

        </div>

      </section>


      <section className="stats-section">

        <div className="container">

          <div className="row g-3">

            <div className="col-6 col-lg-3">

              <div className="stat-card">

                <h3>
                  Students
                </h3>

                <p>
                  Manage your field placement journey
                </p>

              </div>

            </div>


            <div className="col-6 col-lg-3">

              <div className="stat-card">

                <h3>
                  Organizations
                </h3>

                <p>
                  Connect with placement organizations
                </p>

              </div>

            </div>


            <div className="col-6 col-lg-3">

              <div className="stat-card">
                <h3>
                  Applications
                </h3>

                <p>
                  Track your placement applications
                </p>

              </div>

            </div>


            <div className="col-6 col-lg-3">

              <div className="stat-card">

                <h3>
                  Reports
                </h3>

                <p>
                  Manage and submit field reports
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section id="about" className="about-section">

        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-6">

              <div className="scroll-animate">

                <span className="section-label">
                  ABOUT SFPMS
                </span>

                <h2 className="section-title">

                  Your Complete

                  <span>
                    {" "}Field Placement{" "}
                  </span>

                  Companion

                </h2>

                <p className="section-description">

                  SFPMS is designed to simplify the
                  entire field placement process.
                  Students can manage applications,
                  placements, attendance, daily activities,
                  supervisors and final reports in one place.

                </p>

                <p className="section-description">

                  Instead of using multiple systems,
                  documents and manual records, everything
                  is organized through one modern platform.

                </p>

                <Link
                  to="/student/register"
                  className="learn-more"
                >

                  Start Your Journey

                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>


      <section id="features" className="features-section">

        <div className="container">

          <div className="section-heading text-center scroll-animate">

            <span className="section-label">
              FEATURES
            </span>

            <h2 className="section-title">
              Everything You Need
            </h2>

            <p>
              Powerful tools designed to make field
              placement easier and more organized.
            </p>

          </div>


          <div className="row g-4 mt-4">


            <div className="col-sm-6 col-lg-4">

              <div className="feature-card scroll-animate">

                <h4>
                  Daily Logbook
                </h4>

                <p>
                  Record daily field activities,
                  experiences and tasks completed
                  during your placement.
                </p>

                <Link
                  to="/learn-more/daily"
                  className="feature-link"
                >
                  Learn More
                </Link>

              </div>

            </div>


            <div className="col-sm-6 col-lg-4">

              <div className="feature-card scroll-animate">

                <h4>
                  Attendance
                </h4>

                <p>
                  Track attendance and monitor
                  your field placement participation.
                </p>

                <Link
                  to="/learn-more/attendance"
                  className="feature-link"
                >
                  Learn More
                </Link>

              </div>

            </div>


            <div className="col-sm-6 col-lg-4">

              <div className="feature-card scroll-animate">

                <h4>
                  Reports
                </h4>

                <p>
                  Create, manage and submit your
                  field placement reports digitally.
                </p>

                <Link
                  to="/learn-more/reports"
                  className="feature-link"
                >
                  Learn More
                </Link>

              </div>

            </div>


            <div className="col-sm-6 col-lg-4">

              <div className="feature-card scroll-animate">

                <h4>
                  Applications
                </h4>

                <p>
                  Submit placement applications and
                  track their progress from your dashboard.
                </p>

                <Link
                  to="/learn-more/applications"
                  className="feature-link"
                >
                  Learn More
                </Link>

              </div>

            </div>

            <div className="col-sm-6 col-lg-4">

              <div className="feature-card scroll-animate">

                <h4>
                  Organizations
                </h4>

                <p>
                  Discover and manage organizations
                  where students complete field placement.
                </p>

                <Link
                  to="/learn-more/organizations"
                  className="feature-link"
                >
                  Learn More
                </Link>

              </div>

            </div>

            <div className="col-sm-6 col-lg-4">

              <div className="feature-card scroll-animate">

                <h4>
                  Supervisors
                </h4>

                <p>
                  Stay connected with supervisors
                  and receive field placement guidance.
                </p>

                <Link
                  to="/learn-more/supervisors"
                  className="feature-link"
                >
                  Learn More
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>


      <section id="how-it-works" className="how-it-works">

        <div className="container">

          <div className="section-heading text-center scroll-animate">

            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2 className="section-title">
              Simple. Fast. Organized.
            </h2>

            <p>
              Follow a few simple steps to manage
              your entire field placement.
            </p>

          </div>


          <div className="row g-4 mt-4">


            <div className="col-sm-6 col-lg-3">

              <div className="step-card scroll-animate">

                <span className="step-number">
                  01
                </span>

                <h5>
                  Create Account
                </h5>

                <p>
                  Register your student account
                  and complete your profile.
                </p>

              </div>

            </div>


            <div className="col-sm-6 col-lg-3">

              <div className="step-card scroll-animate">

                <span className="step-number">
                  02
                </span>


                <h5>
                  Apply
                </h5>

                <p>
                  Submit your field placement
                  application through the system.
                </p>

              </div>

            </div>


            <div className="col-sm-6 col-lg-3">

              <div className="step-card scroll-animate">

                <span className="step-number">
                  03
                </span>

                <h5>
                  Get Placement
                </h5>

                <p>
                  Receive your organization and
                  supervisor placement information.
                </p>

              </div>

            </div>


  
            <div className="col-sm-6 col-lg-3">

              <div className="step-card scroll-animate">

                <span className="step-number">
                  04
                </span>

                <h5>
                  Complete Placement
                </h5>

                <p>
                  Record attendance, logbooks and
                  submit your final field report.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      <section className="cta-section">

        <div className="cta-glow"></div>

        <div className="container">

          <div className="cta-content text-center">

            <span className="cta-badge">
              READY TO START?
            </span>

            <h2>

              Take Control of Your

              <span>
                {" "}Field Placement
              </span>

            </h2>

            <p>

              Join SFPMS and manage your student
              field placement experience from one
              modern platform.

            </p>

            <Link
              to="/student/register"
              className="cta-button"
            >

              Create Student Account

              <span>
                
              </span>

            </Link>

          </div>

        </div>

      </section>


      <footer className="footer">

        <div className="container">

          <div className="row g-5">


            <div className="col-lg-5">

              <div className="footer-logo">

                SFPMS

              </div>

              <p>

                Student Field Placement Management
                System designed to simplify and
                modernize field placement management.

              </p>

            </div>


            <div className="col-6 col-lg-2">

              <h6>
                System
              </h6>

                <p>Dashboard</p>
                
                <p>Application</p>

                <p>Placement</p>

                <p>Attendance</p>
            </div>


            <div className="col-6 col-lg-2">

              <h6>
                Resources
              </h6>

                <p>Logbook</p>

                 <p>Reports</p>

                <p>Supervisor</p>

                <p>Profile</p>

            </div>


            <div className="col-12 col-lg-3">

              <h6>
                Account
              </h6>

              <Link to="/student/login">
                Login
              </Link>

              <Link to="/student/register">
                Register
              </Link>

            </div>

          </div>


          <hr />


          <div className="footer-bottom">

            <span>
              © {new Date().getFullYear()} SFPMS.
              All rights reserved.
            </span>

            <span>
              Student Field Placement Management System
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;


