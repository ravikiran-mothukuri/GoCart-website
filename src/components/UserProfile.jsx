/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { MapPin, User, Navigation, Save, X, Edit2 } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_API;

const UserProfile = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const [isEditing, setIsEditing] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const text = await res.text();

        if (!text) {
          console.error("Empty response from server");
          return;
        }

        const data = JSON.parse(text);

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
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [token]);

  // ================= MAP INIT =================
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
      mapRef.current?.remove();
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
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      updateLocation(
        lat,
        lng,
        data.features?.[0]?.place_name || "Unknown location"
      );
    } catch (err) {
      console.error(err);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showMessage("error", "Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        let errorMsg = "Unable to detect location";
        if (err.code === 1) errorMsg = "Location permission denied";
        else if (err.code === 2) errorMsg = "Location unavailable";
        else if (err.code === 3) errorMsg = "Location request timed out";
        showMessage("error", errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const saveProfile = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      setIsEditing(false);
      showMessage("success", "Profile updated successfully!");
    } catch (err) {
      showMessage("error", "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      {message && (
        <div className="fixed top-24 right-4 z-50 animate-bounce rounded-xl bg-gray-900/90 px-6 py-3 text-white shadow-xl backdrop-blur-sm">
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col items-start justify-between gap-6 rounded-2xl bg-white p-8 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {user.firstname || "User Profile"}
              </h1>
              <p className="text-gray-500">Manage your account details</p>
            </div>
          </div>

          <div>
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-bold text-gray-600 transition-colors hover:bg-gray-50"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={18} /> Cancel
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                  onClick={saveProfile}
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-black"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* PERSONAL INFORMATION */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <User className="text-green-600" size={24} /> Personal Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  disabled={!isEditing}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                  value={user.firstname}
                  onChange={(e) =>
                    setUser({ ...user, firstname: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  disabled={!isEditing}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mobile
                </label>
                <input
                  disabled={!isEditing}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                  value={user.mobile}
                  onChange={(e) => setUser({ ...user, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  disabled={!isEditing}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                  value={user.gender}
                  onChange={(e) => setUser({ ...user, gender: e.target.value })}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* DELIVERY ADDRESS */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <MapPin className="text-green-600" size={24} /> Delivery Address
            </h2>

            {isEditing && (
              <button
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                onClick={detectLocation}
              >
                <Navigation size={18} /> Use My Current Location
              </button>
            )}

            <div className="mb-6 h-64 w-full overflow-hidden rounded-xl border border-gray-200">
              <div ref={mapContainer} className="h-full w-full" />
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  disabled={!isEditing}
                  rows={3}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                  value={user.address}
                  onChange={(e) =>
                    setUser({ ...user, address: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Receiver Name
                  </label>
                  <input
                    disabled={!isEditing}
                    className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                    value={user.receiverName}
                    onChange={(e) =>
                      setUser({ ...user, receiverName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Receiver Mobile
                  </label>
                  <input
                    disabled={!isEditing}
                    className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                    value={user.receiverMobile}
                    onChange={(e) =>
                      setUser({ ...user, receiverMobile: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    House No / Floor
                  </label>
                  <input
                    disabled={!isEditing}
                    className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                    value={user.houseNo}
                    onChange={(e) =>
                      setUser({ ...user, houseNo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Building Name
                  </label>
                  <input
                    disabled={!isEditing}
                    className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                    value={user.buildingName}
                    onChange={(e) =>
                      setUser({ ...user, buildingName: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
