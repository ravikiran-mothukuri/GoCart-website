import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AuthContext } from "../pages/AuthContext";
import '../styles/delivery/tracking.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API;

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { deliveryToken } = useContext(AuthContext);
  
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const deliveryMarker = useRef(null);
  const customerMarker = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const routeLayer = useRef(null);

  // Fetch tracking data
  const fetchTracking = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/delivery/tracking/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`
          }
        }
      );

      if (res.data.success) {
        const trackingData = res.data.tracking;
        setTracking(trackingData);
        
        // Update map markers and route
        if (map.current) {
          updateMapWithTracking(trackingData);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tracking", err);
    } finally {
      setLoading(false);
    }
  };

  // Update delivery partner location
  const updateLocation = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/delivery/tracking/update-location/${orderId}`,
            {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            },
            {
              headers: {
                Authorization: `Bearer ${deliveryToken}`
              }
            }
          );

          // Refresh tracking data
          fetchTracking();
        } catch (err) {
          console.error("Failed to update location", err);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !tracking) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [tracking.deliveryPartnerLongitude, tracking.deliveryPartnerLatitude],
      zoom: 13
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Add delivery partner marker (green)
    const deliveryEl = document.createElement('div');
    deliveryEl.className = 'delivery-marker';
    deliveryEl.innerHTML = '🏍️';
    
    deliveryMarker.current = new mapboxgl.Marker({
      element: deliveryEl,
      anchor: 'center'
    })
      .setLngLat([tracking.deliveryPartnerLongitude, tracking.deliveryPartnerLatitude])
      .addTo(map.current);

    // Add customer marker (red)
    const customerEl = document.createElement('div');
    customerEl.className = 'customer-marker';
    customerEl.innerHTML = '📍';
    
    customerMarker.current = new mapboxgl.Marker({
      element: customerEl,
      anchor: 'center'
    })
      .setLngLat([tracking.customerLongitude, tracking.customerLatitude])
      .addTo(map.current);

    // Fetch and draw route
    map.current.on('load', () => {
      updateMapWithTracking(tracking);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [tracking]);

  // Update map with new tracking data
  const updateMapWithTracking = async (trackingData) => {
    if (!map.current) return;

    // Update marker positions
    if (deliveryMarker.current) {
      deliveryMarker.current.setLngLat([
        trackingData.deliveryPartnerLongitude,
        trackingData.deliveryPartnerLatitude
      ]);
    }

    // Fetch route from Mapbox Directions API
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${trackingData.deliveryPartnerLongitude},${trackingData.deliveryPartnerLatitude};${trackingData.customerLongitude},${trackingData.customerLatitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Update distance and duration
        setDistance((route.distance / 1000).toFixed(2)); // km
        setDuration(Math.round(route.duration / 60)); // minutes

        // Remove existing route layer
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }

        // Add route layer
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

        // Fit map to show both markers and route
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([trackingData.deliveryPartnerLongitude, trackingData.deliveryPartnerLatitude]);
        bounds.extend([trackingData.customerLongitude, trackingData.customerLatitude]);
        
        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 15
        });
      }
    } catch (err) {
      console.error("Failed to fetch route", err);
    }
  };

  // Auto-update location every 10 seconds
  useEffect(() => {
    if (!deliveryToken || !orderId) return;

    fetchTracking();
    updateLocation();

    const locationInterval = setInterval(() => {
      updateLocation();
    }, 10000); // Update every 10 seconds

    const trackingInterval = setInterval(() => {
      fetchTracking();
    }, 10000);

    return () => {
      clearInterval(locationInterval);
      clearInterval(trackingInterval);
    };
  }, [orderId, deliveryToken]);

  const handleMarkDelivered = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/delivery/order/delivered/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`
          }
        }
      );
      alert("Order marked as delivered!");
      navigate("/delivery/orders");
    } catch (err) {
      alert("Failed to mark order as delivered");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="tracking-page">
        <p>Unable to load tracking information</p>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <button className="back-btn" onClick={() => navigate('/delivery/orders')}>
          ← Back to Orders
        </button>
        <h2>Order #{orderId} - Live Tracking</h2>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="tracking-map"></div>

      {/* Tracking Info Cards */}
      <div className="tracking-info-grid">
        <div className="info-card">
          <div className="info-icon">📍</div>
          <div className="info-content">
            <h3>Customer Details</h3>
            <p><strong>{tracking.customerName}</strong></p>
            <p>{tracking.customerAddress}</p>
            <p>📞 {tracking.customerMobile}</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">📊</div>
          <div className="info-content">
            <h3>Delivery Info</h3>
            <p><strong>Distance:</strong> {distance ? `${distance} km` : 'Calculating...'}</p>
            <p><strong>ETA:</strong> {duration ? `${duration} mins` : 'Calculating...'}</p>
            <p><strong>Items:</strong> {tracking.itemCount}</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">💰</div>
          <div className="info-content">
            <h3>Order Value</h3>
            <p className="price">₹{tracking.totalPrice}</p>
            <p><strong>Status:</strong> {tracking.status.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="tracking-actions">
        <button 
          className="btn btn-call"
          onClick={() => window.open(`tel:${tracking.customerMobile}`)}
        >
          📞 Call Customer
        </button>
        
        <button 
          className="btn btn-navigate"
          onClick={() => window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${tracking.customerLatitude},${tracking.customerLongitude}`
          )}
        >
          🗺️ Open in Maps
        </button>

        <button 
          className="btn btn-delivered"
          onClick={handleMarkDelivered}
        >
          ✅ Mark as Delivered
        </button>
      </div>

      {/* Live Update Indicator */}
      <div className="live-indicator">
        <span className="pulse"></span>
        Live tracking - Updates every 10 seconds
      </div>
    </div>
  );
};

export default DeliveryTracking;