import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import trackImage from '../assets/images/Delivery-amico.png'; // Make sure this path is correct

const LandingPage = () => {
  const [trackingId, setTrackingId] = useState("");
  const navigate = useNavigate();

  const handleTrackNow = () => {
    if (trackingId.trim() !== "") {
      navigate(`/trackorderpage/${trackingId}`);
    }
  };

  return (
    <div className="landing-page-wrapper"> {/* Added a wrapper for overall page background */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="h-heading-1">Fast Reliable Courier</div>
          <div className="h-heading-2">Tracking System</div>
          <div className="h-subheading">
            Streamlined package delivery with real-time tracking, secure
            management, and seamless communication between senders, receivers
          </div>
        </div>
        <div className="hero-image-container">
          <img src={trackImage} alt="Delivery illustration" className="hero-illustration" />
        </div>
      </div>

      <div className="direct-track-container">
        <div className="dt-heading">Track your Package</div>
        <div className="dt-sub-container">
          <input
            type="text"
            id="dt-input"
            placeholder="Enter Tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <button id="dt-btn" onClick={handleTrackNow}>
            Track now
          </button>
        </div>
      </div>

      <div className="website-info-container">
        <div className="website-info" id="info-1">
          <h1>Real-time Tracking</h1>
          <p>
            Live location updates and delivery status throughout the journey
          </p>
        </div>
        <div className="website-info" id="info-2">
          <h1>Fast Processing</h1>
          <p>Quick order placement and efficient admin management system</p>
        </div>
        <div className="website-info" id="info-3">
          <h1>Analytics Dashboard</h1>
          <p>
            Comprehensive insights and reporting tools to optimize your shipping
            patterns and costs.
          </p>
        </div>
        <div id="info-objective">
          <h3>Why choose Easy Track ?</h3>
        </div>
        <div className="website-info" id="info-4">
          <h1>Fast Processing</h1>
          <p>Quick order placement and efficient management system</p>
        </div>
      </div>

      <div className="growth-container">
        <div className="growth">
          <h1>50k+</h1>
          <p>Packages Delivered</p>
        </div>
        <div className="growth">
          <h1>98.3%</h1>
          <p>Success Rate</p>
        </div>
        <div className="growth">
          <h1>24/7</h1>
          <p>Support</p>
        </div>
      </div>

      <div className="final-place-order-container">
        <h2>Ready to Transform Your Shipping Experience?</h2>
        <p>
          Start by sending your first package with EasyTrack — fast, reliable,
          and hassle-free courier booking at your fingertips.
        </p>
        <button onClick={() => navigate("/placeorderpage")}>place order</button>
      </div>
    </div>
  );
};

export default LandingPage;