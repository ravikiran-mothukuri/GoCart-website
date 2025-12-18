import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/delivery/delivery.css';
import { useContext } from "react";
import { AuthContext } from "../pages/AuthContext";

const DeliveryProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    mobile: '',
    vehicle: 'Bike',
    city: 'Hyderabad',
    currentLatitude: 17.385044,
    currentLongitude: 78.486671
  });
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  // const deliveryToken = localStorage.getItem("deliveryToken");
  const { deliveryToken } = useContext(AuthContext);

  useEffect(() => {

    if(!deliveryToken)
      return;

    fetchProfile();
  }, [deliveryToken]);

  const cancelEdit = () => {
    setIsEditing(false);
    fetchProfile(); // reload original data
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
          headers: {
            Authorization: `Bearer ${deliveryToken}`,
          },
        }
      );

      alert("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
      console.error(err);
    }
  };



  const fetchProfile = async () => {
    try {
      
      const res= await axios.get(`${import.meta.env.VITE_API_URL}/api/delivery/profile`,{
        headers:{
          Authorization: `Bearer ${deliveryToken}`,
        },
      })

     

      const d= res.data.partner;
      
      setProfile({
        name: d.name || "User" ,
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
      alert("Geolocation is not supported by your browser");
      return;
    }

    
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            
            // eslint-disable-next-line no-unused-vars
            const res = await axios.put(
              `${import.meta.env.VITE_API_URL}/api/delivery/updateLocation`,
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

            // console.log(res);
            setProfile(prev => ({
              ...prev,
              currentLatitude: position.coords.latitude,
              currentLongitude: position.coords.longitude
            }));

            alert("Location updated successfully!");
          } catch (err) {
            alert("Failed to update location");
            console.error(err);
          }
        },
        (error) => {
          alert("Please enable location services");
          console.error(error);
        }
      );
    
  };

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <h2>👤 My Profile</h2>

      <div className="profile-card">
        <p>
          <strong>Name:</strong>{" "}
          {isEditing ? (
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          ) : (
            profile.name
          )}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {isEditing ? (
            <input
              value={profile.mobile}
              onChange={(e) =>
                setProfile({ ...profile, mobile: e.target.value })
              }
            />
          ) : (
            profile.mobile
          )}
        </p>

        <p>
          <strong>Vehicle:</strong>{" "}
          {isEditing ? (
            <select
              value={profile.vehicle}
              onChange={(e) =>
                setProfile({ ...profile, vehicle: e.target.value })
              }
            >
              <option value="BIKE">Bike</option>
              <option value="SCOOTER">Scooter</option>
            </select>
          ) : (
            profile.vehicle
          )}
        </p>

        <p>
          <strong>Status:</strong> {profile.status}
        </p>
      </div>

      <div className="profile-actions">
        {isEditing ? (
          <>
            <button className="save" onClick={saveProfile}>Save</button>
            <button className="cancel" onClick={cancelEdit}>Cancel</button>
          </>
        ) : (
          <button className="edit" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>



      {/* Location Section */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#065f46', 
          marginBottom: '20px' 
        }}>
          📍 Location
        </h3>
        
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          border: '2px solid #d1fae5',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#374151', 
            marginBottom: '12px' 
          }}>
            <strong>Latitude:</strong> {profile.currentLatitude.toFixed(6)}
          </p>
          <p style={{ 
            fontSize: '16px', 
            color: '#374151', 
            marginBottom: '20px' 
          }}>
            <strong>Longitude:</strong> {profile.currentLongitude.toFixed(6)}
          </p>
          
          <button 
            className="btn"
            onClick={updateLocation}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            📍 Update Current Location
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#065f46', 
          marginBottom: '20px' 
        }}>
          📊 Statistics
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            border: '2px solid #d1fae5',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#10b981',
              margin: '0 0 8px 0'
            }}>
              156
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            }}>
              Total Deliveries
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            border: '2px solid #d1fae5',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#10b981',
              margin: '0 0 8px 0'
            }}>
              4.8★
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            }}>
              Average Rating
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            border: '2px solid #d1fae5',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#10b981',
              margin: '0 0 8px 0'
            }}>
              98%
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            }}>
              On-Time Rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;