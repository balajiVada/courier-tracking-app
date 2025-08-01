

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './UserProfile.css'; 

function UserProfile() {
  const [upUserId, setUpUserId] = useState(null);
  const [upUserData, setUpUserData] = useState(null);
  const [upOrdersData, setUpOrdersData] = useState([]);
  const [upIsEditing, setUpIsEditing] = useState(false);
  const [upEditFormData, setUpEditFormData] = useState({});
  const [upLoading, setUpLoading] = useState(true);
  const [upError, setUpError] = useState('');
  const [upMessage, setUpMessage] = useState(''); 

  const navigate = useNavigate(); 

  // Base URL for your backend API
  const API_BASE_URL = 'http://localhost:4000/api';

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUpUserId(parseInt(storedUserId, 10));
    } else {
      console.warn("No user_id found in localStorage. Defaulting to user_id 1 for demo purposes.");
      localStorage.setItem('user_id', '1');
      setUpUserId(1);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!upUserId) {
        setUpLoading(false);
        return;
      }

      setUpLoading(true);
      setUpError('');
      setUpMessage('');
      try {
        // Fetch User Data
        const userResponse = await axios.get(`${API_BASE_URL}/auth/user/${upUserId}`);
        const user = userResponse.data;
        if (user) {
          setUpUserData(user);
          setUpEditFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            address: user.address,
          });
        } else {
          setUpError('User data not found.');
        }

        // Fetch Orders Data
        const ordersResponse = await axios.get(`${API_BASE_URL}/orders/user/${upUserId}`);
        setUpOrdersData(ordersResponse.data);

      } catch (err) {
        console.error('up-Error fetching data:', err);
        setUpError('Failed to load profile data. Please ensure the backend is running and user_id is valid.');
      } finally {
        setUpLoading(false);
      }
    };

    loadData();
  }, [upUserId]);

  const handleEditToggle = () => {
    setUpIsEditing(!upIsEditing);
    if (upIsEditing && upUserData) {
      setUpEditFormData({
        first_name: upUserData.first_name,
        last_name: upUserData.last_name,
        email: upUserData.email,
        phone: upUserData.phone,
        address: upUserData.address,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpEditFormData({ ...upEditFormData, [name]: value });
  };

  const handleSave = async () => {
    setUpLoading(true);
    setUpError('');
    setUpMessage('');
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/user/${upUserId}`, upEditFormData);
      if (response.data.success) {
        setUpUserData(response.data.updatedUser);
        setUpIsEditing(false);
        setUpMessage('Profile updated successfully!');
      } else {
        setUpError(response.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('up-Error saving data:', err);
      setUpError('Failed to save profile data. Please try again.');
    } finally {
      setUpLoading(false);
    }
  };

  // Handler for the "Track" button
  const handleTrackOrder = (trackingId) => {
    navigate(`/trackorderpage/${trackingId}`);
  };

  if (upLoading) {
    return (
      <div className="up-loading-container up-bg-lighter-tan">
        <p className="up-loading-text">Loading profile...</p>
      </div>
    );
  }

  if (upError) {
    return (
      <div className="up-loading-container up-bg-lighter-tan">
        <p className="up-loading-text up-alert-error">{upError}</p>
      </div>
    );
  }

  if (!upUserData) {
    return (
      <div className="up-loading-container up-bg-lighter-tan">
        <p className="up-loading-text">User not found.</p>
      </div>
    );
  }

  return (
    <div className="up-min-h-screen up-flex-center up-bg-lighter-tan up-font-inter">
      <div className="up-main-container">
        {/* Header Section */}
        <div className="up-header-section">
          <h1 className="up-header-title">
            Hi, {upUserData.first_name}!
          </h1>
          <p className="up-header-subtitle">Welcome to your profile dashboard.</p>
        </div>

        {/* Messages */}
        {upMessage && (
          <div className="up-alert up-alert-success" role="alert">
            {upMessage}
          </div>
        )}
        {upError && (
          <div className="up-alert up-alert-error" role="alert">
            {upError}
          </div>
        )}

        {/* User Details Section */}
        <div className="up-details-section">
          <div className="up-details-header">
            <h2 className="up-details-title">Your Details</h2>
            <button
              onClick={handleEditToggle}
              className="up-edit-button"
            >
              {upIsEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {upIsEditing ? (
            <div className="up-details-grid">
              <div className="up-form-field">
                <label htmlFor="up-first-name" className="up-form-label">First Name</label>
                <input
                  type="text"
                  id="up-first-name"
                  name="first_name"
                  value={upEditFormData.first_name || ''}
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
                  value={upEditFormData.last_name || ''}
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
                  value={upEditFormData.email || ''}
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
                  value={upEditFormData.phone || ''}
                  onChange={handleChange}
                  className="up-form-input"
                />
              </div>
              <div className="up-form-field up-col-span-2">
                <label htmlFor="up-address" className="up-form-label">Address</label>
                <textarea
                  id="up-address"
                  name="address"
                  value={upEditFormData.address || ''}
                  onChange={handleChange}
                  rows="3"
                  className="up-form-textarea"
                ></textarea>
              </div>
              <div className="up-col-span-2 up-form-actions">
                <button
                  onClick={handleSave}
                  className="up-save-button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="up-details-grid">
              <p><strong>Full Name:</strong> {upUserData.full_name}</p>
              <p><strong>Email:</strong> {upUserData.email}</p>
              <p><strong>Phone:</strong> {upUserData.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {upUserData.address || 'N/A'}</p>
              <p><strong>Member Since:</strong> {new Date(upUserData.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Orders List Section */}
        <div className="up-orders-section">
          <h2 className="up-orders-title">Your Orders</h2>
          {upOrdersData.length > 0 ? (
            <div className="up-orders-table-container">
              <table className="up-orders-table">
                <thead>
                  <tr>
                    <th scope="col">Tracking ID</th>
                    <th scope="col">Receiver</th>
                    <th scope="col">Description</th>
                    <th scope="col">Status</th>
                    <th scope="col">Order Date</th>
                    <th scope="col">Actions</th> {/* New column header */}
                  </tr>
                </thead>
                <tbody>
                  {upOrdersData.map((order) => (
                    <tr key={order.id}>
                      <td className="up-font-medium">{order.tracking_id}</td>
                      <td className="up-text-gray">{order.receiver_full_name}</td>
                      <td className="up-text-gray">{order.package_description}</td>
                      <td>
                        <span className={`up-status-badge ${
                          order.current_status === 'Delivered' ? 'up-status-delivered' :
                          order.current_status === 'In Transit' ? 'up-status-in-transit' :
                          'up-status-other'
                        }`}>
                          {order.current_status}
                        </span>
                      </td>
                      <td className="up-text-gray">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleTrackOrder(order.tracking_id)}
                          className="up-track-button" // New button class for styling
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="up-no-orders-message">No orders placed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;