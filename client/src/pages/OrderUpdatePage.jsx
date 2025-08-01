import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./OrderUpdatePage.css"; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const stages = [
  "Order Placed",
  "Package Collected",
  "In Transit",
  "Arrived at Destination Hub",
  "Out for Delivery",
  "Delivered",
];

const OrderUpdatePage = () => {
  const { trackingId: trackingIdParam } = useParams();
  const [trackingId, setTrackingId] = useState(trackingIdParam || "");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentStatusIndex, setCurrentStatusIndex] = useState(-1);
  const [message, setMessage] = useState("");
  const [statusVisible, setStatusVisible] = useState(false);
  const [socket, setSocket] = useState(null);

  const [adminLiveLat, setAdminLiveLat] = useState(17.385);
  const [adminLiveLng, setAdminLiveLng] = useState(78.4867);
  const [mapZoom, setMapZoom] = useState(10);
  const [geolocationStatus, setGeolocationStatus] = useState("Location sharing not started.");
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setMessage("Connected to server. Use buttons to control location sharing.");
    });

    newSocket.on("disconnect", () => {
      setMessage("Disconnected from server.");
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
        setIsSharingLocation(false);
        setGeolocationStatus("Disconnected from server, location sharing stopped.");
      }
    });

    return () => {
      newSocket.disconnect();
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (trackingIdParam) {
      handleTrack({ preventDefault: () => {} });
    }
  }, [trackingIdParam]);

  useEffect(() => {
    if (!isSharingLocation) return;

    if (!navigator.geolocation) {
      setGeolocationStatus("Geolocation is not supported.");
      setIsSharingLocation(false);
      return;
    }

    setGeolocationStatus("Requesting geolocation permission...");
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAdminLiveLat(latitude);
        setAdminLiveLng(longitude);
        setMapZoom(16);
        setGeolocationStatus(`Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`);

        if (socket?.connected && trackingId) {
          socket.emit("admin_location_update", {
            trackingId,
            latitude,
            longitude,
          });
        }
      },
      (error) => {
        let msg = "Geolocation error: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg += "Permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg += "Position unavailable.";
            break;
          case error.TIMEOUT:
            msg += "Timeout.";
            break;
          default:
            msg += "Unknown error.";
        }
        setGeolocationStatus(msg);
        setIsSharingLocation(false);
        if (watchId.current) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [isSharingLocation, trackingId, socket]);

  const handleTrack = async (e) => {
    e.preventDefault();
    try {
      const orderRes = await axios.get(`http://localhost:4000/api/orders/${trackingId}`);
      const orderData = orderRes.data;

      const statusRes = await axios.get(`http://localhost:4000/api/orders/status/${trackingId}`);
      const currentOrderStatus = statusRes.data.status;

      const index = stages.indexOf(currentOrderStatus);
      setCurrentStatusIndex(index);
      setSelectedStatus(currentOrderStatus);
      setStatusVisible(true);
      setMessage(`Order ${trackingId} tracked. Current status: ${currentOrderStatus}`);

      if (orderData.current_latitude && orderData.current_longitude) {
        setAdminLiveLat(parseFloat(orderData.current_latitude));
        setAdminLiveLng(parseFloat(orderData.current_longitude));
        setMapZoom(13);
        setGeolocationStatus("Last saved location displayed.");
      } else {
        setMessage(`No previous location saved for order ${trackingId}.`);
      }
    } catch (err) {
      setStatusVisible(false);
      setMessage("Tracking failed: " + (err.response?.data?.message || "Server error."));
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/orders/update-status", {
        tracking_id: trackingId,
        new_status: selectedStatus,
      });
      setMessage(res.data.message);
      handleTrack({ preventDefault: () => {} });
    } catch {
      setMessage("Update failed");
    }
  };

  const handleStartSharing = () => {
    if (!trackingId) {
      setMessage("Please track an order before sharing location.");
      return;
    }
    setIsSharingLocation(true);
  };

  const handleStopSharing = () => {
    setIsSharingLocation(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setGeolocationStatus("Location sharing stopped.");
  };

  const progressLineWidth =
    currentStatusIndex !== -1 ? (currentStatusIndex / (stages.length - 1)) * 100 : 0;

  return (
    <div className="admin-dashboard-container">
      <h2 className="dashboard-title">Shipment Status Management</h2>

      {!trackingIdParam && (
        <div className="card track-order-card">
          <form className="track-form" onSubmit={handleTrack}>
            <input
              type="text"
              placeholder="Enter Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Track</button>
          </form>
        </div>
      )}

      {message && <p className="status-message">{message}</p>}

      {statusVisible && (
        <div className="card status-update-card">
          <h3 className="card-title">Update Status for: <span>{trackingId}</span></h3>

          <div className="progress-timeline">
            <div className="timeline-base-line"></div>
            <div className="timeline-progress-line" style={{ width: `${progressLineWidth}%` }}></div>
            {stages.map((stage, index) => (
              <div key={index} className={`timeline-stage ${index <= currentStatusIndex ? "completed" : ""}`}>
                <div className="stage-circle">{index + 1}</div>
                <p className="stage-label">{stage}</p>
              </div>
            ))}
          </div>

          <div className="status-controls">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentStatusIndex(stages.indexOf(e.target.value));
              }}
              className="status-select"
            >
              {stages.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button className="btn btn-secondary" onClick={handleStatusUpdate}>
              Update Status
            </button>
          </div>

          <div className="card map-section">
            <h3>Admin's Live Location</h3>
            <p>{geolocationStatus}</p>

            <div className="location-buttons">
              {!isSharingLocation ? (
                <button className="btn btn-primary" onClick={handleStartSharing}>
                  Start Sharing Live Location
                </button>
              ) : (
                <button className="btn btn-danger" onClick={handleStopSharing}>
                  Stop Sharing Live Location
                </button>
              )}
            </div>

            <MapContainer
              center={[adminLiveLat, adminLiveLng]}
              zoom={17}
              scrollWheelZoom={true}
              className="admin-map-container"
              key={`${adminLiveLat}-${adminLiveLng}-${mapZoom}`}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[adminLiveLat, adminLiveLng]}>
                <Popup>Admin's Current Live Location</Popup>
              </Marker>
            </MapContainer>

            {(isSharingLocation || adminLiveLat !== 17.385 || adminLiveLng !== 78.4867) && (
              <p className="coordinates-info">
                Lat: {adminLiveLat.toFixed(6)}, Lng: {adminLiveLng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderUpdatePage;