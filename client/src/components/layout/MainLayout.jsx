import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/images/logo.png";
import "./MainLayout.css";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null); 

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      const isAdmin = parseInt(userId, 10) === 11;
      setUserType(isAdmin ? "admin" : "customer");
    }
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user_id");
    navigate("/landingpage");
  };

  const handleProfileNavigation = () => {
    if (userType === "admin") {
      navigate("/adminprofile");
    } else if (userType === "customer") {
      navigate("/userprofile");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="main-layout">
      <header>
        <div>
          <Link to="/landingpage">
            <h1>Easy Track</h1>
          </Link>
        </div>
        <div className="navigation-bar">
          <Link to="/trackorderpage">
            <button>Track Package</button>
          </Link>
          <Link to="/placeorderpage">
            <button>Place Order</button>
          </Link>
          <button onClick={handleProfileNavigation}>Profile</button>
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login">
              <button>Login</button>
            </Link>
          )}
        </div>
      </header>

      <Outlet />

      <footer>
        <h3>Easy Track</h3>
        <p>
          Revolutionizing package delivery with smart technology and exceptional
          service.
        </p>
        <div className="footer-sections">
          <div className="sub-section">
            <h4>Platform</h4>
            <p>Sender Portal</p>
            <p>Receiver Portal</p>
            <p>Admin Dashboard</p>
            <p>Track Package</p>
          </div>
          <div className="sub-section">
            <h4>Company</h4>
            <p>About us</p>
            <p>Careers</p>
            <p>Blog</p>
            <p>Press</p>
          </div>
          <div className="sub-section">
            <h4>Support</h4>
            <p>Help Center</p>
            <p>Contact Us</p>
            <p>API Documentation</p>
            <p>System Status</p>
          </div>
        </div>
        <div className="footer-end">
          <h4>© 2025 EasyTrack. All rights reserved.</h4>
          <p>Privacy Policy</p>
          <p>Terms of Service</p>
          <p>Cookie Policy</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
