/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef} from "react";
import "../styles/userprofile.css";

import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import {
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  Languages,
  Search,
  Navigation,
} from "lucide-react";

//  ⭐ PUT YOUR MAPBOX TOKEN HERE
mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API;

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  

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

  // ================================
  // LOAD USER PROFILE
  // ================================
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

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
        receiverName: data.receiverName || user.firstname || "",
        receiverMobile: data.receiverMobile || "",

        country: data.country || "India",
        language: data.language || "English",
        currentLatitude: data.currentLatitude || 17.385044,
        currentLongitude: data.currentLongitude || 78.486671,
      });
    };

    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================
  // INITIALIZE MAPBOX
  // ================================
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create map instance
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [user.currentLongitude, user.currentLatitude],
      zoom: 14,
    });

    // zoom controls
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    // AUTOCOMPLETE SEARCH BAR
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      placeholder: "Search address...",
      marker: false,
    });

    mapRef.current.addControl(geocoder);

    // selected result from autocomplete
    geocoder.on("result", (e) => {
      const { center, place_name } = e.result;
      updateLocation(center[1], center[0], place_name);
    });

    // DRAGGABLE MARKER
    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([user.currentLongitude, user.currentLatitude])
      .addTo(mapRef.current);

    // marker drag event
    markerRef.current.on("dragend", () => {
      const { lat, lng } = markerRef.current.getLngLat();
      reverseGeocode(lat, lng);
    });

    return () => mapRef.current.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================
  // UPDATE LOCATION IN STATE + UI
  // ================================
  const updateLocation = (lat, lng, address = null) => {
    setUser((prev) => ({
      ...prev,
      currentLatitude: lat,
      currentLongitude: lng,
      address: address || prev.address,
    }));

    markerRef.current.setLngLat([lng, lat]);
    mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
  };

  // ================================
  // REVERSE GEOCODING — LAT/LNG → ADDRESS
  // ================================
  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
    );

    const data = await res.json();

    const address = data.features?.[0]?.place_name || "Unknown location";

    updateLocation(lat, lng, address);
  };

  // ================================
  // DETECT CURRENT LOCATION
  // ================================
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateLocation(lat, lng);
        reverseGeocode(lat, lng);
      },
      () => alert("Unable to detect location")
    );
  };

  // ================================
  // SAVE PROFILE
  // ================================
  const saveProfile = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      alert("Failed to save profile");
      return;
    }

    const updated = await res.json();
    setUser(updated);
    setIsEditing(false);
    alert("Profile saved!");
  };

  // ================================
  // RENDER
  // ================================
  return (
  <div className="user-profile-wrapper">
    <div className="user-profile-container">

      {/* Header */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <User className="avatar-icon" />
            </div>
            <div className="profile-title-section">
              <h1 className="profile-main-title">{user.firstname || "User Profile"}</h1>
              <p className="profile-subtitle">Manage your account details</p>
            </div>
          </div>

          {isEditing ? (
            <div className="button-group">
              <button className="profile-btn profile-btn-cancel" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="profile-btn profile-btn-save" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          ) : (
            <button className="profile-btn profile-btn-edit" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
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
                name="firstname"
                className="field-input"
                value={user.firstname}
                onChange={(e) => setUser({ ...user, firstname: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Email</label>
              <input
                disabled={!isEditing}
                className="field-input"
                name="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Mobile</label>
              <input
                disabled={!isEditing}
                className="field-input"
                name="mobile"
                value={user.mobile}
                onChange={(e) => setUser({ ...user, mobile: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Gender</label>
              <select
                disabled={!isEditing}
                className="field-input"
                name="gender"
                value={user.gender}
                onChange={(e) => setUser({ ...user, gender: e.target.value })}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            

            {/* <div className="form-field">
              <label className="field-label">Country</label>
              <input
                disabled={!isEditing}
                className="field-input"
                name="country"
                value={user.country}
                onChange={(e) => setUser({ ...user, country: e.target.value })}
              />
            </div> */}

            {/* <div className="form-field">
              <label className="field-label">Language</label>
              <select
                disabled={!isEditing}
                className="field-input"
                name="language"
                value={user.language}
                onChange={(e) => setUser({ ...user, language: e.target.value })}
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Telugu</option>
                <option>Tamil</option>
              </select>
            </div> */}
          </div>
        </div>

        {/* RIGHT PANEL - MAP SECTION */}
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
              name="address"
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
            />
          </div>

          <div className="info-tip">
            <p className="tip-text">
              <span className="tip-label">Tip:</span> Drag the marker or search for your exact location.
            </p>
          </div>

          <div className="form-field">
              <label className="field-label">Receiver Name</label>
              <input
                disabled={!isEditing}
                value={user.receiverName}
                className="field-input"
                onChange={(e) => setUser({ ...user, receiverName: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Receiver Mobile</label>
              <input
                disabled={!isEditing}
                className="field-input"
                value={user.receiverMobile}
                onChange={(e) => setUser({ ...user, receiverMobile: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label">House No:/Floor No:</label>
              <input
                disabled={!isEditing}
                value={user.houseNo}
                className="field-input"
                onChange={(e) => setUser({ ...user, houseNo: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Building Name</label>
              <input
                disabled={!isEditing}
                className="field-input"
                value={user.buildingName}
                onChange={(e) => setUser({ ...user, buildingName: e.target.value })}
              />
            </div>
        </div>
      </div>
    </div>
  </div>
  )
};

export default UserProfile;
