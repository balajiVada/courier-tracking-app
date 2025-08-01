import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./TrackOrderPage.css";
import directionBro from "../assets/images/Directions-bro.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const statusSteps = [
  "Order Placed",
  "Package Collected",
  "In Transit",
  "Arrived at Destination Hub",
  "Out for Delivery",
  "Delivered",
];

const TrackOrderPage = () => {
  const { trackingId: routeTrackingId } = useParams();
  const navigate = useNavigate();

  const [trackingId, setTrackingId] = useState(routeTrackingId || "");
  const [orderData, setOrderData] = useState(null);
  const [statusData, setStatusData] = useState({});
  const [loading, setLoading] = useState(true);
  const [liveLat, setLiveLat] = useState(null);
  const [liveLng, setLiveLng] = useState(null);

  useEffect(() => {
    if (!routeTrackingId) {
      setLoading(false);
      return;
    }

    const newSocket = io("http://localhost:4000");

    newSocket.on("connect", () => {
      newSocket.emit("join_room", routeTrackingId);
    });

    newSocket.on("courier_location_update", (data) => {
      setLiveLat(data.latitude);
      setLiveLng(data.longitude);
    });

    newSocket.on("disconnect", () => {});

    const fetchOrder = async () => {
      try {
        const [orderRes, statusRes] = await Promise.all([
          fetch(`http://localhost:4000/api/orders/${routeTrackingId}`),
          fetch(`http://localhost:4000/api/orders/${routeTrackingId}/status-history`),
        ]);

        const orderJson = await orderRes.json();
        const statusJson = await statusRes.json();

        setOrderData(orderJson);
        setStatusData(statusJson);

        if (orderJson.current_latitude && orderJson.current_longitude) {
          setLiveLat(parseFloat(orderJson.current_latitude));
          setLiveLng(parseFloat(orderJson.current_longitude));
        }
      } catch (error) {
        console.error("Failed to fetch order or status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      newSocket.off("connect");
      newSocket.off("courier_location_update");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, [routeTrackingId]);

  const handleTrackNow = () => {
    if (trackingId.trim() !== "") {
      navigate(`/trackorderpage/${trackingId}`, { replace: true });
    }
  };

  if (!routeTrackingId) {
    return (
      <div className="to-dt">
        <div className="to-dt-container">
          <div className="to-dt-heading">Track your Package</div>
          <div className="to-dt-sub-container">
            <input
              type="text"
              id="to-dt-input"
              placeholder="Enter Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
            <button id="to-dt-btn" onClick={handleTrackNow}>
              Track now
            </button>
          </div>
        </div>
        <img src={directionBro} alt="" className="to-dt-image" />
      </div>
    );
  }

  if (loading) return <div className="loading-message">Loading order details...</div>;
  if (!orderData) return <div className="error-message">Order not found. Please check the tracking ID.</div>;

  const defaultMapCenter = [17.385, 78.4867];
  const mapCenter = liveLat && liveLng ? [liveLat, liveLng] : defaultMapCenter;
  const mapZoom = liveLat && liveLng ? 13 : 10;

  const isStatusCompleted = (status) => {
    const map = {
      "Order Placed": "order_placed_time",
      "Package Collected": "collected_time",
      "In Transit": "in_transit_time",
      "Arrived at Destination Hub": "arrived_at_hub_time",
      "Out for Delivery": "out_for_delivery_time",
      Delivered: "delivered_time",
    };
    return Boolean(statusData[map[status]]);
  };

  const latestCompletedIndex = statusSteps.reduce((latest, step, index) => {
    if (isStatusCompleted(step)) {
      return index;
    }
    return latest;
  }, -1);

  return (
    <div id="trackOrderPage">
      <div id="to-header">
        <h2>
          Tracking ID:{" "}
          <span className="tracking-id-value">{orderData.tracking_id}</span>
        </h2>
      </div>

      <div id="content-wrapper">
        <div id="to-order-info">
          <h3>Order Summary</h3>
          <hr />
          <div className="summary-section">
            <h4>Package Details</h4>
            <p><strong>Description:</strong> {orderData.package_description}</p>
            <p><strong>Weight:</strong> {orderData.package_weight} kg</p>
            <p><strong>Dimensions:</strong> {orderData.package_length}L x {orderData.package_width}W x {orderData.package_height}H cm</p>
            {orderData.special_instructions && (
              <p><strong>Instructions:</strong> {orderData.special_instructions}</p>
            )}
            <p><strong>Expected Delivery:</strong> {orderData.preferred_date} ({orderData.time_slot})</p>
            <p><strong>Delivery Type:</strong> {orderData.delivery_type}</p>
            <p className="total-amount"><strong>Total Amount:</strong> $1225.00</p>
          </div>

          <hr />

          <div className="summary-section">
            <h4>Receiver Information</h4>
            <p><strong>Name:</strong> {orderData.receiver_full_name}</p>
            <p><strong>Phone:</strong> {orderData.receiver_phone}</p>
            <p><strong>Address:</strong> {orderData.receiver_address}</p>
          </div>

          <hr />

          <div className="summary-section">
            <h4>Contact Support</h4>
            <p><strong>Phone:</strong> +1 800 123 4567</p>
            <p><strong>Email:</strong> admin@couriertrack.com</p>
          </div>
        </div>

        <div id="right-section">
          <div id="to-map">
            <h3>Current Location</h3>
            <hr />
            <div id="live-map">
              {liveLat !== null && liveLng !== null ? (
                <MapContainer
                  center={mapCenter}
                  zoom={17}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[liveLat, liveLng]}>
                    <Popup>Courier's Current Location</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="no-live-location">No live location available.</div>
              )}
            </div>
          </div>

          <div id="to-timeline">
            <h3>Delivery Timeline</h3>
            <hr />
            <div className="timeline-stepper">
              {statusSteps.map((step, index) => (
                <React.Fragment key={step}>
                  <div
                    className={`timeline-step ${
                      index <= latestCompletedIndex ? "completed" : ""
                    }`}
                  >
                    <div className="step-marker">
                      <div className="step-circle">{index + 1}</div>
                    </div>
                    <div className="step-content">
                      <p className="step-title">{step}</p>
                      {isStatusCompleted(step) && (
                        <small className="step-timestamp">
                          {new Date(
                            statusData[
                              {
                                "Order Placed": "order_placed_time",
                                "Package Collected": "collected_time",
                                "In Transit": "in_transit_time",
                                "Arrived at Destination Hub": "arrived_at_hub_time",
                                "Out for Delivery": "out_for_delivery_time",
                                Delivered: "delivered_time",
                              }[step]
                            ]
                          ).toLocaleString()}
                        </small>
                      )}
                    </div>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`step-line ${
                        index < latestCompletedIndex ? "completed" : ""
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
