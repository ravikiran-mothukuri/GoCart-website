import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AuthContext } from "../pages/AuthContext";
import "../styles/delivery/tracking.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API || "";

// eslint-disable-next-line react-refresh/only-export-components
const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { deliveryToken } = useContext(AuthContext);

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState("");

  const isPicked = tracking?.status === "PICKED_UP";

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const deliveryMarker = useRef(null);
  const customerMarker = useRef(null);
  const intervalRef = useRef(null);

  // 1) Fetch order tracking details
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        if (!orderId || !deliveryToken) return;
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/delivery/tracking/${orderId}`,
          { headers: { Authorization: `Bearer ${deliveryToken}` } }
        );
        if (res.data?.success) {
          setTracking(res.data.tracking);
        } else {
          setError("Unable to load tracking information.");
        }
      } catch (err) {
        console.error("Failed to fetch tracking:", err);
        setError("Failed to fetch tracking information.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId, deliveryToken]);

  // 2) Initialize map ONCE when we have tracking
  useEffect(() => {
    if (!tracking || !mapContainer.current || mapRef.current) return;

    const deliveryLng = tracking.deliveryPartnerLongitude ?? 77.5946;
    const deliveryLat = tracking.deliveryPartnerLatitude ?? 12.9716;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [deliveryLng, deliveryLat],
      zoom: 13,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    deliveryMarker.current = new mapboxgl.Marker({ color: "#10b981" })
      .setLngLat([deliveryLng, deliveryLat])
      .setPopup(new mapboxgl.Popup().setHTML("<strong>📍 Your Location</strong>"))
      .addTo(map);

    if (
      typeof tracking.customerLongitude === "number" &&
      typeof tracking.customerLatitude === "number"
    ) {
      customerMarker.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([tracking.customerLongitude, tracking.customerLatitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>🏠 ${tracking.customerName || "Customer"}</strong><br/>${
              tracking.customerAddress || ""
            }`
          )
        )
        .addTo(map);
    }

    map.on("load", () => {
      drawRoute(deliveryLng, deliveryLat);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking]);

  // 3) GPS updates — only after picked up
  useEffect(() => {
    if (!deliveryToken || !orderId || !mapRef.current || !isPicked) return;

    intervalRef.current = setInterval(() => {
      if (!("geolocation" in navigator)) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          if (deliveryMarker.current) {
            deliveryMarker.current.setLngLat([longitude, latitude]);
          }
          drawRoute(longitude, latitude);

          axios
            .put(
              `${import.meta.env.VITE_API_URL}/api/delivery/tracking/update-location/${orderId}`,
              { lat: latitude, lon: longitude },
              { headers: { Authorization: `Bearer ${deliveryToken}` } }
            )
            .catch((err) => {
              console.error("Failed to update location:", err);
            });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, deliveryToken, isPicked]);

  const openGoogleMaps = () => {
    if (!tracking) return;
    if (
      typeof tracking.customerLatitude !== "number" ||
      typeof tracking.customerLongitude !== "number"
    ) {
      alert("Customer location is not available.");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${tracking.customerLatitude},${tracking.customerLongitude}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 4) Draw route
  const drawRoute = async (lon, lat) => {
    if (!mapRef.current || !tracking) return;
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

      const routeGeoJSON = { type: "Feature", geometry: route.geometry };

      const map = mapRef.current;
      if (map.getSource("route")) {
        map.getSource("route").setData(routeGeoJSON);
      } else {
        map.addSource("route", {
          type: "geojson",
          data: routeGeoJSON,
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 6,
          },
        });
      }
    } catch (err) {
      console.error("Failed to draw route:", err);
    }
  };

  const handleCallCustomer = () => {
    if (!tracking?.customerMobile) {
      alert("Customer mobile number not available.");
      return;
    }
    if (!showPhone) {
      setShowPhone(true);
    } else {
      window.location.href = `tel:${tracking.customerMobile}`;
    }
  };

  const handleMarkDelivered = async () => {
    if (!orderId || !deliveryToken) return;
    const confirmDelivery = window.confirm("Mark this order as delivered?");
    if (!confirmDelivery) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/delivery/order/delivered/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${deliveryToken}` } }
      );
      navigate("/delivery/complete");
    } catch (err) {
      console.error("Failed to mark delivered:", err);
      alert("Failed to mark as delivered. Please try again.");
    }
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
        <p className="error-message">{error || "Tracking not available."}</p>
      </div>
    );
  }

  return (
    <div className="delivery-tracking-page">
      <div className="delivery-header">
        <button className="btn-back" type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="header-info">
          <h2>
            🚚 Order #{orderId} — {tracking.status}
          </h2>
          {duration !== null && (
            <div className="eta-badge">
              <span className="eta-icon">⏱</span>
              <span>{duration} mins</span>
            </div>
          )}
        </div>
      </div>

      <div ref={mapContainer} className="delivery-map" />

      <div className="quick-stats">
        <div className="stat-card">
          <span className="stat-icon">📏</span>
          <div className="stat-content">
            <span className="stat-label">Distance</span>
            <span className="stat-value">
              {distance !== null ? `${distance} km` : "..."}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱</span>
          <div className="stat-content">
            <span className="stat-label">ETA</span>
            <span className="stat-value">
              {duration !== null ? `${duration} mins` : "..."}
            </span>
          </div>
        </div>
        {/* You can add two more stat cards if needed */}
      </div>

      <div className="customer-info-card">
        <div className="customer-header">
          <div className="customer-avatar" aria-hidden="true">
            {tracking.customerName?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="customer-details">
            <h3>{tracking.customerName || "Customer"}</h3>
            <p className="customer-address">
              <span aria-hidden="true">📍</span>
              <span>{tracking.customerAddress || "Address not available"}</span>
            </p>
          </div>
        </div>

        <div className="customer-actions">
          <button
            className="action-btn call-btn"
            type="button"
            onClick={handleCallCustomer}
          >
            <span className="btn-icon" aria-hidden="true">
              📞
            </span>
            {showPhone && tracking.customerMobile
              ? tracking.customerMobile
              : "Call Customer"}
          </button>

          <button
            className="action-btn navigate-btn"
            type="button"
            onClick={openGoogleMaps}
          >
            <span className="btn-icon" aria-hidden="true">
              🗺️
            </span>
            Open Maps
          </button>
        </div>
      </div>

      {isPicked && (
        <button
          className="btn-delivered"
          type="button"
          onClick={handleMarkDelivered}
        >
          <span className="delivered-icon" aria-hidden="true">
            ✅
          </span>
          Mark as Delivered
        </button>
      )}
    </div>
  );
};

export default DeliveryTracking;
