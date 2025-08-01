import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

function AdminProfilePage() {
  const [apUserId, setApUserId] = useState(null);
  const [apUserData, setApUserData] = useState(null);
  const [apAllOrdersData, setApAllOrdersData] = useState([]);
  const [apIsEditing, setApIsEditing] = useState(false);
  const [apEditFormData, setApEditFormData] = useState({});
  const [apLoading, setApLoading] = useState(true);
  const [apError, setApError] = useState("");
  const [apMessage, setApMessage] = useState("");

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:4000/api";

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setApUserId(parseInt(storedUserId, 10));
    } else {
      localStorage.setItem("user_id", "1");
      setApUserId(1);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!apUserId) {
        setApLoading(false);
        return;
      }

      setApLoading(true);
      setApError("");
      setApMessage("");
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/auth/user/${apUserId}`);
        const user = userResponse.data;
        if (user) {
          setApUserData(user);
          setApEditFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            address: user.address,
          });
        } else {
          setApError("User data not found for the provided ID.");
        }

        const allOrdersResponse = await axios.get(`${API_BASE_URL}/orders/all`);
        setApAllOrdersData(allOrdersResponse.data);
      } catch (err) {
        console.error("ap-Error fetching data:", err);
        setApError("Failed to load profile data. Please ensure the backend is running and user_id is valid.");
      } finally {
        setApLoading(false);
      }
    };

    loadData();
  }, [apUserId]);

  const handleEditToggle = () => {
    setApIsEditing(!apIsEditing);
    if (apIsEditing && apUserData) {
      setApEditFormData({
        first_name: apUserData.first_name,
        last_name: apUserData.last_name,
        email: apUserData.email,
        phone: apUserData.phone,
        address: apUserData.address,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApEditFormData({ ...apEditFormData, [name]: value });
  };

  const handleSave = async () => {
    setApLoading(true);
    setApError("");
    setApMessage("");
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/user/${apUserId}`, apEditFormData);
      if (response.data.success) {
        setApUserData(response.data.updatedUser);
        setApIsEditing(false);
        setApMessage("Profile updated successfully!");
      } else {
        setApError(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("ap-Error saving data:", err);
      setApError("Failed to save profile data. Please try again.");
    } finally {
      setApLoading(false);
    }
  };

  const handleTrackOrder = (trackingId) => {
    navigate(`/orderupdatepage/${trackingId}`);
  };

  if (apLoading) {
    return (
      <div className="up-loading-container up-bg-lighter-tan">
        <p className="up-loading-text">Loading profile...</p>
      </div>
    );
  }

  if (apError) {
    return (
      <div className="up-loading-container up-bg-lighter-tan">
        <p className="up-loading-text up-alert-error">{apError}</p>
      </div>
    );
  }

  if (!apUserData) {
    return (
      <div className="up-loading-container up-bg-lighter-tan">
        <p className="up-loading-text">User not found.</p>
      </div>
    );
  }

  return (
    <div className="up-min-h-screen up-flex-center up-bg-lighter-tan up-font-inter">
      <div className="up-main-container" id="admin-container">
        <div className="up-header-section">
          <h1 className="up-header-title">Hi, {apUserData.first_name}!</h1>
          <p className="up-header-subtitle">Welcome to your profile dashboard.</p>
        </div>

        {apMessage && <div className="up-alert up-alert-success" role="alert">{apMessage}</div>}
        {apError && <div className="up-alert up-alert-error" role="alert">{apError}</div>}

        <div className="up-details-section">
          <div className="up-details-header">
            <h2 className="up-details-title">Your Details</h2>
            <button onClick={handleEditToggle} className="up-edit-button">
              {apIsEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {apIsEditing ? (
            <div className="up-details-grid">
              <div className="up-form-field">
                <label htmlFor="up-first-name" className="up-form-label">First Name</label>
                <input
                  type="text"
                  id="up-first-name"
                  name="first_name"
                  value={apEditFormData.first_name || ""}
                  onChange={handleChange}
                  className="up-form-input"
                />
              </div>
              <div className="up-form-field">
                <label htmlFor="up-last-name" className="up-form-label">Last Name</label>
                <input
                  type="text"
                  id="up-last-name"
                  name="last_name"
                  value={apEditFormData.last_name || ""}
                  onChange={handleChange}
                  className="up-form-input"
                />
              </div>
              <div className="up-form-field">
                <label htmlFor="up-email" className="up-form-label">Email</label>
                <input
                  type="email"
                  id="up-email"
                  name="email"
                  value={apEditFormData.email || ""}
                  onChange={handleChange}
                  className="up-form-input"
                />
              </div>
              <div className="up-form-field">
                <label htmlFor="up-phone" className="up-form-label">Phone</label>
                <input
                  type="text"
                  id="up-phone"
                  name="phone"
                  value={apEditFormData.phone || ""}
                  onChange={handleChange}
                  className="up-form-input"
                />
              </div>
              <div className="up-form-field up-col-span-2">
                <label htmlFor="up-address" className="up-form-label">Address</label>
                <textarea
                  id="up-address"
                  name="address"
                  value={apEditFormData.address || ""}
                  onChange={handleChange}
                  rows="3"
                  className="up-form-textarea"
                ></textarea>
              </div>
              <div className="up-col-span-2 up-form-actions">
                <button onClick={handleSave} className="up-save-button">Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="up-details-grid">
              <p><strong>Full Name:</strong> {apUserData.full_name}</p>
              <p><strong>Email:</strong> {apUserData.email}</p>
              <p><strong>Phone:</strong> {apUserData.phone || "N/A"}</p>
              <p><strong>Address:</strong> {apUserData.address || "N/A"}</p>
              <p><strong>Member Since:</strong> {new Date(apUserData.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div className="up-orders-table-container" id="admin-orders-table-container">
          <div className="up-table-wrapper">
            <table className="up-orders-table" id="admin-orders-table">
              <thead>
                <tr>
                  <th scope="col">Tracking ID</th>
                  <th scope="col">Sender Name</th>
                  <th scope="col">Receiver</th>
                  <th scope="col">Description</th>
                  <th scope="col">Status</th>
                  <th scope="col">Order Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apAllOrdersData.map((order) => (
                  <tr key={order.id}>
                    <td className="up-font-medium">{order.tracking_id}</td>
                    <td className="up-text-gray">{order.sender_full_name}</td>
                    <td className="up-text-gray">{order.receiver_full_name}</td>
                    <td className="up-text-gray">{order.package_description}</td>
                    <td>
                      <span className={`up-status-badge ${
                        order.current_status === "Delivered"
                          ? "up-status-delivered"
                          : order.current_status === "In Transit"
                          ? "up-status-in-transit"
                          : "up-status-other"
                      }`}>
                        {order.current_status}
                      </span>
                    </td>
                    <td className="up-text-gray">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleTrackOrder(order.tracking_id)}
                        className="up-edit-button"
                        style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;
