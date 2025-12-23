/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "../styles/user/userprofile.css";

import {
  MapPin,
  User,
  Navigation,
} from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API;

const DEFAULT_LAT = 17.385044;
const DEFAULT_LNG = 78.486671;

const UserProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // =========================
  // AUTH GUARD
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // =========================
  // STATE
  // =========================
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
    currentLatitude: DEFAULT_LAT,
    currentLongitude: DEFAULT_LNG,
  });

  // =========================
  // MAP REFS
  // =========================
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // =========================
  // FETCH USER PROFILE
  // =========================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
          currentLatitude: data.currentLatitude ?? DEFAULT_LAT,
          currentLongitude: data.currentLongitude ?? DEFAULT_LNG,
        });

        setProfileLoaded(true);
      } catch (err) {
        console.error("Profile fetch failed", err);
      }
    };

    fetchUser();
  }, [token]);

  // =========================
  // INIT MAP (ONLY ONCE AFTER DATA)
  // =========================
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

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([user.currentLongitude, user.currentLatitude])
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const { lng, lat } = markerRef.current.getLngLat();
      updateLocation(lat, lng);
      reverseGeocode(lat, lng);
    });

    const handleResize = () => mapRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [profileLoaded]);

  // =========================
  // KEEP MAP IN SYNC WITH STATE
  // =========================
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

  // =========================
  // UPDATE LOCATION
  // =========================
  const updateLocation = (lat, lng, address = null) => {
    setUser((prev) => ({
      ...prev,
      currentLatitude: lat,
      currentLongitude: lng,
      address: address ?? prev.address,
    }));
  };

  // =========================
  // REVERSE GEOCODING
  // =========================
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const address =
        data.features?.[0]?.place_name || "Unknown location";
      updateLocation(lat, lng, address);
    } catch (err) {
      console.error("Reverse geocode failed", err);
    }
  };

  // =========================
  // DETECT CURRENT LOCATION
  // =========================
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateLocation(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      () => alert("Unable to detect location")
    );
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const saveProfile = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        }
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();
      setUser(updated);
      setIsEditing(false);
      alert("Profile saved!");
    } catch {
      alert("Failed to save profile");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-container">

        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <User />
              </div>
              <div>
                <h1>{user.firstname || "User Profile"}</h1>
                <p>Manage your account details</p>
              </div>
            </div>

            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
                <button onClick={saveProfile}>Save</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>
        </div>

        <div className="profile-section-card">
          <h2>
            <MapPin /> Delivery Address
          </h2>

          {isEditing && (
            <button onClick={detectLocation}>
              <Navigation size={16} /> Use My Location
            </button>
          )}

          <div className="map-wrapper">
            <div ref={mapContainer} className="map-container" />
          </div>

          <textarea
            disabled={!isEditing}
            value={user.address}
            onChange={(e) =>
              setUser({ ...user, address: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
