import { useState } from "react";
import { Link } from "react-router-dom";
import fieldLogo from "../assets/field-logo-transparent.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar navbar-expand-lg shadow-sm sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={fieldLogo}
            alt="Government Zanzibar"
            className="navbar-logo"
          />
          <div className="ms-2">
            <strong>Student Field Placement <br></br> Management System</strong>
            <small className="text-muted d-block">SFPMS</small>
          </div>
        </Link>

        <button
          type="button"
          className="navbar-toggler"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`navbar-nav ms-auto${menuOpen ? " is-open" : ""}`}>
          <Link className="nav-link" to="/" onClick={closeMenu}>Home</Link>
          <a className="nav-link" href="#about" onClick={closeMenu}>About</a>
          <a className="nav-link" href="#features" onClick={closeMenu}>Features</a>
          <a className="nav-link" href="#how-it-works" onClick={closeMenu}>How It Works</a>
          <Link className="btn btn-outline-primary ms-2" to="/login" onClick={closeMenu}>Login</Link>
          <Link className="btn btn-primary ms-2" to="/register" onClick={closeMenu}>Register</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;