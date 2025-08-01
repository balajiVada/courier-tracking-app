import React, { useState } from "react";
import axios from "axios";
import "./PlaceOrderPage.css"; // This CSS will be updated

const PlaceOrderPage = () => {
  const [formData, setFormData] = useState({
    sFullName: "",
    sEmail: "",
    sPhoneNumber: "",
    sAddress: "",
    rFullName: "",
    rEmail: "",
    rPhoneNumber: "",
    rAddress: "",
    pDescription: "",
    pWeight: "",
    pLength: "",
    pWidth: "",
    pHeight: "",
    pInstructions: "",
    prefDate: "",
    timeSlot: "",
    deliveryType: ""
  });

  const [status, setStatus] = useState(null); // success | error | null
  const [trackingId, setTrackingId] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = localStorage.getItem('user_id');
      const orderInfo = {
        ...formData,
        user_id: user
      };

      const res = await axios.post("http://localhost:4000/api/orders/place", orderInfo);
      setTrackingId(res.data.tracking_id);
      setStatus("success");
    } catch (error) {
      console.error("Error placing order:", error);
      setStatus("error");
    }
  };

  return (
    <div id="placeOrderPage">
      {status === null && (
        <form id="order-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <div className="form-line"></div>
            <h2>Place Your Order</h2>
            <div className="form-line"></div>
          </div>

          <div className="form-sections-grid">
            {/* Sender Information */}
            <div className="form-section">
              <h3>Sender Information</h3>
              <div className="form-field">
                <label htmlFor="sFullName">Full Name</label>
                <input type="text" id="sFullName" name="sFullName" value={formData.sFullName} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="sEmail">Email</label>
                <input type="email" id="sEmail" name="sEmail" value={formData.sEmail} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="sPhoneNumber">Phone Number</label>
                <input type="tel" id="sPhoneNumber" name="sPhoneNumber" value={formData.sPhoneNumber} onChange={handleChange} required />
              </div>
              <div className="form-field full-width">
                <label htmlFor="sAddress">Full Address</label>
                <textarea id="sAddress" name="sAddress" value={formData.sAddress} onChange={handleChange} rows="3" required></textarea>
              </div>
            </div>

            {/* Receiver Information */}
            <div className="form-section">
              <h3>Receiver Information</h3>
              <div className="form-field">
                <label htmlFor="rFullName">Full Name</label>
                <input type="text" id="rFullName" name="rFullName" value={formData.rFullName} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="rEmail">Email</label>
                <input type="email" id="rEmail" name="rEmail" value={formData.rEmail} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="rPhoneNumber">Phone Number</label>
                <input type="tel" id="rPhoneNumber" name="rPhoneNumber" value={formData.rPhoneNumber} onChange={handleChange} required />
              </div>
              <div className="form-field full-width">
                <label htmlFor="rAddress">Full Address</label>
                <textarea id="rAddress" name="rAddress" value={formData.rAddress} onChange={handleChange} rows="3" required></textarea>
              </div>
            </div>

            {/* Package Details */}
            <div className="form-section">
              <h3>Package Details</h3>
              <div className="form-field full-width">
                <label htmlFor="pDescription">Package Description</label>
                <input type="text" id="pDescription" name="pDescription" value={formData.pDescription} onChange={handleChange} required />
              </div>
              <div className="form-field-group">
                <div className="form-field">
                  <label htmlFor="pWeight">Weight (kg)</label>
                  <input type="number" id="pWeight" name="pWeight" value={formData.pWeight} onChange={handleChange} step="0.1" min="0" required />
                </div>
                <div className="form-field">
                  <label htmlFor="pLength">Length (cm)</label>
                  <input type="number" id="pLength" name="pLength" value={formData.pLength} onChange={handleChange} step="0.1" min="0" required />
                </div>
              </div>
              <div className="form-field-group">
                <div className="form-field">
                  <label htmlFor="pWidth">Width (cm)</label>
                  <input type="number" id="pWidth" name="pWidth" value={formData.pWidth} onChange={handleChange} step="0.1" min="0" required />
                </div>
                <div className="form-field">
                  <label htmlFor="pHeight">Height (cm)</label>
                  <input type="number" id="pHeight" name="pHeight" value={formData.pHeight} onChange={handleChange} step="0.1" min="0" required />
                </div>
              </div>
              <div className="form-field full-width">
                <label htmlFor="pInstructions">Special Instructions</label>
                <textarea id="pInstructions" name="pInstructions" value={formData.pInstructions} onChange={handleChange} rows="3"></textarea>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="form-section">
              <h3>Delivery Options</h3>
              <div className="form-field">
                <label htmlFor="prefDate">Preferred Delivery Date</label>
                <input type="date" id="prefDate" name="prefDate" value={formData.prefDate} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="timeSlot">Time Slot</label>
                <select id="timeSlot" name="timeSlot" value={formData.timeSlot} onChange={handleChange} required>
                  <option value="">Select a time slot</option>
                  <option value="9AM-12PM">9:00 AM - 12:00 PM</option>
                  <option value="12PM-3PM">12:00 PM - 3:00 PM</option>
                  <option value="3PM-6PM">3:00 PM - 6:00 PM</option>
                  <option value="6PM-9PM">6:00 PM - 9:00 PM</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="deliveryType">Delivery Type</label>
                <select id="deliveryType" name="deliveryType" value={formData.deliveryType} onChange={handleChange} required>
                  <option value="">Select delivery type</option>
                  <option value="standard">Standard Delivery</option>
                  <option value="express">Express Delivery</option>
                  <option value="same-day">Same-Day Delivery</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" id="order-submit-btn">
            Place Order
          </button>
        </form>
      )}

      {status === "success" && (
        <div className="result-message success">
          <h2>Order Placed Successfully!</h2>
          <p>Your Tracking ID:</p>
          <p className="tracking-id-display"><strong>{trackingId}</strong></p>
          <button onClick={() => setStatus(null)} className="return-button">Place Another Order</button>
        </div>
      )}

      {status === "error" && (
        <div className="result-message error">
          <h2>Order Placement Failed</h2>
          <p>There was an issue processing your order. Please check your details and try again.</p>
          <button onClick={() => setStatus(null)} className="return-button">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default PlaceOrderPage;