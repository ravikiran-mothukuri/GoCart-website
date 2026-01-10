import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AuthContext } from "../pages/AuthContext";
import { User, Phone, Truck, MapPin, Navigation, Edit2, Save, X, Activity, Star, Clock } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API || "";

const DeliveryProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    mobile: '',
    vehicle: 'Bike',
    city: 'Hyderabad',
    currentLatitude: 17.385044,
    currentLongitude: 78.486671,
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const { deliveryToken } = useContext(AuthContext);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    if (!deliveryToken) return;
    fetchProfile();
  }, [deliveryToken]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return; // Initialize only once

    // Default to Hyderabad if 0/0
    const lat = profile.currentLatitude || 17.385044;
    const lng = profile.currentLongitude || 78.486671;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 13,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    markerRef.current = new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Initialize after loading is done

  // Update Map Marker when Location Changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const lat = profile.currentLatitude;
    const lng = profile.currentLongitude;

    if (lat && lng) {
      markerRef.current.setLngLat([lng, lat]);
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    }
  }, [profile.currentLatitude, profile.currentLongitude]);

  const cancelEdit = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const saveProfile = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/delivery/update/profile`,
        {
          name: profile.name,
          mobile: profile.mobile,
          vehicle: profile.vehicle,
          currentLatitude: profile.currentLatitude,
          currentLongitude: profile.currentLongitude,
        },
        {
          headers: { Authorization: `Bearer ${deliveryToken}` },
        }
      );
      showMessage('success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Failed to update profile');
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/delivery/profile`, {
        headers: { Authorization: `Bearer ${deliveryToken}` },
      });

      const d = res.data.partner;

      setProfile({
        name: d.name || "User",
        mobile: d.mobile || "9XXXXXXXXX",
        vehicle: d.vehicle || "BIKE",
        status: d.status,
        currentLatitude: d.currentLatitude || 17.385044,
        currentLongitude: d.currentLongitude || 78.486671
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      showMessage('error', 'Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/delivery/updateLocation`,
            {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            },
            {
              headers: { Authorization: `Bearer ${deliveryToken}` }
            }
          );

          setProfile(prev => ({
            ...prev,
            currentLatitude: position.coords.latitude,
            currentLongitude: position.coords.longitude
          }));

          showMessage('success', 'Location updated successfully!');
        } catch (err) {
          console.error(err);
          showMessage('error', 'Failed to update location');
        }
      },
      (error) => {
        showMessage('error', 'Please enable location services');
        console.error(error);
      }
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed left-1/2 top-24 z-[9999] flex min-w-[280px] max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl backdrop-blur-sm transition-all sm:left-auto sm:right-6 sm:top-28 sm:min-w-[320px] sm:translate-x-0 ${message.type === 'success' ? 'bg-green-600 text-white' :
              message.type === 'error' ? 'bg-red-600 text-white' :
                'bg-gray-900/90 text-white'
            }`}
          role="alert"
        >
          <span className="text-sm font-medium sm:text-base">{message.text}</span>
        </div>
      )}

      <h2 className="mb-8 text-2xl font-bold text-gray-900">👤 My Profile</h2>

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700 hover:bg-green-200"
                >
                  <Save size={16} /> Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-200"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <User size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Full Name</p>
                {isEditing ? (
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-1 px-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{profile.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Phone size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Mobile Number</p>
                {isEditing ? (
                  <input
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-1 px-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{profile.mobile}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Vehicle Type</p>
                {isEditing ? (
                  <select
                    value={profile.vehicle}
                    onChange={(e) => setProfile({ ...profile, vehicle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-1 px-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="BIKE">Bike</option>
                    <option value="SCOOTER">Scooter</option>
                  </select>
                ) : (
                  <p className="font-semibold text-gray-900">{profile.vehicle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Activity size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Account Status</p>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location & Stats */}
        <div className="space-y-6">
          {/* Location Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <MapPin size={20} className="text-red-500" /> Live Location
            </h3>

            <div className="overflow-hidden rounded-xl bg-gray-100 p-1">
              {/* Real Map Visual */}
              <div ref={mapContainer} className="h-56 w-full rounded-lg bg-gray-200" />

              <div className="mt-4 grid grid-cols-2 gap-4 px-2 pb-2">
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Latitude</p>
                  <p className="font-mono font-bold text-gray-900">{profile.currentLatitude?.toFixed(6) || "..."}</p>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Longitude</p>
                  <p className="font-mono font-bold text-gray-900">{profile.currentLongitude?.toFixed(6) || "..."}</p>
                </div>
              </div>
            </div>

            <button
              onClick={updateLocation}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
            >
              <Navigation size={18} /> Update Current Location
            </button>
          </div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-xs font-medium text-gray-500">Deliveries</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
              <div className="mb-1 flex justify-center text-yellow-400"><Star size={20} fill="currentColor" /></div>
              <p className="text-xs font-medium text-gray-500">4.8 Rating</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
              <div className="mb-1 flex justify-center text-green-500"><Clock size={20} /></div>
              <p className="text-xs font-medium text-gray-500">98% On-Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;