import React from "react";
import { Outlet, Link } from "react-router-dom";
import "./AuthLayout.css";
import shippingImg from "../../assets/images/Take Away-pana.png";

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="design">
        <img src={shippingImg} alt="delivery-guy-image" />
        <p id="subtext">
          "Fast. Trusted. Easy. Track your packages in real-time."
        </p>
      </div>
      <div className="auth">
        {/* <img src={ctkLogo} alt="easy track" id="logo" /> */}
        <Link to="/landingpage">
          <h1>Easy Track</h1>
        </Link>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
