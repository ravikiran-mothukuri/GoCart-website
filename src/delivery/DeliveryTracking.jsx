import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AuthContext } from "../pages/AuthContext";
import { ArrowLeft, Clock, Ruler, Navigation, Map, Phone, CheckCircle, Smartphone } from 'lucide-react';

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

    // Custom Scooter Icon for Delivery Partner
    const scooterEl = document.createElement('div');
    scooterEl.innerHTML = '<div style="background-color: white; border-radius: 50%; padding: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 20px; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 2px solid #10b981;">🛵</div>';

    deliveryMarker.current = new mapboxgl.Marker({ element: scooterEl })
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
            `<strong>🏠 ${tracking.customerName || "Customer"}</strong><br/>${tracking.customerAddress || ""
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

  // const openGoogleMaps = () => {
  //   if (!tracking) return;
  //   if (
  //     typeof tracking.customerLatitude !== "number" ||
  //     typeof tracking.customerLongitude !== "number"
  //   ) {
  //     alert("Customer location is not available.");
  //     return;
  //   }
  //   const url = `https://www.google.com/maps/dir/?api=1&destination=${tracking.customerLatitude},${tracking.customerLongitude}&travelmode=driving`;
  //   window.open(url, "_blank", "noopener,noreferrer");
  // };

  const openGoogleMaps = () => {
    const { customerLatitude, customerLongitude } = tracking;

    const url = `https://www.google.com/maps/dir/?api=1
      &origin=${tracking.deliveryPartnerLatitude},${tracking.deliveryPartnerLongitude}
      &destination=${customerLatitude},${customerLongitude}
      &travelmode=driving`;

    window.open(url.replace(/\s+/g, ""), "_blank");
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
          <Smartphone size={32} />
        </div>
        <p className="text-gray-900 font-medium">{error || "Tracking not available."}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button
          className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-gray-900">Order #{orderId}</h2>
          <span className="text-xs font-semibold text-blue-600">{tracking.status.replace(/_/g, ' ')}</span>
        </div>
        {duration !== null ? (
          <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <Clock size={12} /> {duration} min
          </div>
        ) : (
          <div className="w-10"></div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="h-[50vh] w-full bg-gray-200" />

      {/* Info Sheet */}
      <div className="-mt-6 relative z-20 rounded-t-3xl bg-white p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-blue-600">
              <Ruler size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Distance</p>
              <p className="font-bold text-gray-900">{distance !== null ? `${distance} km` : "..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-purple-600">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">ETA</p>
              <p className="font-bold text-gray-900">{duration !== null ? `${duration} min` : "..."}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-md">
              {tracking.customerName?.charAt(0).toUpperCase() || "C"}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-gray-900 truncate">{tracking.customerName || "Customer"}</h3>
              <p className="flex items-start gap-1 text-xs text-gray-500">
                <Map size={12} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">{tracking.customerAddress || "Address not available"}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-2.5 text-sm font-bold text-green-700 transition-colors hover:bg-green-100"
              type="button"
              onClick={handleCallCustomer}
            >
              <Phone size={16} />
              {showPhone && tracking.customerMobile ? tracking.customerMobile : "Call"}
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
              type="button"
              onClick={openGoogleMaps}
            >
              <Navigation size={16} /> Maps
            </button>
          </div>
        </div>

        {/* Action Button */}
        {isPicked && (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-bold text-white shadow-lg shadow-green-500/20 transition-transform active:scale-[0.98]"
            type="button"
            onClick={handleMarkDelivered}
          >
            <CheckCircle size={20} /> Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
