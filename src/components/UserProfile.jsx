/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import "../styles/user/userprofile.css";
import { useNavigate } from "react-router-dom";

import mapboxgl from "mapbox-gl";

import {
  MapPin,
  User,
  Navigation,
} from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API;

const UserProfile = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const [isEditing, setIsEditing] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [user, setUser] = useState({
    firstname: "",
    email: "",
    mobile: "",
    gender: "",
    address: "",
    houseNo: "",
    buildingName: "",
    receiverName: "",
    receiverMobile: "",
    country: "India",
    language: "English",
    currentLatitude: 17.385044,
    currentLongitude: 78.486671,
  });

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return;
      const data = await res.json();

      setUser({
        firstname: data.firstname || "",
        email: data.email || "",
        mobile: data.mobile || "",
        gender: data.gender || "",
        address: data.address || "",
        houseNo: data.houseNo || "",
        buildingName: data.buildingName || "",
        receiverName: data.receiverName || data.firstname || "",
        receiverMobile: data.receiverMobile || "",
        country: data.country || "India",
        language: data.language || "English",
        currentLatitude: data.currentLatitude ?? 17.385044,
        currentLongitude: data.currentLongitude ?? 78.486671,
      });

      setProfileLoaded(true);
    };

    fetchUser();
  }, [token]);

  // ================= MAP INIT (ONLY FIX) =================
  useEffect(() => {
    if (!profileLoaded) return;
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [user.currentLongitude, user.currentLatitude],
      zoom: 14,
    });

    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([user.currentLongitude, user.currentLatitude])
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const { lat, lng } = markerRef.current.getLngLat();
      updateLocation(lat, lng);
      reverseGeocode(lat, lng);
    });

    return () => {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [profileLoaded]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    mapRef.current.flyTo({
      center: [user.currentLongitude, user.currentLatitude],
      zoom: 15,
    });

    markerRef.current.setLngLat([
      user.currentLongitude,
      user.currentLatitude,
    ]);
  }, [user.currentLatitude, user.currentLongitude]);

  const updateLocation = (lat, lng, address = null) => {
    setUser((prev) => ({
      ...prev,
      currentLatitude: lat,
      currentLongitude: lng,
      address: address ?? prev.address,
    }));
  };

  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await res.json();
    updateLocation(
      lat,
      lng,
      data.features?.[0]?.place_name || "Unknown location"
    );
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      () => alert("Unable to detect location")
    );
  };

  const saveProfile = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });

    setIsEditing(false);
    alert("Profile saved!");
  };

  // ================= JSX — UNTOUCHED =================
  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-container">

        {/* HEADER */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <User className="avatar-icon" />
              </div>
              <div className="profile-title-section">
                <h1 className="profile-main-title">
                  {user.firstname || "User Profile"}
                </h1>
                <p className="profile-subtitle">
                  Manage your account details
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="button-group">
                <button
                  className="profile-btn profile-btn-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="profile-btn profile-btn-save"
                  onClick={saveProfile}
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                className="profile-btn profile-btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="profile-content-grid">

          {/* LEFT PANEL */}
          <div className="profile-section-card">
            <h2 className="section-header">
              <User className="section-icon" /> Personal Information
            </h2>

            <div className="form-fields">

              <div className="form-field">
                <label className="field-label">Full Name</label>
                <input
                  disabled={!isEditing}
                  className="field-input"
                  value={user.firstname}
                  onChange={(e)=>setUser({...user,firstname:e.target.value})}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Email</label>
                <input
                  disabled={!isEditing}
                  className="field-input"
                  value={user.email}
                  onChange={(e)=>setUser({...user,email:e.target.value})}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Mobile</label>
                <input
                  disabled={!isEditing}
                  className="field-input"
                  value={user.mobile}
                  onChange={(e)=>setUser({...user,mobile:e.target.value})}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Gender</label>
                <select
                  disabled={!isEditing}
                  className="field-input"
                  value={user.gender}
                  onChange={(e)=>setUser({...user,gender:e.target.value})}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="profile-section-card">
            <h2 className="section-header">
              <MapPin className="section-icon" /> Delivery Address
            </h2>

            {isEditing && (
              <button className="btn btn-location" onClick={detectLocation}>
                <Navigation size={18} className="btn-icon" />
                Use My Current Location
              </button>
            )}

            <div className="map-wrapper">
              <div ref={mapContainer} className="map-container"></div>
            </div>

            <div className="form-field">
              <label className="field-label">Address</label>
              <textarea
                disabled={!isEditing}
                className="field-textarea"
                value={user.address}
                onChange={(e)=>setUser({...user,address:e.target.value})}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Receiver Name</label>
              <input
                disabled={!isEditing}
                className="field-input"
                value={user.receiverName}
                onChange={(e)=>setUser({...user,receiverName:e.target.value})}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Receiver Mobile</label>
              <input
                disabled={!isEditing}
                className="field-input"
                value={user.receiverMobile}
                onChange={(e)=>setUser({...user,receiverMobile:e.target.value})}
              />
            </div>

            <div className="form-field">
              <label className="field-label">House No / Floor</label>
              <input
                disabled={!isEditing}
                className="field-input"
                value={user.houseNo}
                onChange={(e)=>setUser({...user,houseNo:e.target.value})}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Building Name</label>
              <input
                disabled={!isEditing}
                className="field-input"
                value={user.buildingName}
                onChange={(e)=>setUser({...user,buildingName:e.target.value})}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
