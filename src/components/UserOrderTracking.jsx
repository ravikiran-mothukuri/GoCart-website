/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// import "../styles/delivery/tracking.css";

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

    // Custom Scooter Icon for Delivery Partner
    const scooterEl = document.createElement('div');
    scooterEl.innerHTML = '<div style="background-color: white; border-radius: 50%; padding: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 20px; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 2px solid #10b981;">🛵</div>';

    // Markers
    deliveryMarker.current = new mapboxgl.Marker({
      element: scooterEl,
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
      `${import.meta.env.VITE_API_URL
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/myorders")}
          className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-gray-900">Track Order #{orderId}</h2>
          <div
            className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-sm"
            style={{ background: statusInfo.color }}
          >
            <span aria-hidden="true">{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div ref={mapContainer} className="w-full bg-gray-200 rounded-xl" style={{ height: '50vh' }} />

      {/* Info Sheet / Content */}
      <div className="-mt-6 relative z-20 rounded-t-3xl bg-white p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">

        {/* Delivery Partner Info */}
        {tracking.deliveryPersonName && tracking.status !== "DELIVERED" && (
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Partner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{tracking.deliveryPersonName}</p>
                  <p className="text-xs text-gray-500">Your delivery hero</p>
                </div>
              </div>
              {tracking.deliveryMobile && (
                <button
                  onClick={callDeliveryPartner}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <span className="text-xl">📞</span>
                </button>
              )}
            </div>

            {tracking.deliveryMobile && (
              <button
                className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform"
                onClick={callDeliveryPartner}
              >
                Call Partner
              </button>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Journey</h3>
          <div className="relative pl-10 border-l-2 border-gray-100 space-y-8">
            {/* Placed */}
            <div className={`relative ${["PLACED", "PICKED_UP", "DELIVERED"].includes(tracking.status) ? "opacity-100" : "opacity-40"}`}>
              <div className="absolute -left-14 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 border-2 border-white shadow-sm">
                <span className="text-xs">📦</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Order Placed</h4>
                <p className="text-sm text-gray-500">Your order has been confirmed.</p>
              </div>
            </div>

            {/* Picked Up */}
            <div className={`relative ${["PICKED_UP", "DELIVERED"].includes(tracking.status) ? "opacity-100" : "opacity-40"}`}>
              <div className="absolute -left-14 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 border-2 border-white shadow-sm">
                <span className="text-xs">🏪</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Picked Up</h4>
                <p className="text-sm text-gray-500">Partner collected your order.</p>
              </div>
            </div>

            {/* Delivered */}
            <div className={`relative ${tracking.status === "DELIVERED" ? "opacity-100" : "opacity-40"}`}>
              <div className="absolute -left-14 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 border-2 border-white shadow-sm">
                <span className="text-xs">✅</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Delivered</h4>
                <p className="text-sm text-gray-500">Order delivered to your location.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details or Success Message */}
        {tracking.status === "DELIVERED" ? (
          <div className="rounded-2xl bg-green-50 p-6 text-center shadow-inner">
            <div className="mb-2 inline-flex rounded-full bg-green-100 p-3 text-2xl">🎉</div>
            <h3 className="text-lg font-bold text-green-800">Order Delivered!</h3>
            <p className="text-green-600">Thank you for shopping with us.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Details</h3>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <span className="text-xs">🏠</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Delivery Address</p>
                <p className="font-medium text-gray-900">{tracking.customerAddress || "Address not available"}</p>
                {tracking.customerName && <p className="text-sm text-gray-500 mt-1">{tracking.customerName}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrderTracking;
