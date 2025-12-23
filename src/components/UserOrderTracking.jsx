/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/delivery/tracking.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API || "";

// eslint-disable-next-line react-refresh/only-export-components
const UserOrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState("");

  const mapContainer = useRef(null);
  const map = useRef(null);
  const deliveryMarker = useRef(null);
  const customerMarker = useRef(null);

  // 1) Fetch tracking data once
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        if (!orderId || !token) {
          setError("Missing order or auth information.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/order/tracking/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success) {
          setTracking(res.data.tracking);
        } else {
          setError("Failed to load tracking information.");
        }
      } catch (e) {
        console.error("Tracking fetch error:", e);
        setError("Unable to connect to tracking service.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId, token]);

  // Redirect after delivered
  useEffect(() => {
    if (tracking?.status === "DELIVERED") {
      const timeout = setTimeout(() => {
        navigate("/orders");
      }, 6500);
      return () => clearTimeout(timeout);
    }
  }, [tracking, navigate]);

  // 2) Initialize map – keep only zoom IN button
  useEffect(() => {
    if (!tracking || map.current || !mapContainer.current) return;

    const deliveryLng = tracking.deliveryPartnerLongitude ?? 77.5946;
    const deliveryLat = tracking.deliveryPartnerLatitude ?? 12.9716;

    const instance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [deliveryLng, deliveryLat],
      zoom: 15,
      minZoom: 14,
      maxZoom: 17,
      scrollZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    map.current = instance;

    // ✅ Add NavigationControl, then hide only the zoom-out button
    const nav = new mapboxgl.NavigationControl({
      showZoom: true,
      showCompass: false,
      visualizePitch: false,
    });
    instance.addControl(nav, "top-right");

    // Hide the "-" button (zoom-out) once control exists in DOM
    instance.on("load", () => {
      const zoomOut = document.querySelector(
        ".mapboxgl-ctrl-zoom-out"
      );
      if (zoomOut) {
        zoomOut.style.display = "none";
      }

      drawRoute(deliveryLng, deliveryLat);
    });

    // Markers
    deliveryMarker.current = new mapboxgl.Marker({
      color: "#10b981",
      scale: 1.2,
    })
      .setLngLat([deliveryLng, deliveryLat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          "<strong>🚚 Your Delivery Partner</strong>"
        )
      )
      .addTo(instance);

    if (
      typeof tracking.customerLongitude === "number" &&
      typeof tracking.customerLatitude === "number"
    ) {
      customerMarker.current = new mapboxgl.Marker({
        color: "#3b82f6",
        scale: 1,
      })
        .setLngLat([tracking.customerLongitude, tracking.customerLatitude])
        .setPopup(
          new mapboxgl.Popup().setHTML("<strong>🏠 Delivery Location</strong>")
        )
        .addTo(instance);
    }

    return () => {
      instance.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking]);

  // 3) SSE for real-time updates
  useEffect(() => {
    if (!orderId || !token) return;

    const es = new EventSource(
      `${
        import.meta.env.VITE_API_URL
      }/api/order/tracking/stream/${orderId}?token=${token}`
    );

    es.addEventListener("location-update", (e) => {
      try {
        const payload = JSON.parse(e.data);
        const { lat, lon } = payload;
        if (!map.current || !deliveryMarker.current) return;
        deliveryMarker.current.setLngLat([lon, lat]);
        drawRoute(lon, lat);
      } catch (err) {
        console.error("Failed to parse SSE location-update:", err);
      }
    });

    es.addEventListener("order-status", (e) => {
      setTracking((prev) =>
        prev ? { ...prev, status: e.data } : { status: e.data }
      );
    });

    

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      es.close();
    };

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  // 4) Draw or update route
  const drawRoute = async (lon, lat) => {
    if (!map.current || !tracking) return;
    if (
      typeof tracking.customerLongitude !== "number" ||
      typeof tracking.customerLatitude !== "number"
    )
      return;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon},${lat};${tracking.customerLongitude},${tracking.customerLatitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data.routes?.length) return;

      const route = data.routes[0];
      setDistance((route.distance / 1000).toFixed(2));
      setDuration(Math.round(route.duration / 60));

      const routeGeoJSON = {
        type: "Feature",
        geometry: route.geometry,
      };

      const instance = map.current;

      if (instance.getSource("route")) {
        instance.getSource("route").setData(routeGeoJSON);
      } else {
        instance.addSource("route", {
          type: "geojson",
          data: routeGeoJSON,
        });

        instance.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 6,
            "line-opacity": 0.8,
          },
        });
      }

      const bounds = new mapboxgl.LngLatBounds()
        .extend([lon, lat])
        .extend([tracking.customerLongitude, tracking.customerLatitude]);

      instance.fitBounds(bounds, {
        padding: 80,
        maxZoom: 16,
        duration: 800,
      });

      console.log("Tracking payload:", tracking);
    } catch (err) {
      console.error("Route drawing error:", err);
    }
  };

  // ✅ CALL DELIVERY PARTNER FUNCTION
  const callDeliveryPartner = () => {
    if (tracking?.deliveryPartnerMobile) {
      window.location.href = `tel:${tracking.deliveryPartnerMobile}`;
      
    } else {
      alert("Delivery partner contact not available.");
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PLACED: { icon: "📦", text: "Order Placed", color: "#f59e0b" },
      PICKED_UP: { icon: "🏪", text: "Picked Up", color: "#3b82f6" },
      DELIVERED: { icon: "✅", text: "Delivered", color: "#10b981" },
    };
    return statusMap[status] || {
      icon: "📦",
      text: status || "Unknown",
      color: "#6b7280",
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading tracking information...</p>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="error-container">
        <p className="error-message">{error || "Unable to load tracking."}</p>
        <button
          type="button"
          onClick={() => navigate("/myorders")}
          className="btn-back"
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(tracking.status);

  return (
    <div className="user-tracking-page">
      <div className="user-tracking-header">
        <button
          type="button"
          onClick={() => navigate("/myorders")}
          className="btn-back"
        >
          ← Back
        </button>
        <div className="header-content">
          <h2>Track Order #{orderId}</h2>
          <div
            className="status-pill"
            style={{ background: statusInfo.color }}
          >
            <span aria-hidden="true">{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </div>
        </div>
      </div>

      {/* ✅ CALL BUTTON IN DELIVERY PARTNER CARD */}
      {tracking.deliveryPersonName &&
        tracking.status !== "DELIVERED" && (
          <div className="delivery-info-card">
            <div className="info-header">
              <h3>🚚 Delivery Partner</h3>
            </div>

            <div className="info-grid">
              <div className="info-item-inline">
                <span className="info-icon" aria-hidden="true">
                  👤
                </span>
                <div>
                  <p className="info-label-small">Name</p>
                  <p className="info-value-small">
                    {tracking.deliveryPersonName}
                  </p>
                </div>
              </div>

              {tracking.deliveryMobile && (
                <div className="info-item-inline">
                  <span className="info-icon">📞</span>
                  <div>
                    <p className="info-label-small">Contact</p>
                    <button
                      className="action-btn call-btn"
                      type="button"
                      onClick={callDeliveryPartner}
                      style={{ marginTop: "6px" }}
                    >
                      Call Delivery Partner
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      <div ref={mapContainer} className="user-tracking-map" />

      
      {tracking.deliveryPartnerMobile && tracking.status !== "DELIVERED" && (
        <div>
          <button
            type="button"
            className="action-btn call-btn"
            style={{ width: "100%" }}
            onClick={callDeliveryPartner}
          >
            <span className="btn-icon" aria-hidden="true">
              📞
            </span>
            Call Delivery Partner
          </button>
        </div>
      )}

      
      <div className="timeline-container">
        <h3 className="timeline-title">Order Journey</h3>
        <div className="timeline">
          <div
            className={`timeline-item ${
              tracking.status === "PLACED" ||
              tracking.status === "PICKED_UP" ||
              tracking.status === "DELIVERED"
                ? "completed"
                : "active"
            }`}
          >
            <div className="timeline-marker">
              <span className="timeline-icon" aria-hidden="true">
                📦
              </span>
            </div>
            <div className="timeline-content">
              <h4>Order Placed</h4>
              <p>Your order has been confirmed.</p>
            </div>
          </div>


          <div
            className={`timeline-item ${
              tracking.status === "PICKED_UP" ||
              tracking.status === "DELIVERED"
                ? "completed"
                : tracking.status === "PLACED"
                ? "active"
                : ""
            }`}
          >
            <div className="timeline-marker">
              <span className="timeline-icon" aria-hidden="true">
                🏪
              </span>
            </div>
            <div className="timeline-content">
              <h4>Picked Up</h4>
              <p>Delivery partner collected your order.</p>
            </div>
          </div>


          <div
            className={`timeline-item ${
              tracking.status === "DELIVERED"
                ? "completed"
                : tracking.status === "PICKED_UP"
                ? "active"
                : ""
            }`}
          >
            <div className="timeline-marker">
              <span className="timeline-icon" aria-hidden="true">
                ✅
              </span>
            </div>
            <div className="timeline-content">
              <h4>Delivered</h4>
              <p>Order delivered to your location.</p>
            </div>
          </div>
        </div>
      </div>


      {tracking.status === "DELIVERED" ? (
        <div className="delivery-complete-card">
          <div className="complete-icon" aria-hidden="true">
            🎉
          </div>
          <h3>Order Delivered Successfully!</h3>
          <p>Thank you for shopping with us.</p>
        </div>
      ) : (
        <div className="delivery-info-card">
          <div className="info-header">
            <h3>📍 Delivery Details</h3>
          </div>
          <div className="info-grid">
            <div className="info-item-inline">
              <span className="info-icon" aria-hidden="true">
                🏠
              </span>
              <div>
                <p className="info-label-small">Delivery Address</p>
                <p className="info-value-small">
                  {tracking.customerAddress || "Address not available"}
                </p>
              </div>
            </div>
            {tracking.customerName && (
              <div className="info-item-inline">
                <span className="info-icon" aria-hidden="true">
                  👤
                </span>
                <div>
                  <p className="info-label-small">Customer Name</p>
                  <p className="info-value-small">{tracking.customerName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default UserOrderTracking;
