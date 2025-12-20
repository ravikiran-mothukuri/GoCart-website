import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/delivery/tracking.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API;

const UserOrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const deliveryMarker = useRef(null);
  const customerMarker = useRef(null);

  // Fetch tracking data
  const fetchTracking = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/order/tracking/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        const trackingData = res.data.tracking;
        setTracking(trackingData);
        
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !tracking) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [tracking.customerLongitude, tracking.customerLatitude],
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

    // Add customer marker (your location - red)
    const customerEl = document.createElement('div');
    customerEl.className = 'customer-marker';
    customerEl.innerHTML = '🏠';
    
    customerMarker.current = new mapboxgl.Marker({
      element: customerEl,
      anchor: 'center'
    })
      .setLngLat([tracking.customerLongitude, tracking.customerLatitude])
      .addTo(map.current);

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

    // Update delivery marker position
    if (deliveryMarker.current) {
      deliveryMarker.current.setLngLat([
        trackingData.deliveryPartnerLongitude,
        trackingData.deliveryPartnerLatitude
      ]);
    }

    // Fetch route
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${trackingData.deliveryPartnerLongitude},${trackingData.deliveryPartnerLatitude};${trackingData.customerLongitude},${trackingData.customerLatitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        setDistance((route.distance / 1000).toFixed(2));
        setDuration(Math.round(route.duration / 60));

        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }

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
            'line-color': '#10b981',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

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

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!token || !orderId) return;

    fetchTracking();

    const interval = setInterval(() => {
      fetchTracking();
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, token]);

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
        <button className="back-btn" onClick={() => navigate('/myorders')}>
          ← Back to My Orders
        </button>
        <h2>Track Order #{orderId}</h2>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="tracking-map"></div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-icon">
          {tracking.status === 'PICKED_UP' ? '📦' : '🚚'}
        </div>
        <div className="status-content">
          <h3>{tracking.status === 'PICKED_UP' ? 'Order Picked Up' : 'Out for Delivery'}</h3>
          <p>Your delivery partner is on the way!</p>
        </div>
      </div>

      {/* Tracking Info Cards */}
      <div className="tracking-info-grid">
        <div className="info-card">
          <div className="info-icon">⏱️</div>
          <div className="info-content">
            <h3>Estimated Time</h3>
            <p className="highlight">{duration ? `${duration} mins` : 'Calculating...'}</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">📍</div>
          <div className="info-content">
            <h3>Distance</h3>
            <p className="highlight">{distance ? `${distance} km` : 'Calculating...'}</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">📦</div>
          <div className="info-content">
            <h3>Items</h3>
            <p className="highlight">{tracking.itemCount} items</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">💰</div>
          <div className="info-content">
            <h3>Order Total</h3>
            <p className="highlight">₹{tracking.totalPrice}</p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="address-card">
        <h3>📍 Delivery Address</h3>
        <p>{tracking.customerAddress}</p>
      </div>

      {/* Live Update Indicator */}
      <div className="live-indicator">
        <span className="pulse"></span>
        Live tracking - Updates every 10 seconds
      </div>
    </div>
  );
};

export default UserOrderTracking;